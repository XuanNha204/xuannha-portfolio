"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUp, ArrowUpRight, RotateCcw, Square, X } from "lucide-react";
type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget({ name, greeting }: { name: string; greeting: string }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const update = () => {
      if (document.hidden || open) video?.pause();
      else video?.play().catch(() => {});
    };
    update();
    document.addEventListener("visibilitychange", update);
    return () => { document.removeEventListener("visibilitychange", update); };
  }, [open]);
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);
  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [messages, busy, error]);
  useEffect(() => () => abortRef.current?.abort(), []);

  function close() {
    abortRef.current?.abort();
    setOpen(false);
    launcherRef.current?.focus();
  }
  async function send(text = draft, retry = false) {
    if (!text.trim() || busy) return;
    const question = text.trim().slice(0, 1200);
    const lastQuestion = messages.map((message) => message.role).lastIndexOf("user");
    const previous = retry && lastQuestion >= 0 ? messages.slice(0, lastQuestion) : messages;
    const history: Message[] = [...previous.filter((message) => message.content), { role: "user" as const, content: question }].slice(-10);
    setMessages([...history, { role: "assistant", content: "" }]);
    setDraft(""); setError(""); setBusy(true);
    const abort = new AbortController();
    abortRef.current = abort;
    let answer = "";
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }), signal: abort.signal,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Cam chưa kết nối được. Bạn thử lại nhé.");
      }
      if (!response.body) throw new Error("Kết nối bị gián đoạn.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const event = JSON.parse(line) as { delta?: string; error?: string };
            if (event.error) throw new Error(event.error);
            if (event.delta) {
              answer += event.delta;
              setMessages([...history, { role: "assistant", content: answer }]);
            }
          }
        }
      } finally { reader.releaseLock(); }
      if (!answer) throw new Error("Cam chưa nhận được câu trả lời. Bạn thử lại nhé.");
    } catch (err) {
      if (!abort.signal.aborted) setError(err instanceof Error ? err.message : "Kết nối bị gián đoạn.");
      if (!answer) setMessages(history);
    } finally { setBusy(false); abortRef.current = null; }
  }
  return <div className="chat-dock">
    {open && <aside ref={panelRef} id="cam-chat" role="dialog" aria-label={`Trò chuyện với ${name}`} className="chat-panel" onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
    }}>
      <div className="chat-header"><div className="chat-avatar"><Image src="/media/pet-chat-avatar.png" alt="" width={40} height={40} /></div><div><h2>{name}<span>AI</span></h2><p>Người bạn nhỏ của Nhã</p></div>
        <button type="button" aria-label="Cuộc trò chuyện mới" disabled={busy} onClick={() => { setMessages([]); setError(""); }}><RotateCcw size={16} /></button>
        <button type="button" aria-label="Đóng trò chuyện" onClick={close}><X size={19} /></button>
      </div>
      <div className="chat-log" ref={logRef} role="log" aria-label="Tin nhắn" aria-live="polite" aria-relevant="additions text">
        <div className="chat-welcome"><span>CHÀO BẠN, MÌNH LÀ {name.toUpperCase()} 👋</span><p>{greeting}</p></div>
        {messages.map((message, index) => message.content && <div key={index} className={`chat-message chat-${message.role}`}><span className="sr-only">{message.role === "user" ? "Bạn: " : name + ": "}</span>{message.content}</div>)}
        {busy && !messages.at(-1)?.content && <div className="chat-typing" role="status"><i /><i /><i /><span className="sr-only">Đang trả lời</span></div>}
        {error && <div className="chat-error" role="alert">{error}<button type="button" onClick={() => { const last = [...messages].reverse().find((message) => message.role === "user"); if (last) void send(last.content, true); }}>Thử lại</button></div>}
        {!messages.length && <div className="chat-suggestions">{["Giới thiệu về Nhã", "Nhã có những kỹ năng gì?", "Mình muốn hợp tác"].map((text) => <button key={text} onClick={() => void send(text)} disabled={busy}>{text}<ArrowUpRight size={13} /></button>)}</div>}
      </div>
      <form className="chat-input" onSubmit={(event) => { event.preventDefault(); void send(); }}>
        <input ref={inputRef} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Hỏi Cam một chút…" aria-label="Tin nhắn cho Cam" maxLength={1200} autoComplete="off" />
        {busy ? <button type="button" aria-label="Dừng trả lời" onClick={() => abortRef.current?.abort()}><Square size={14} /></button> : <button type="submit" aria-label="Gửi tin nhắn" disabled={!draft.trim()}><ArrowUp size={19} /></button>}
      </form>
      <p className="chat-disclaimer">Trợ lý AI có thể nhầm. <a href="#contact" onClick={close}>Trao đổi trực tiếp với Nhã ↗</a></p>
    </aside>}
    <button type="button" ref={launcherRef} className="pet-launcher" aria-label={open ? "Đóng trợ lý AI" : `Trò chuyện với ${name}, trợ lý AI`} aria-expanded={open} aria-controls="cam-chat" onClick={() => open ? close() : setOpen(true)}>
      <span className="pet-speech">{open ? "Hẹn bạn lát nữa!" : "Hỏi Cam nhé!"}</span>
      <video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster="/media/pet-chat-poster.png" aria-hidden="true"><source src="/media/pet-chat.webm" type="video/webm" /><source src="/media/pet-chat.mp4" type="video/mp4" /></video>
      <span className="pet-shadow" />
    </button>
  </div>;
}
