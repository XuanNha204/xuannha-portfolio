import { mkdtemp, cp, symlink, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { once } from "node:events";
import { createServer } from "node:http";

async function main() {
  const root = process.cwd();
  loadEnvConfig(root);
  const uri = new URL(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/xuannha-dev");
  if (!["127.0.0.1", "localhost"].includes(uri.hostname)) throw new Error("Fixture requires local MongoDB.");
  const database = "portfolio_verify_" + Date.now();
  uri.pathname = "/" + database;
  const fixture = await mkdtemp(path.join(tmpdir(), "portfolio-verify-"));
  const password = randomUUID() + "!Aa9";
  const provider = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = JSON.parse(body);
    if (req.url !== "/v1/chat/completions" || !payload.stream || payload.messages[0]?.role !== "system") { res.writeHead(400).end(); return; }
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.write('data: {"choices":[{"delta":{"content":"Fixture "}}]}\n\n');
    res.end('data: {"choices":[{"delta":{"content":"answer."}}]}\n\ndata: [DONE]\n\n');
  });
  provider.listen(0, "127.0.0.1");
  await once(provider, "listening");
  const address = provider.address();
  if (!address || typeof address === "string") throw new Error("Mock provider missing port");
  const env = { ...process.env, NODE_ENV: "production" as const, MONGODB_URI: uri.toString(), ADMIN_EMAIL: "fixture@example.com", ADMIN_PASSWORD: password, AUTH_TRUST_HOST: "true", CHAT_PROVIDER_ORDER: "openai", OPENAI_API_KEY: "fixture-only", OPENAI_BASE_URL: `http://127.0.0.1:${address.port}/v1`, OPENAI_MODEL: "fixture" };
  let server: ReturnType<typeof spawn> | undefined;
  // Fixture contacts must never send to a real mailbox inherited from local env.
  Object.assign(env, { GMAIL_USER: "", GMAIL_APP_PASSWORD: "", CONTACT_NOTIFICATION_EMAIL: "" });
  const connection = await mongoose.createConnection(uri.toString(), { autoIndex: false }).asPromise();
  try {
    await connection.collection("users").insertOne({ name: "Portfolio Fixture", email: env.ADMIN_EMAIL, password: await bcrypt.hash(password, 12), role: "owner", about: "Giới thiệu ngắn để kiểm tra bố cục.", createdAt: new Date(), updatedAt: new Date() });
    await connection.collection("sitesettings").insertOne({ siteName: "Portfolio Fixture", seo: {}, theme: "dark", maintenanceMode: false });
    await cp(path.join(root, ".next"), path.join(fixture, ".next"), { recursive: true, filter: (source) => !source.startsWith(path.join(root, ".next", "cache")) });
    await cp(path.join(root, "public"), path.join(fixture, "public"), { recursive: true });
    await cp(path.join(root, "next.config.ts"), path.join(fixture, "next.config.ts"));
    await cp(path.join(root, "package.json"), path.join(fixture, "package.json"));
    await symlink(path.join(root, "node_modules"), path.join(fixture, "node_modules"), "junction");
    server = spawn(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "start", "--port", "3202"], { cwd: fixture, env, windowsHide: true, stdio: "ignore" });
    for (let count = 0; count < 60; count++) {
      try { if ((await fetch("http://localhost:3202/api/auth/csrf")).ok) break; } catch {}
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const verify = spawn(process.execPath, ["--import", "tsx", "scripts/verify-compact.ts", "http://localhost:3202", "--mutations"], { cwd: root, env, windowsHide: true, stdio: "inherit" });
    const [code] = await once(verify, "exit");
    if (code !== 0) throw new Error("Fixture verification failed");
    const chat = await fetch("http://localhost:3202/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({messages: [{role: "user", content: "Hello"}]}) });
    if (chat.status !== 200) throw new Error("Chat streaming HTTP " + chat.status);
    const answer = (await chat.text()).trim().split("\n").map((line) => JSON.parse(line).delta || "").join("");
    if (answer !== "Fixture answer.") throw new Error("Chat streaming mismatch");
    console.log("PASS: chat streaming end-to-end with isolated mock provider.");
    if (process.argv.includes("--browser")) {
      // Keep test credentials outside the workspace for local browser verification.
      await writeFile(path.join(root, ".next", "fixture-login.json"), JSON.stringify({ email: env.ADMIN_EMAIL, password }));
      console.log("Fixture ready for browser verification at http://localhost:3202. Press Ctrl+C to clean up.");
      await new Promise<void>((resolve) => { process.once("SIGINT", resolve); process.once("SIGTERM", resolve); });
    }
  } finally {
    provider.close();
    if (server && server.exitCode === null) { server.kill(); await once(server, "exit"); }
    if (!database.startsWith("portfolio_verify_")) throw new Error("Unexpected fixture database");
    await connection.dropDatabase();
    await connection.close();
    await rm(path.join(root, ".next", "fixture-login.json"), { force: true });
    if (path.dirname(path.resolve(fixture)) !== path.resolve(tmpdir()) || !path.basename(fixture).startsWith("portfolio-verify-")) {
      throw new Error("Unexpected temporary build path");
    }
    await rm(fixture, { recursive: true, force: true });
    console.log("Fixture database and temporary build removed.");
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Fixture failed"); process.exitCode = 1; });
