import { createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { AuthThrottle } from "@/models/AuthThrottle";

const WINDOW_MS = 15 * 60_000;
const MAX_BLOCK_MS = 30 * 60_000;
const EXPIRES_MS = 24 * 60 * 60_000;
const DUMMY_PASSWORD_HASH = "$2b$12$WfQ8gE5VkOmvVDmT2pXfSuSuBOseCXJVeVC2cBD3JYUw5Rmgw1uUK";

function digest(scope: "account" | "ip", value: string) {
  const secret = process.env.AUTH_SECRET || "development-only-auth-throttle";
  return createHmac("sha256", secret).update(`${scope}:${value}`).digest("hex");
}

function keys(email: string, ip: string) {
  const result = [
    { key: digest("account", email.trim().toLowerCase()), threshold: 6 },
  ];
  if (ip !== "unknown") result.push({ key: digest("ip", ip), threshold: 10 });
  return result;
}

export async function loginAllowed(email: string, ip: string): Promise<boolean> {
  await dbConnect();
  const now = new Date();
  return !(await AuthThrottle.exists({
    key: { $in: keys(email, ip).map((item) => item.key) },
    blockedUntil: { $gt: now },
  }));
}

async function incrementFailure(key: string, threshold: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + WINDOW_MS);
  const expiresAt = new Date(now.getTime() + EXPIRES_MS);
  const resetWindow = {
    $or: [
      { $eq: [{ $type: "$resetAt" }, "missing"] },
      { $lte: ["$resetAt", now] },
    ],
  };

  const update = [
    {
      $set: {
        count: { $cond: [resetWindow, 1, { $add: [{ $ifNull: ["$count", 0] }, 1] }] },
        resetAt: { $cond: [resetWindow, resetAt, "$resetAt"] },
        expiresAt,
      },
    },
    {
      $set: {
        blockedUntil: {
          $cond: [
            { $gte: ["$count", threshold] },
            {
              $add: [
                now,
                {
                  $min: [
                    MAX_BLOCK_MS,
                    { $multiply: [30_000, { $pow: [2, { $subtract: ["$count", threshold] }] }] },
                  ],
                },
              ],
            },
            "$blockedUntil",
          ],
        },
      },
    },
  ];

  try {
    await AuthThrottle.findOneAndUpdate({ key }, update, { upsert: true, updatePipeline: true });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    await AuthThrottle.findOneAndUpdate({ key }, update, { updatePipeline: true });
  }
}

export async function recordLoginFailure(email: string, ip: string) {
  await dbConnect();
  await Promise.all(keys(email, ip).map(({ key, threshold }) => incrementFailure(key, threshold)));
}

export async function clearLoginFailures(email: string, ip: string) {
  await dbConnect();
  await AuthThrottle.deleteMany({ key: { $in: keys(email, ip).map((item) => item.key) } });
}

/** Keeps unknown accounts on the same bcrypt path as valid accounts. */
export function compareWithDummyPassword(password: string) {
  return bcrypt.compare(password, DUMMY_PASSWORD_HASH);
}
