import mongoose from "mongoose";
import { loadEnvConfig } from "@next/env";

type AuditQuery = {
  name: string;
  collection: string;
  filter: Record<string, unknown>;
  sort?: Record<string, 1 | -1>;
};

type ExplainResult = {
  queryPlanner?: { winningPlan?: unknown };
  executionStats?: {
    nReturned?: number;
    totalDocsExamined?: number;
    totalKeysExamined?: number;
    executionTimeMillis?: number;
  };
};

function planSummary(plan: unknown) {
  const stages = new Set<string>();
  const indexes = new Set<string>();

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;

    const node = value as Record<string, unknown>;
    if (typeof node.stage === "string") stages.add(node.stage);
    if (typeof node.indexName === "string") indexes.add(node.indexName);
    Object.values(node).forEach(visit);
  }

  visit(plan);
  return {
    stages: [...stages].join(" > ") || "unknown",
    indexes: [...indexes].join(", ") || "none",
  };
}

async function main() {
  loadEnvConfig(process.cwd(), true);
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing");

  await mongoose.connect(process.env.MONGODB_URI, { autoIndex: false });
  const db = mongoose.connection.db!;
  const existingCollections = new Set(
    (await db.listCollections({}, { nameOnly: true }).toArray()).map((item) => item.name)
  );

  const today = new Date().toISOString().slice(0, 10);
  const queries: AuditQuery[] = [
    {
      name: "analytics upsert lookup",
      collection: "analytics",
      filter: { path: "/", date: today },
    },
    {
      name: "published projects",
      collection: "projects",
      filter: { status: "published" },
      sort: { order: 1, completedAt: -1 },
    },
    {
      name: "featured projects",
      collection: "projects",
      filter: { status: "published", featured: true },
      sort: { order: 1, completedAt: -1 },
    },
    {
      name: "published posts",
      collection: "blogposts",
      filter: { status: "published" },
      sort: { publishedAt: -1 },
    },
    {
      name: "scheduled posts",
      collection: "blogposts",
      filter: { status: "scheduled", scheduledAt: { $lte: new Date() } },
    },
    {
      name: "active messages",
      collection: "messages",
      filter: { archived: false },
      sort: { createdAt: -1 },
    },
    {
      name: "media by type",
      collection: "media",
      filter: { type: "image" },
      sort: { createdAt: -1 },
    },
    { name: "owner profile", collection: "users", filter: { role: "owner" } },
  ];

  const rows = [];
  for (const query of queries) {
    if (!existingCollections.has(query.collection)) continue;

    let cursor = db.collection(query.collection).find(query.filter as never);
    if (query.sort) cursor = cursor.sort(query.sort as never);
    const explain = (await cursor.limit(20).explain("executionStats")) as ExplainResult;
    const plan = planSummary(explain.queryPlanner?.winningPlan);
    const stats = explain.executionStats;
    rows.push({
      query: query.name,
      collection: query.collection,
      stages: plan.stages,
      indexes: plan.indexes,
      returned: stats?.nReturned ?? 0,
      docsExamined: stats?.totalDocsExamined ?? 0,
      keysExamined: stats?.totalKeysExamined ?? 0,
      executionMs: stats?.executionTimeMillis ?? 0,
    });
  }

  console.table(rows);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
