type PerformanceDetails = Record<string, string | number | boolean | undefined>;

const explicitLogging = process.env.PERFORMANCE_LOGGING === "1";
const slowThresholdMs = Number(process.env.PERFORMANCE_SLOW_MS ?? 250);

function shouldLog(durationMs: number, force: boolean) {
  return force || explicitLogging || (process.env.NODE_ENV === "development" && durationMs >= slowThresholdMs);
}

/**
 * Lightweight, server-only timing logger. In development it only emits slow
 * operations; set PERFORMANCE_LOGGING=1 to emit every measured operation.
 */
export function logPerformance(
  operation: string,
  durationMs: number,
  details: PerformanceDetails = {},
  force = false
) {
  if (!shouldLog(durationMs, force)) return;

  const metadata = Object.entries(details)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(" ");

  console.info(
    `[performance] ${operation} ${durationMs.toFixed(1)}ms${metadata ? ` ${metadata}` : ""}`
  );
}
