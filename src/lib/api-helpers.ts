import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ZodError, type ZodSchema } from "zod";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

/** Returns the session if the caller is the site owner, otherwise a 401/403 response. */
export async function requireOwner() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: jsonError("Chưa đăng nhập", 401) };
  }
  if (session.user.role !== "owner") {
    return { session: null, error: jsonError("Không có quyền truy cập", 403) };
  }
  return { session, error: null };
}

export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const body = await req.json();
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
