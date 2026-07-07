import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models";
import { contactSchema } from "@/schemas";
import { jsonError, parseBody } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = rateLimit(`contact:${ip}`, { limit: 3, windowMs: 60_000 });
  if (!success) {
    return jsonError("Bạn gửi quá nhanh, vui lòng thử lại sau 1 phút.", 429);
  }

  const { data, error } = await parseBody(req, contactSchema);
  if (error) return error;

  try {
    await dbConnect();
    await Message.create(data);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return jsonError("Không thể gửi tin nhắn, vui lòng thử lại.", 500);
  }
}
