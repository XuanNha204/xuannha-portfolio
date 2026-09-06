import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models/Message";
import { contactSchema } from "@/schemas";
import { jsonError, parseBody } from "@/lib/api-helpers";
import { rateLimit } from "@/lib/rate-limit";
import { sendContactNotification } from "@/lib/contact-email";

export const runtime = "nodejs";

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
    const message = await Message.create(data);
    const emailNotification = await sendContactNotification(data);
    // Once stored, email failure must not invite visitors to submit duplicates.
    await Message.updateOne({ _id: message._id }, { $set: { emailNotification } }).catch(() => {
      console.error("Unable to update email notification status for a saved contact message.");
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return jsonError("Không thể gửi tin nhắn, vui lòng thử lại.", 500);
  }
}
