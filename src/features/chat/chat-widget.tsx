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
  onerror: () => void;
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const speechLang = language === "zh" ? "zh-CN" : language === "en" ? "en-US" : "vi-VN";

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Dừng nghe/đọc khi đóng khung chat.
  useEffect(() => {
    if (!open) {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      setListening(false);
      setSpeakingIdx(null);
    }
  }, [open]);

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
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
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
    utter.onend = () => setSpeakingIdx(null);
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

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      if (!res.ok || !res.body) throw new Error("chat_failed");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
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
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: t("chat.error") }]);
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [t("chat.suggest1"), t("chat.suggest2"), t("chat.suggest3")];

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
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-secondary"
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
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed bottom-24 right-5 z-50 flex h-[34rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t("chat.title")}</p>
                <p className="truncate text-xs text-white/70">
                  {listening ? t("chat.listening") : t("chat.subtitle")}
                </p>
              </div>
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
                        loading && <Loader2 className="h-4 w-4 animate-spin" />
                      )
                    ) : (
                      <span className="whitespace-pre-wrap">{msg.content}</span>
                    )}

                    {msg.role === "assistant" && msg.content && (
                      <button
                        type="button"
                        onClick={() => speak(i, msg.content)}
                        aria-label={speakingIdx === i ? t("chat.stopAudio") : t("chat.readAloud")}
                        className="mt-1 inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-accent"
                      >
                        {speakingIdx === i ? (
                          <Square className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
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
                    <Loader2 className="h-4 w-4 animate-spin" />
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

            {/* Ô nhập */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-1.5 border-t border-border p-3"
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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:text-accent"
              >
                <ImagePlus className="h-5 w-5" />
              </button>

              {voiceSupported && (
                <button
                  type="button"
                  onClick={toggleVoice}
                  aria-label={t("chat.mic")}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                    listening
                      ? "bg-danger/10 text-danger"
                      : "text-muted hover:text-accent"
                  )}
                >
                  <Mic className={cn("h-5 w-5", listening && "animate-pulse")} />
                </button>
              )}

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chat.placeholder")}
                maxLength={2000}
                className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-primary outline-none transition-colors focus:border-accent"
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !image)}
                aria-label={t("chat.send")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-secondary disabled:opacity-40"
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
