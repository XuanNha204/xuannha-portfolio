import { dbConnect } from "@/lib/db";
import { BlogPost, Category } from "@/models";
import { serialize } from "./serialize";
import type { BlogPostDTO, CategoryDTO, Paginated } from "@/types";

/** Promote scheduled posts whose time has come. Cheap and idempotent. */
async function publishDuePosts() {
  await BlogPost.updateMany(
    { status: "scheduled", scheduledAt: { $lte: new Date() } },
    { $set: { status: "published" }, $currentDate: { publishedAt: true } }
  );
}

export async function getPublishedPosts(params: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
} = {}): Promise<Paginated<BlogPostDTO>> {
  try {
    await dbConnect();
    await publishDuePosts();
    const { page = 1, limit = 9, category, tag, search } = params;

    const filter: Record<string, unknown> = { status: "published" };
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }
    if (category) {
      const cat = await Category.findOne({ slug: category }).lean();
      if (cat) filter.category = cat._id;
    }

    const total = await BlogPost.countDocuments(filter);
    const items = await BlogPost.find(filter)
      .populate("category")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      items: serialize<BlogPostDTO[]>(items),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    };
  } catch {
    return { items: [], total: 0, page: 1, pages: 1 };
  }
}

export async function getLatestPosts(limit = 3): Promise<BlogPostDTO[]> {
  const { items } = await getPublishedPosts({ page: 1, limit });
  return items;
}

export async function getPostBySlug(slug: string): Promise<BlogPostDTO | null> {
  try {
    await dbConnect();
    await publishDuePosts();
    const post = await BlogPost.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    )
      .populate("category")
      .lean();
    return post ? serialize<BlogPostDTO>(post) : null;
  } catch {
    return null;
  }
}

export async function getRelatedPosts(post: BlogPostDTO, limit = 3): Promise<BlogPostDTO[]> {
  try {
    await dbConnect();
    const categoryId =
      typeof post.category === "object" && post.category ? post.category._id : post.category;
    const related = await BlogPost.find({
      _id: { $ne: post._id },
      status: "published",
      $or: [{ tags: { $in: post.tags } }, ...(categoryId ? [{ category: categoryId }] : [])],
    })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();
    return serialize<BlogPostDTO[]>(related);
  } catch {
    return [];
  }
}

export async function getPostSlugs(): Promise<string[]> {
  try {
    await dbConnect();
    const docs = await BlogPost.find({ status: "published" }).select("slug").lean();
    return docs.map((d) => d.slug);
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<CategoryDTO[]> {
  try {
    await dbConnect();
    return serialize<CategoryDTO[]>(await Category.find().sort({ name: 1 }).lean());
  } catch {
    return [];
  }
}

export async function getAdminPosts(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<Paginated<BlogPostDTO>> {
  await dbConnect();
  const { page = 1, limit = 10, search, status } = params;

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (search) filter.title = { $regex: search, $options: "i" };

  const total = await BlogPost.countDocuments(filter);
  const items = await BlogPost.find(filter)
    .populate("category")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return {
    items: serialize<BlogPostDTO[]>(items),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getPostById(id: string): Promise<BlogPostDTO | null> {
  try {
    await dbConnect();
    const post = await BlogPost.findById(id).lean();
    return post ? serialize<BlogPostDTO>(post) : null;
  } catch {
    return null;
  }
}
