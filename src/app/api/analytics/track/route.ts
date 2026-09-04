import { after, NextRequest, NextResponse } from "next/server";
import { trackPageView } from "@/services/analytics.service";
import { rateLimit } from "@/lib/rate-limit";
import { logPerformance, serverTiming } from "@/lib/performance";

export async function POST(req: NextRequest) {
  const startedAt = performance.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = rateLimit(`track:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!success) return NextResponse.json({ ok: false }, { status: 429 });

  const parseStartedAt = performance.now();
  let parseMs = 0;
  try {
    const { path } = await req.json();
    parseMs = performance.now() - parseStartedAt;
    if (typeof path === "string" && path.startsWith("/") && !path.startsWith("/admin")) {
      const trackedPath = path.slice(0, 200);
      after(() => trackPageView(trackedPath));
    }
  } catch {
    parseMs = performance.now() - parseStartedAt;
    // ignore malformed beacons
  }

  const totalMs = performance.now() - startedAt;
  logPerformance("api.analytics.track", totalMs, { parseMs: parseMs.toFixed(1) });

  const response = NextResponse.json({ ok: true });
  response.headers.set(
    "Server-Timing",
    [serverTiming("parse", parseMs), serverTiming("handler", totalMs)].join(", ")
  );
  return response;
}
