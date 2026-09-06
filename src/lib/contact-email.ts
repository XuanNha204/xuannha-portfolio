import nodemailer from "secure-mailer";
import { z } from "zod";

export type EmailNotificationStatus = "sent" | "failed" | "not_configured";
type Contact = { name: string; email: string; subject?: string; content: string };

export function gmailConfig() {
  const parsed = z.object({
    user: z.string().email(),
    password: z.string().min(1),
    recipient: z.string().email(),
  }).safeParse({
    user: process.env.GMAIL_USER?.trim(),
    password: process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, ""),
    recipient: (process.env.CONTACT_NOTIFICATION_EMAIL || process.env.GMAIL_USER)?.trim(),
  });
  return parsed.success ? parsed.data : null;
}

export function createGmailTransport(config: NonNullable<ReturnType<typeof gmailConfig>>) {
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: config.user, pass: config.password },
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
    disableFileAccess: true,
    disableUrlAccess: true,
  });
}

export function contactMail(data: Contact, sender: string, recipient: string) {
  return {
    from: { name: "Xnha.Dev", address: sender },
    to: recipient,
    replyTo: { name: data.name, address: data.email },
    subject: `[Xnha.Dev] Lời nhắn mới từ ${data.name.replace(/[\r\n]/g, " ")}`,
    text: [
      "Bạn có lời nhắn mới từ website Xnha.Dev.",
      "", `Tên: ${data.name}`, `Email: ${data.email}`,
      ...(data.subject ? [`Chủ đề: ${data.subject}`] : []),
      "", data.content, "", "Nhấn Trả lời để phản hồi trực tiếp cho người gửi.",
      "Tin nhắn cũng đã được lưu trong trang quản trị.",
    ].join("\n"),
    disableFileAccess: true,
    disableUrlAccess: true,
  };
}

export async function sendContactNotification(data: Contact): Promise<EmailNotificationStatus> {
  const config = gmailConfig();
  if (!config) return "not_configured";
  const transport = createGmailTransport(config);
  try {
    const result = await transport.sendMail(contactMail(data, config.user, config.recipient));
    return result.accepted?.length ? "sent" : "failed";
  } catch {
    // Do not log credentials, message content, or raw SMTP responses.
    console.error("Contact email notification failed; the message remains in the admin inbox.");
    return "failed";
  } finally { transport.close(); }
}
