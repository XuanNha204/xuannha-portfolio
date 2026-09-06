import assert from "node:assert/strict";
import { loadEnvConfig } from "@next/env";
import mongoose from "mongoose";

async function main() {
  loadEnvConfig(process.cwd());
  const uri = new URL(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/xuannha-dev");
  if (!["127.0.0.1", "localhost"].includes(uri.hostname)) {
    throw new Error("Security verification requires local MongoDB.");
  }
  const database = `portfolio_security_verify_${Date.now()}`;
  uri.pathname = `/${database}`;
  process.env.MONGODB_URI = uri.toString();
  process.env.AUTH_SECRET = "fixture-auth-secret-with-at-least-32-characters";

  const { getClientIp } = await import("../src/lib/client-ip");
  const {
    clearLoginFailures,
    compareWithDummyPassword,
    loginAllowed,
    recordLoginFailure,
  } = await import("../src/lib/auth-security");
  const {
    isProviderAvailable,
    recordProviderFailure,
    recordProviderSuccess,
  } = await import("../src/lib/chat-providers");

  try {
    process.env.CLIENT_IP_HEADER = "x-forwarded-for";
    const headers = new Headers({ "x-forwarded-for": "198.51.100.10, 203.0.113.20" });
    assert.equal(getClientIp(headers), "203.0.113.20", "Trusted proxy must use its right-most peer address");
    assert.equal(await compareWithDummyPassword("not-the-dummy-password"), false);

    const email = "missing@example.com";
    const ip = "203.0.113.20";
    assert.equal(await loginAllowed(email, ip), true);
    for (let attempt = 0; attempt < 6; attempt += 1) {
      await recordLoginFailure(email, ip);
    }
    assert.equal(await loginAllowed(email, ip), false, "Account throttle must persist after repeated failures");
    await clearLoginFailures(email, ip);
    assert.equal(await loginAllowed(email, ip), true, "Successful authentication must clear its throttle");
    const provider = { id: "fixture", apiKey: "hidden", baseUrl: "https://example.invalid", model: "fixture" };
    assert.equal(isProviderAvailable(provider), true);
    recordProviderFailure(provider);
    recordProviderFailure(provider);
    recordProviderFailure(provider);
    assert.equal(isProviderAvailable(provider), false, "Repeated provider failures must open the circuit");
    recordProviderSuccess(provider);
    assert.equal(isProviderAvailable(provider), true, "A successful provider response must close the circuit");
    console.log("PASS: trusted proxy IP, persistent login throttle and AI provider circuit breaker.");
  } finally {
    if (!database.startsWith("portfolio_security_verify_")) throw new Error("Unexpected test database");
    if (mongoose.connection.readyState) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Security verification failed");
  process.exitCode = 1;
});
