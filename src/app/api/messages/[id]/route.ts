import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models/Message";
import { requireOwner, jsonError, parseBody, validObjectId } from "@/lib/api-helpers";
import { z } from "zod";

type Ctx = { params: Promise<{ id: string }> };
const messageUpdateSchema = z.object({
  read: z.boolean().optional(),
  archived: z.boolean().optional(),
}).refine((value) => value.read !== undefined || value.archived !== undefined);

export async function PATCH(req: Request, ctx: Ctx) {
  const { error } = await requireOwner(req);
  if (error) return error;

  const parsed = await parseBody(req, messageUpdateSchema);
  if (parsed.error) return parsed.error;

  try {
    await dbConnect();
    const { id } = await ctx.params;
    if (!validObjectId(id)) return jsonError("Mã không hợp lệ", 400);
    const body = parsed.data;

    const update: Record<string, boolean> = {};
    if (typeof body.read === "boolean") update.read = body.read;
    if (typeof body.archived === "boolean") update.archived = body.archived;

    const updated = await Message.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    }).lean();
    if (!updated) return jsonError("Không tìm thấy", 404);
    return NextResponse.json(updated);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { error } = await requireOwner(req);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await ctx.params;
    if (!validObjectId(id)) return jsonError("Mã không hợp lệ", 400);
    const deleted = await Message.findByIdAndDelete(id).lean();
    if (!deleted) return jsonError("Không tìm thấy", 404);
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
