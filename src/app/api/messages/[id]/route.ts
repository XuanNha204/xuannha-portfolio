import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models";
import { requireOwner, jsonError } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await ctx.params;
    const body = await req.json();

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

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await ctx.params;
    const deleted = await Message.findByIdAndDelete(id).lean();
    if (!deleted) return jsonError("Không tìm thấy", 404);
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
