import { loadEnvConfig } from "@next/env";
import { createGmailTransport, gmailConfig } from "../src/lib/contact-email";

async function main() {
  loadEnvConfig(process.cwd());
  const config = gmailConfig();
  if (!config) throw new Error("Set GMAIL_USER, GMAIL_APP_PASSWORD and CONTACT_NOTIFICATION_EMAIL in .env.local.");
  const transport = createGmailTransport(config);
  try {
    await transport.verify();
    console.log("Gmail SMTP authentication verified. No email was sent.");
  } catch { throw new Error("Gmail authentication failed. Check the App Password and network connection."); }
  finally { transport.close(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
