import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Model } from "mongoose";
import type { ZodSchema } from "zod";
import { dbConnect } from "@/lib/db";
import { jsonError, parseBody, requireOwner } from "@/lib/api-helpers";

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
  sort?: Record<string, 1 | -1>;
}

/** Route handlers for `/api/<resource>` (GET list + POST create). */
export function createCollectionHandlers<T>(options: CrudOptions<T>) {
  const { model, schema, sort = { createdAt: -1 } } = options;

  async function GET() {
    const { error } = await requireOwner();
    if (error) return error;
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
      const payload = data as Record<string, unknown>;
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
  const { model, schema } = options;

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
      const payload = data as Record<string, unknown>;
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
