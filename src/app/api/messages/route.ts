import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Message } from "@/models";
import { requireOwner, jsonError } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const sp = req.nextUrl.searchParams;
    const page = Number(sp.get("page")) || 1;
    const limit = Number(sp.get("limit")) || 20;
    const filterParam = sp.get("filter"); // all | unread | archived

    const filter: Record<string, unknown> =
      filterParam === "unread"
        ? { read: false, archived: false }
        : filterParam === "archived"
          ? { archived: true }
          : { archived: false };

    const total = await Message.countDocuments(filter);
    const items = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

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
