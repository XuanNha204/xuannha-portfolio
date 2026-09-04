import mongoose from "mongoose";
import { logPerformance } from "./performance";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/xuannha-dev";
const RETRY_COOLDOWN_MS = 5_000;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  lastError: unknown;
  lastFailureAt: number;
}

declare global {
  var _mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongoose ?? {
  conn: null,
  promise: null,
  lastError: null,
  lastFailureAt: 0,
};
// Keep older hot-reload cache objects compatible after this shape changes.
cached.lastError ??= null;
cached.lastFailureAt ??= 0;
global._mongoose = cached;

export async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    if (cached.lastError && Date.now() - cached.lastFailureAt < RETRY_COOLDOWN_MS) {
      throw cached.lastError;
    }

    const startedAt = performance.now();
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 5000,
      })
      .then((connection) => {
        cached.lastError = null;
        cached.lastFailureAt = 0;
        logPerformance("mongodb.connect", performance.now() - startedAt, {
          readyState: connection.connection.readyState,
        });
        return connection;
      })
      .catch((error: unknown) => {
        cached.promise = null;
        cached.lastError = error;
        cached.lastFailureAt = Date.now();

        const mongoError = error as { code?: number | string; name?: string };
        logPerformance(
          "mongodb.connect",
          performance.now() - startedAt,
          { outcome: "error", error: mongoError.name, code: mongoError.code },
          true
        );
        throw error;
      });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
