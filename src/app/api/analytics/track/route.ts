import { NextRequest, NextResponse } from "next/server";
import { trackPageView } from "@/services/stats.service";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = rateLimit(`track:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!success) return NextResponse.json({ ok: false }, { status: 429 });

  try {
    const { path } = await req.json();
    if (typeof path === "string" && path.startsWith("/") && !path.startsWith("/admin")) {
      await trackPageView(path.slice(0, 200));
    }
  } catch {
    // ignore malformed beacons
  }
  return NextResponse.json({ ok: true });
}
