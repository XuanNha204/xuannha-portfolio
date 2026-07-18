import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { BlogPost } from "@/models";
import { blogPostSchema } from "@/schemas";
import { requireOwner, jsonError, parseBody } from "@/lib/api-helpers";
import { revalidateSite } from "@/lib/crud-factory";
import { readingTime, slugify } from "@/lib/utils";
import { getAdminPosts } from "@/services/blog.service";

export async function GET(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    const sp = req.nextUrl.searchParams;
    const result = await getAdminPosts({
      page: Number(sp.get("page")) || 1,
      limit: Number(sp.get("limit")) || 10,
      search: sp.get("search") ?? undefined,
      status: sp.get("status") ?? undefined,
    });
    return NextResponse.json(result);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}

export async function POST(req: Request) {
  const { error: authError } = await requireOwner();
  if (authError) return authError;

  const { data, error } = await parseBody(req, blogPostSchema);
  if (error) return error;

  try {
    await dbConnect();
    const base = slugify(data.slug || data.title);
    let slug = base || `post-${Date.now()}`;
    let i = 1;
    while (await BlogPost.exists({ slug })) slug = `${base}-${++i}`;

    const created = await BlogPost.create({
      ...data,
      slug,
      category: data.category || null,
      readingTime: readingTime(data.content || ""),
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
      publishedAt: data.status === "published" ? new Date() : undefined,
    });
    revalidateSite();
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Lỗi máy chủ", 500);
  }
}
