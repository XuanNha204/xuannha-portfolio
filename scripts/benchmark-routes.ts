import { performance } from "node:perf_hooks";

type Target = {
  name: string;
  path: string;
  init?: RequestInit;
};

type Sample = {
  status: number;
  ttfbMs: number;
  totalMs: number;
  bytes: number;
};

const baseUrl = (process.argv[2] ?? process.env.PERF_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const sampleCount = Math.max(1, Number(process.env.PERF_SAMPLES ?? 5));
const warmupCount = Math.max(0, Number(process.env.PERF_WARMUPS ?? 1));

const targets: Target[] = [
  { name: "home", path: "/" },
  { name: "about", path: "/about" },
  { name: "projects", path: "/projects" },
  { name: "blog", path: "/blog" },
  { name: "contact", path: "/contact" },
  {
    name: "analytics",
    path: "/api/analytics/track",
    init: {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "/__performance_audit__" }),
    },
  },
];

function percentile(values: number[], ratio: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];
}

async function measure(target: Target): Promise<Sample> {
  const startedAt = performance.now();
  const response = await fetch(`${baseUrl}${target.path}`, target.init);
  const headersAt = performance.now();
  const body = await response.arrayBuffer();
  const finishedAt = performance.now();

  return {
    status: response.status,
    ttfbMs: headersAt - startedAt,
    totalMs: finishedAt - startedAt,
    bytes: body.byteLength,
  };
}

async function main() {
  const rows = [];

  for (const target of targets) {
    for (let index = 0; index < warmupCount; index += 1) {
      await measure(target);
    }

    const samples: Sample[] = [];
    for (let index = 0; index < sampleCount; index += 1) {
      samples.push(await measure(target));
    }

    const ttfb = samples.map((sample) => sample.ttfbMs);
    const total = samples.map((sample) => sample.totalMs);
    rows.push({
      route: target.path,
      status: [...new Set(samples.map((sample) => sample.status))].join(","),
      samples: samples.length,
      "ttfb p50": `${percentile(ttfb, 0.5).toFixed(1)}ms`,
      "ttfb p95": `${percentile(ttfb, 0.95).toFixed(1)}ms`,
      "total p50": `${percentile(total, 0.5).toFixed(1)}ms`,
      "total p95": `${percentile(total, 0.95).toFixed(1)}ms`,
      bytes: samples.at(-1)?.bytes ?? 0,
    });
  }

  console.log(`Benchmark: ${baseUrl} (${sampleCount} samples, ${warmupCount} warm-up)`);
  console.table(rows);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
