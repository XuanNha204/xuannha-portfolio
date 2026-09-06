import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodError, type ZodSchema } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Types } from "mongoose";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function validObjectId(value: string) {
  return Types.ObjectId.isValid(value) && new Types.ObjectId(value).toString() === value.toLowerCase();
}

function expectedOrigins(req: Request) {
  const origins = new Set<string>();
  try {
    origins.add(new URL(req.url).origin);
  } catch {}
  try {
    if (process.env.NEXT_PUBLIC_SITE_URL) origins.add(new URL(process.env.NEXT_PUBLIC_SITE_URL).origin);
  } catch {}

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol =
    req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ||
    new URL(req.url).protocol.replace(":", "");
  if (host) origins.add(`${protocol}://${host}`);
  return origins;
}

function hasValidOrigin(req: Request) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return true;
  const origin = req.headers.get("origin");
  return !!origin && expectedOrigins(req).has(origin);
}

/** Verifies the signed session, current owner role and session revocation version. */
export async function requireOwner(req?: Request) {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: jsonError("Chưa đăng nhập", 401) };
  }
  if (session.user.role !== "owner") {
    return { session: null, error: jsonError("Không có quyền truy cập", 403) };
  }
  if (req && !hasValidOrigin(req)) {
    return { session: null, error: jsonError("Nguồn yêu cầu không hợp lệ", 403) };
  }

  try {
    await dbConnect();
    const owner = await User.findOne({ _id: session.user.id, role: "owner" })
      .select("+sessionVersion")
      .lean();
    if (!owner || (owner.sessionVersion ?? 0) !== session.user.sessionVersion) {
      return { session: null, error: jsonError("Phiên đăng nhập đã hết hiệu lực", 401) };
    }
  } catch {
    return { session: null, error: jsonError("Không thể xác minh phiên đăng nhập", 503) };
  }

  return { session, error: null };
}

export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>,
  maxBytes = 128 * 1024
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const declaredLength = Number(req.headers.get("content-length"));
    if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
      return { data: null, error: jsonError("Dữ liệu quá lớn", 413) };
    }

    const reader = req.body?.getReader();
    if (!reader) return { data: null, error: jsonError("Body không hợp lệ", 400) };
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maxBytes) {
          await reader.cancel();
          return { data: null, error: jsonError("Dữ liệu quá lớn", 413) };
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const data = schema.parse(body);
    return { data, error: null };
  } catch (err) {
    if (err instanceof ZodError) {
      return {
        data: null,
        error: jsonError("Dữ liệu không hợp lệ", 422, err.flatten().fieldErrors),
      };
    }
    return { data: null, error: jsonError("Body không hợp lệ", 400) };
  }
}
