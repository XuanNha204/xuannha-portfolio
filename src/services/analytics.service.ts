import { cache } from "react";
import { dbConnect } from "@/lib/db";
import { logPerformance } from "@/lib/performance";
import { Analytics } from "@/models/Analytics";

/** Record a page view without ever surfacing analytics failures to the caller. */
export async function trackPageView(path: string): Promise<void> {
  const totalStartedAt = performance.now();
  let connectMs = 0;
  let queryMs = 0;

  try {
    const connectStartedAt = performance.now();
    await dbConnect();
    connectMs = performance.now() - connectStartedAt;

    const date = new Date().toISOString().slice(0, 10);
    const queryStartedAt = performance.now();
    await Analytics.updateOne({ path, date }, { $inc: { views: 1 } }, { upsert: true });
    queryMs = performance.now() - queryStartedAt;

    logPerformance("analytics.track", performance.now() - totalStartedAt, {
      connectMs: connectMs.toFixed(1),
      queryMs: queryMs.toFixed(1),
      outcome: "ok",
    });
  } catch {
    logPerformance(
      "analytics.track",
      performance.now() - totalStartedAt,
      {
        connectMs: connectMs.toFixed(1),
        queryMs: queryMs.toFixed(1),
        outcome: "error",
      },
      true
    );
  }
}

/** The public homepage only needs this single aggregate, not all dashboard queries. */
export const getTotalViews = cache(async (): Promise<number> => {
  try {
    await dbConnect();
    const result = await Analytics.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } },
    ]);
    return result[0]?.total ?? 0;
  } catch {
    return 0;
  }
});
