import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models/Message";
import { requireOwner, jsonError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const sp = req.nextUrl.searchParams;
    const page = Math.max(1, Math.min(10_000, Number(sp.get("page")) || 1));
    const limit = Math.max(1, Math.min(100, Number(sp.get("limit")) || 20));
    const filterParam = sp.get("filter"); // all | unread | archived

    const filter: Record<string, unknown> =
      filterParam === "unread"
        ? { read: false, archived: false }
        : filterParam === "archived"
          ? { archived: true }
          : { archived: false };

    const [total, items] = await Promise.all([
      Message.countDocuments(filter),
      Message.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
