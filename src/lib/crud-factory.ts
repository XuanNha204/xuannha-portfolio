import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Model } from "mongoose";
import type { ZodSchema } from "zod";
import { dbConnect } from "@/lib/db";
import { jsonError, parseBody, requireOwner } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";

/**
 * Trang public dùng ISR nên dữ liệu chỉ tự làm mới theo chu kỳ `revalidate`.
 * Gọi hàm này sau mỗi mutation từ CMS để số liệu/nội dung cập nhật ngay.
 */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

interface CrudOptions<T> {
  model: Model<T>;
  schema: ZodSchema;
  /** When set, a unique slug is generated from this field if none provided. */
  slugFrom?: string;
  /** Field(s) holding date strings that must be cast to Date. */
  dateFields?: string[];
  sort?: Record<string, 1 | -1>;
  /** Public read access for the list endpoint (default: owner only). */
  publicRead?: boolean;
}

function castDates(data: Record<string, unknown>, dateFields: string[] = []) {
  for (const field of dateFields) {
    const value = data[field];
    if (typeof value === "string") {
      data[field] = value ? new Date(value) : null;
    }
  }
  return data;
}

async function withSlug<T>(
  model: Model<T>,
  data: Record<string, unknown>,
  slugFrom: string,
  excludeId?: string
) {
  const base = slugify((data.slug as string) || (data[slugFrom] as string) || "");
  let slug = base || `item-${Date.now()}`;
  let i = 1;
  // ensure uniqueness
  const filterFor = (s: string) => ({
    slug: s,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  while (await model.exists(filterFor(slug) as never)) {
    slug = `${base}-${++i}`;
  }
  data.slug = slug;
  return data;
}

/** Route handlers for `/api/<resource>` (GET list + POST create). */
export function createCollectionHandlers<T>(options: CrudOptions<T>) {
  const { model, schema, slugFrom, dateFields, sort = { createdAt: -1 }, publicRead } = options;

  async function GET() {
    if (!publicRead) {
      const { error } = await requireOwner();
      if (error) return error;
    }
    try {
      await dbConnect();
      const items = await model.find().sort(sort).lean();
      return NextResponse.json(items);
    } catch {
      return jsonError("Lỗi máy chủ", 500);
    }
  }

  async function POST(req: Request) {
    const { error: authError } = await requireOwner();
    if (authError) return authError;

    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    try {
      await dbConnect();
      let payload = castDates({ ...(data as Record<string, unknown>) }, dateFields);
      if (slugFrom) payload = await withSlug(model, payload, slugFrom);
      const created = await model.create(payload as never);
      revalidateSite();
      return NextResponse.json(created, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi máy chủ";
      return jsonError(message, 500);
    }
  }

  return { GET, POST };
}

/** Route handlers for `/api/<resource>/[id]` (GET + PUT + DELETE). */
export function createItemHandlers<T>(options: CrudOptions<T>) {
  const { model, schema, slugFrom, dateFields } = options;

  type Ctx = { params: Promise<{ id: string }> };

  async function GET(_req: Request, ctx: Ctx) {
    const { error } = await requireOwner();
    if (error) return error;
    try {
      await dbConnect();
      const { id } = await ctx.params;
      const item = await model.findById(id).lean();
      if (!item) return jsonError("Không tìm thấy", 404);
      return NextResponse.json(item);
    } catch {
      return jsonError("Lỗi máy chủ", 500);
    }
  }

  async function PUT(req: Request, ctx: Ctx) {
    const { error: authError } = await requireOwner();
    if (authError) return authError;

    const { data, error } = await parseBody(req, schema);
    if (error) return error;

    try {
      await dbConnect();
      const { id } = await ctx.params;
      let payload = castDates({ ...(data as Record<string, unknown>) }, dateFields);
      if (slugFrom) payload = await withSlug(model, payload, slugFrom, id);
      const updated = await model.findByIdAndUpdate(id, payload, { returnDocument: "after" }).lean();
      if (!updated) return jsonError("Không tìm thấy", 404);
      revalidateSite();
      return NextResponse.json(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Lỗi máy chủ";
      return jsonError(message, 500);
    }
  }

  async function DELETE(_req: Request, ctx: Ctx) {
    const { error } = await requireOwner();
    if (error) return error;
    try {
      await dbConnect();
      const { id } = await ctx.params;
      const deleted = await model.findByIdAndDelete(id).lean();
      if (!deleted) return jsonError("Không tìm thấy", 404);
      revalidateSite();
      return NextResponse.json({ success: true });
    } catch {
      return jsonError("Lỗi máy chủ", 500);
    }
  }

  return { GET, PUT, DELETE };
}
