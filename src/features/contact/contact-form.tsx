"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";

/** Native field validation keeps form/schema libraries out of the public bundle. */
export function ContactForm() {
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const data = { name: String(fields.get("name") || "").trim(), email: String(fields.get("email") || "").trim(), content: String(fields.get("content") || "").trim() };
    if (data.name.length < 2 || data.content.length < 10) {
      setResult({ ok: false, text: "Vui lòng nhập tên từ 2 ký tự và lời nhắn từ 10 ký tự." });
      return;
    }
    submitting.current = true; setBusy(true); setResult(null);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) { const body = await res.json().catch(() => null); throw new Error(body?.error || "Chưa gửi được. Bạn thử lại nhé."); }
      form.reset();
      setResult({ ok: true, text: "Đã nhận lời nhắn. Cảm ơn bạn đã kết nối!" });
    } catch (error) { setResult({ ok: false, text: error instanceof Error ? error.message : "Không thể kết nối. Vui lòng thử lại." }); }
    finally { submitting.current = false; setBusy(false); }
  }
  return <form onSubmit={onSubmit} className="contact-fields" aria-busy={busy}>
    <div><label htmlFor="contact-name">Tên của bạn</label>
      <input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
    </div>
    <div><label htmlFor="contact-email">Email</label>
      <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} />
    </div>
    <div><label htmlFor="contact-content">Bạn muốn cùng làm gì?</label>
      <textarea id="contact-content" name="content" rows={4} required minLength={10} maxLength={5000} placeholder="Một chút về ý tưởng của bạn…" />
    </div>
    <button type="submit" disabled={busy}>{busy ? "Đang gửi…" : "Gửi lời nhắn"} <ArrowUpRight size={18} aria-hidden /></button>
    {result && <p role={result.ok ? "status" : "alert"} className={result.ok ? "contact-success" : "contact-error"}>{result.text}</p>}
  </form>;
}
