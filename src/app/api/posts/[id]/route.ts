import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { BlogPost } from "@/models";
import { blogPostSchema } from "@/schemas";
import { requireOwner, jsonError, parseBody } from "@/lib/api-helpers";
import { readingTime, slugify } from "@/lib/utils";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { error } = await requireOwner();
  if (error) return error;
  try {
    await dbConnect();
    const { id } = await ctx.params;
    const post = await BlogPost.findById(id).lean();
    if (!post) return jsonError("Không tìm thấy", 404);
    return NextResponse.json(post);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const { error: authError } = await requireOwner();
  if (authError) return authError;

  const { data, error } = await parseBody(req, blogPostSchema);
  if (error) return error;

  try {
    await dbConnect();
    const { id } = await ctx.params;

    const existing = await BlogPost.findById(id);
    if (!existing) return jsonError("Không tìm thấy", 404);

    const base = slugify(data.slug || data.title);
    let slug = base || existing.slug;
    let i = 1;
    while (await BlogPost.exists({ slug, _id: { $ne: id } })) slug = `${base}-${++i}`;

    const wasPublished = existing.status === "published";
    const nowPublished = data.status === "published";

    const updated = await BlogPost.findByIdAndUpdate(
      id,
      {
        ...data,
        slug,
        category: data.category || null,
        readingTime: readingTime(data.content || ""),
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        ...(nowPublished && !wasPublished ? { publishedAt: new Date() } : {}),
      },
      { returnDocument: "after" }
    ).lean();

    return NextResponse.json(updated);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Lỗi máy chủ", 500);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { error } = await requireOwner();
  if (error) return error;
  try {
    await dbConnect();
    const { id } = await ctx.params;
    const deleted = await BlogPost.findByIdAndDelete(id).lean();
    if (!deleted) return jsonError("Không tìm thấy", 404);
    return NextResponse.json({ success: true });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
