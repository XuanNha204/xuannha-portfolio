import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import { resolveSiteContent } from "../src/lib/site-content";
import type { SiteSettingsDTO, SocialLinkDTO, MessageDTO, Paginated } from "../src/types";

const base = process.argv.find((arg) => /^https?:/.test(arg)) || "http://localhost:3200";
const mutate = process.argv.includes("--mutations");
const cookies = new Map<string, string>();
async function request(path: string, init: RequestInit = {}, authenticated = false) {
  const headers = new Headers(init.headers);
  if (authenticated) headers.set("cookie", [...cookies].map(([key, value]) => `${key}=${value}`).join("; "));
  const response = await fetch(base + path, { ...init, headers, redirect: "manual" });
  if (authenticated) for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(";")[0]; const index = pair.indexOf("=");
    cookies.set(pair.slice(0, index), pair.slice(index + 1));
  }
  return response;
}
function json(method: string, body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
async function main() {
  for (const path of ["/"]) {
    const response = await request(path);
    assert.equal(response.status, 200, path);
    const body = await response.text();
    assert.ok(body.includes("<h1"), path + " heading");
    assert.ok(!body.includes('href="/blog"') && !body.includes('href="/projects"'), path + " retired links");
  }
  const sitemap = await (await request("/sitemap.xml")).text();
  assert.equal((sitemap.match(/<loc>/g) || []).length, 1);
  assert.equal((await request("/admin")).status, 307);
  for (const path of ["/api/profile", "/api/settings", "/api/social-links", "/api/messages", "/api/media"]) {
    assert.equal((await request(path)).status, 401, path);
  }
  assert.equal((await request("/api/settings", json("PUT", {}))).status, 401);
  for (const [path, destination] of [["/blog/old-post", "/"], ["/projects/old-project", "/#work"], ["/about", "/#about"], ["/contact", "/#contact"], ["/links", "/#footer"], ["/admin/posts", "/admin"]]) {
    const result = await request(path); assert.ok([307, 308].includes(result.status)); const target = new URL(result.headers.get("location")!, base); assert.equal(target.pathname + target.hash, destination);
  }
  for (const path of ["/api/posts", "/api/projects", "/api/analytics/track", "/rss.xml"]) {
    assert.equal((await request(path)).status, 404, path);
  }
  assert.equal((await request("/api/contact", json("POST", { name: "a", email: "bad", content: "short" }))).status, 422);
  assert.equal((await request("/api/chat", json("POST", { messages: [] }))).status, 422);
  assert.equal((await request("/api/chat", json("POST", { messages: [{role: "user", content: "x".repeat(21_000)}] }))).status, 413);
  for (const asset of ["hero.mp4", "portrait.png", "pet-chat.webm"]) assert.equal((await request("/media/" + asset)).status, 200);
  console.log("PASS: single page, assets, sitemap, redirects, access control, contact/chat validation.");
  if (!mutate) return;
  assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Mutation tests only run locally");
  loadEnvConfig(process.cwd());
  assert.ok(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD, "Admin test credentials missing");
  const csrfResponse = await request("/api/auth/csrf", {}, true);
  const csrf = await csrfResponse.json() as { csrfToken: string };
  const login = await request("/api/auth/callback/credentials", {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, email: process.env.ADMIN_EMAIL!, password: process.env.ADMIN_PASSWORD!, callbackUrl: base + "/admin" }),
  }, true);
  assert.ok([200, 302, 303].includes(login.status), "Login response");
  const session = await (await request("/api/auth/session", {}, true)).json() as { user?: { role?: string } } | null;
  assert.equal(session?.user?.role, "owner", "Owner login: credentials do not match this database");
  assert.equal((await request("/admin", {}, true)).status, 200);
  const original = await (await request("/api/settings", {}, true)).json() as SiteSettingsDTO;
  const marker = "Kiểm tra nội dung " + Date.now();
  let socialId: string | undefined;
  let messageId: string | undefined;
  let settingsChanged = false;
  try {
    const change = { ...original, content: { ...resolveSiteContent(original.content), homeTitle: marker } };
    const saved = await request("/api/settings", json("PUT", change), true);
    assert.equal(saved.status, 200);
    settingsChanged = true;
    const read = await (await request("/api/settings", {}, true)).json() as SiteSettingsDTO;
    assert.equal(read.content?.homeTitle, marker, "Content persisted");
    assert.ok((await (await request("/")).text()).includes(marker), "Public cache invalidated");
    assert.equal((await request("/api/settings", json("PUT", { ...change, content: { ...change.content, homeTitle: "x".repeat(101) } }), true)).status, 422);
    const social = await request("/api/social-links", json("POST", { platform: "other", label: marker, url: "https://example.com", order: 999, visible: true }), true);
    assert.equal(social.status, 201);
    socialId = ((await social.json()) as SocialLinkDTO)._id;
    assert.ok((await (await request("/")).text()).includes('href="https://example.com"'), "Visible link displayed");
    assert.equal((await request("/api/social-links/" + socialId, json("PUT", { platform: "other", label: marker, url: "https://example.com", order: 999, visible: false }), true)).status, 200);
    assert.ok(!(await (await request("/")).text()).includes('href="https://example.com"'), "Hidden link omitted");
    assert.equal((await request("/api/social-links", json("POST", { platform: "other", label: marker, url: "javascript:alert(1)" }), true)).status, 422);
    const contact = await request("/api/contact", json("POST", { name: "Local verification", email: "verification@example.com", content: marker }));
    assert.equal(contact.status, 201);
    const inbox = await (await request("/api/messages?limit=100", {}, true)).json() as Paginated<MessageDTO>;
    messageId = inbox.items.find((item) => item.content === marker)?._id;
    assert.ok(messageId, "Contact delivered to CMS");
    assert.equal((await request("/api/messages/" + messageId, json("PATCH", { read: true }), true)).status, 200);
    console.log("PASS: owner login, CMS rendering, content persistence + revalidation, link CRUD/visibility, contact delivery.");
  } finally {
    if (socialId) assert.equal((await request("/api/social-links/" + socialId, { method: "DELETE" }, true)).status, 200);
    if (messageId) assert.equal((await request("/api/messages/" + messageId, { method: "DELETE" }, true)).status, 200);
    if (settingsChanged) {
      assert.equal((await request("/api/settings", json("PUT", { ...original, content: resolveSiteContent(original.content) }), true)).status, 200);
      assert.ok(!(await (await request("/")).text()).includes(marker), "Original homepage restored");
    }
    console.log("Cleanup complete: temporary content removed, original settings restored.");
  }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Verification failed"); process.exitCode = 1; });
