import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models";
import { profileSchema } from "@/schemas";
import { requireOwner, jsonError, parseBody } from "@/lib/api-helpers";
import { revalidateSite } from "@/lib/crud-factory";

export async function GET() {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const owner = await User.findOne({ role: "owner" }).lean();
    if (!owner) return jsonError("Không tìm thấy hồ sơ", 404);
    return NextResponse.json(owner);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}

export async function PUT(req: Request) {
  const { error: authError } = await requireOwner();
  if (authError) return authError;

  const { data, error } = await parseBody(req, profileSchema);
  if (error) return error;

  try {
    await dbConnect();
    const updated = await User.findOneAndUpdate({ role: "owner" }, data, {
      returnDocument: "after",
    }).lean();
    if (!updated) return jsonError("Không tìm thấy hồ sơ", 404);
    revalidateSite();
    return NextResponse.json(updated);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
