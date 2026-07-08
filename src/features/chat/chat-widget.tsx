"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  ImagePlus,
  Loader2,
  MessageCircle,
  Mic,
  Send,
  Square,
  Volume2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useSitePreferences } from "@/components/site/site-preferences";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string; image?: string };

// ── Web Speech API (nhận diện giọng nói) — khai báo tối thiểu, tránh any ──
type SpeechResult = { 0: { transcript: string } };
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (e: { results: ArrayLike<SpeechResult> }) => void;
  onend: () => void;
  onerror: (e: { error?: string }) => void;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognition(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

/** Đọc ảnh + thu nhỏ (tối đa 1024px, JPEG 0.8) để giảm dung lượng gửi lên. */
async function fileToDownscaledDataUrl(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(file);
  });

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("img"));
      image.src = dataUrl;
    });

    const maxDim = 1024;
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    if (scale === 1 && dataUrl.length < 1_500_000) return dataUrl;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return dataUrl;
  }
}

/** Bỏ cú pháp Markdown cơ bản để đọc to nghe tự nhiên hơn. */
function plainText(md: string): string {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`#>]/g, "")
    .trim();
}

export function ChatWidget() {
  const { t, language } = useSitePreferences();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const noticeTimer = useRef<number | null>(null);

  const speechLang = language === "zh" ? "zh-CN" : language === "en" ? "en-US" : "vi-VN";

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Mobile: chat full-screen nên khóa cuộn trang phía sau khi đang mở.
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  useEffect(() => {
    // Không auto-focus trên mobile để bàn phím không bật lên ngay khi mở chat.
    if (open && !isMobile) inputRef.current?.focus();
  }, [open, isMobile]);

  // Textarea tự giãn theo nội dung, tối đa ~5 dòng (120px) rồi cuộn dọc bên trong.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, open]);

  // Dừng nghe/đọc khi đóng khung chat.
  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setListening(false);
      setSpeakingIdx(null);
    }
  }, [open]);

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000);
  }

  function toggleVoice() {
    const SR = getSpeechRecognition();
    if (!SR) return;
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new SR();
    rec.lang = speechLang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results)
        .map((r) => r[0].transcript)
        .join("");
      setInput(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = (e) => {
      setListening(false);
      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        showNotice(t("chat.micDenied"));
      } else if (e?.error && e.error !== "aborted" && e.error !== "no-speech") {
        showNotice(t("chat.error"));
      }
    };
    recognitionRef.current = rec;
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      showNotice(t("chat.micDenied"));
    }
  }

  function speak(idx: number, text: string) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    if (speakingIdx === idx) {
      setSpeakingIdx(null);
      return;
    }
    const utter = new SpeechSynthesisUtterance(plainText(text));
    utter.lang = speechLang;
    // cancel() ở trên khiến onend của tin đang đọc trước đó vẫn bắn —
    // chỉ clear khi index còn là tin hiện tại để không xóa nhầm trạng thái mới.
    const clear = () => setSpeakingIdx((prev) => (prev === idx ? null : prev));
    utter.onend = clear;
    utter.onerror = clear;
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utter);
  }

  async function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    try {
      setImage(await fileToDownscaledDataUrl(file));
    } catch {
      setImage(null);
    }
  }

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    const img = image;
    if ((!text && !img) || loading) return;

    const history: ChatMessage[] = [
      ...messages,
      { role: "user", content: text, image: img || undefined },
    ];
    setMessages(history);
    setInput("");
    setImage(null);
    setLoading(true);

    // Chỉ đính ảnh cho lượt cuối; các lượt trước gửi text để tiết kiệm dung lượng.
    const apiMessages = history.map((m, idx) => {
      const isLast = idx === history.length - 1;
      if (m.role === "user" && m.image && isLast) {
        return {
          role: m.role,
          content: [
            { type: "text", text: m.content.trim() || t("chat.describeImage") },
            { type: "image_url", image_url: { url: m.image } },
          ],
        };
      }
      return {
        role: m.role,
        content: m.content.trim() || (m.image ? t("chat.describeImage") : ""),
      };
    });

    // Timeout 60s: chỉ hủy nếu chưa nhận được byte nào (stream đã chạy thì để chạy tiếp).
    const controller = new AbortController();
    let gotFirstChunk = false;
    const timeoutTimer = window.setTimeout(() => {
      if (!gotFirstChunk) controller.abort();
    }, 60_000);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error("chat_failed");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        gotFirstChunk = true;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: acc };
          return next;
        });
      }
      if (!acc.trim()) {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: t("chat.error") };
          return next;
        });
      }
    } catch (err) {
      const timedOut = err instanceof Error && err.name === "AbortError";
      const errorText = timedOut ? t("chat.timeout") : t("chat.error");
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && !last.content) {
          next[next.length - 1] = { role: "assistant", content: errorText };
        } else {
          next.push({ role: "assistant", content: errorText });
        }
        return next;
      });
    } finally {
      window.clearTimeout(timeoutTimer);
      setLoading(false);
    }
  }

  const suggestions = [t("chat.suggest1"), t("chat.suggest2"), t("chat.suggest3")];

  // Chỉ báo "đang trả lời": ba chấm nhấp nháy + nhãn chữ, hiện liên tục trong lúc chờ.
  const typingIndicator = (
    <span className="flex items-center gap-2">
      <span className="flex gap-1" aria-hidden>
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
            style={{ animationDelay: `${d * 0.15}s` }}
          />
        ))}
      </span>
      <span className="text-xs">{t("chat.thinking")}</span>
    </span>
  );

  return (
    <>
      {/* Nút nổi */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("chat.close") : t("chat.open")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-secondary"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Bảng chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, y: 0, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed left-0 top-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-surface sm:bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:left-auto sm:right-5 sm:top-auto sm:h-[34rem] sm:max-h-[calc(100vh-8rem)] sm:w-[calc(100vw-2.5rem)] sm:max-w-sm sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
          >
            {/* Header */}
            <div className="flex min-h-14 items-center gap-3 border-b border-border bg-primary px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white sm:pt-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t("chat.title")}</p>
                <p className="truncate text-xs text-white/70">
                  {listening ? t("chat.listening") : t("chat.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("chat.close")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Danh sách tin nhắn */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <>
                  <div className="flex gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Bot className="h-4 w-4" />
                    </span>
                    <div className="rounded-2xl rounded-tl-sm bg-border/40 px-3 py-2 text-sm text-secondary">
                      {t("chat.greeting")}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-9">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-secondary transition-colors hover:border-accent hover:text-accent"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                      <Bot className="h-4 w-4" />
                    </span>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "rounded-tr-sm bg-accent text-white"
                        : "rounded-tl-sm bg-border/40 text-secondary"
                    )}
                  >
                    {msg.image && (
                      <Image
                        src={msg.image}
                        alt=""
                        width={200}
                        height={200}
                        unoptimized
                        className="mb-2 max-h-40 w-auto rounded-lg"
                      />
                    )}

                    {msg.role === "assistant" ? (
                      msg.content ? (
                        <div className="prose-chat">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              a({ href, children }) {
                                const url = href ?? "#";
                                if (url.startsWith("/")) {
                                  return (
                                    <Link
                                      href={url}
                                      onClick={() => setOpen(false)}
                                      className="font-medium text-accent underline underline-offset-2"
                                    >
                                      {children}
                                    </Link>
                                  );
                                }
                                return (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-accent underline underline-offset-2"
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              p({ children }) {
                                return <p className="mb-2 last:mb-0">{children}</p>;
                              },
                              ul({ children }) {
                                return <ul className="mb-2 list-disc space-y-1 pl-4">{children}</ul>;
                              },
                              ol({ children }) {
                                return (
                                  <ol className="mb-2 list-decimal space-y-1 pl-4">{children}</ol>
                                );
                              },
                              code({ children }) {
                                return (
                                  <code className="rounded bg-border/60 px-1 py-0.5 text-xs">
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        loading && typingIndicator
                      )
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}

                    {msg.role === "assistant" && msg.content && (
                      <button
                        type="button"
                        onClick={() => speak(i, msg.content)}
                        aria-label={speakingIdx === i ? t("chat.stopAudio") : t("chat.readAloud")}
                        className={cn(
                          "mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs transition-colors",
                          speakingIdx === i
                            ? "bg-accent/15 text-accent"
                            : "text-muted hover:text-accent"
                        )}
                      >
                        {speakingIdx === i ? (
                          <>
                            <Square className="h-3 w-3" />
                            <span className="flex items-end gap-0.5" aria-hidden>
                              {[6, 9, 7].map((h, b) => (
                                <span
                                  key={b}
                                  className="w-0.5 animate-pulse rounded-full bg-current"
                                  style={{ height: `${h}px`, animationDelay: `${b * 0.15}s` }}
                                />
                              ))}
                            </span>
                            <span>{t("chat.stopAudio")}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="h-3 w-3" />
                            <span>{t("chat.readAloud")}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Bot className="h-4 w-4" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-border/40 px-3 py-2 text-sm text-muted">
                    {typingIndicator}
                  </div>
                </div>
              )}
            </div>

            {/* Ảnh đính kèm */}
            {image && (
              <div className="flex items-center gap-2 border-t border-border px-3 pt-2">
                <span className="relative">
                  <Image
                    src={image}
                    alt=""
                    width={48}
                    height={48}
                    unoptimized
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white"
                    aria-label={t("chat.close")}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}

            {/* Thông báo lỗi tạm thời (mic bị từ chối quyền...) */}
            {notice && (
              <div className="border-t border-border bg-danger/5 px-4 py-2 text-xs text-danger">
                {notice}
              </div>
            )}

            {/* Ô nhập */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-end gap-2 border-t border-border p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:pb-3"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={t("chat.attach")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-accent"
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={t("chat.mic")}
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-all",
                    listening
                      ? "bg-danger text-white ring-4 ring-danger/25"
                      : "text-muted hover:text-accent"
                  )}
                >
                  <Mic className={cn("h-5 w-5", listening && "animate-pulse")} />
                </button>
              )}

              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Enter gửi, Shift+Enter xuống dòng; bỏ qua khi đang gõ IME.
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={t("chat.placeholder")}
                maxLength={2000}
                rows={1}
                className="max-h-[7.5rem] min-h-11 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-base leading-6 text-primary outline-none transition-colors focus:border-accent sm:text-sm"
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !image)}
                aria-label={t("chat.send")}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-secondary disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
