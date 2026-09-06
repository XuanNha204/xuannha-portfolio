import assert from "node:assert/strict";
import { mock } from "node:test";
import nodemailer from "nodemailer";
import { contactMail, gmailConfig, sendContactNotification } from "../src/lib/contact-email";

async function main() {
  // Intentionally do not load .env: all delivery in this test is mocked.
  process.env.GMAIL_USER = "owner@example.com";
  process.env.GMAIL_APP_PASSWORD = "abcd efgh ijkl mnop";
  process.env.CONTACT_NOTIFICATION_EMAIL = "inbox@example.com";
  assert.equal(gmailConfig()?.password, "abcdefghijklmnop");
  const data = { name: "Visitor\r\nBcc: attacker@example.com", email: "visitor@example.com", content: "Hello <script>example</script>" };
  const mail = contactMail(data, "owner@example.com", "inbox@example.com");
  assert.equal(mail.from.address, "owner@example.com");
  assert.equal(mail.to, "inbox@example.com");
  assert.equal(mail.replyTo.address, data.email);
  assert.ok(!/[\r\n]/.test(mail.subject));
  const stream = nodemailer.createTransport({ streamTransport: true, buffer: true });
  const generated = await stream.sendMail(mail);
  assert.ok(generated.message.toString().includes("Content-Type: text/plain"));
  let closed = 0;
  const transport = mock.method(nodemailer, "createTransport", () => ({
    sendMail: async () => ({ accepted: ["inbox@example.com"] }), close: () => { closed++; },
  }));
  assert.equal(await sendContactNotification(data), "sent");
  transport.mock.mockImplementation(() => ({sendMail: async () => { throw new Error("simulated SMTP failure"); }, close: () => { closed++; }}));
  assert.equal(await sendContactNotification(data), "failed");
  assert.equal(closed, 2);
  process.env.GMAIL_APP_PASSWORD = "";
  assert.equal(await sendContactNotification(data), "not_configured");
  assert.equal(transport.mock.callCount(), 2);
  mock.restoreAll();
  console.log("PASS: email recipient, Reply-To, plain-text formatting, success/failure and missing credentials. No email sent.");
}
main().catch(error => { mock.restoreAll(); console.error(error.message); process.exitCode = 1; });
