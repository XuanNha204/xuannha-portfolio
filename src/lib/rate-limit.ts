type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory sliding-window rate limiter.
 * Suitable for a single-instance deployment; swap for Redis when scaling out.
 */
export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): { success: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

// Periodically clear expired buckets to avoid unbounded growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 10 * 60_000).unref?.();
