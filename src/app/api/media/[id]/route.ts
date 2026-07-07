import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models";
import { requireOwner, jsonError } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await ctx.params;
    const media = await Media.findById(id);
    if (!media) return jsonError("Không tìm thấy", 404);

    await media.deleteOne();
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
