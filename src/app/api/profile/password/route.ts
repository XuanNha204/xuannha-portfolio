import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models";
import { changePasswordSchema } from "@/schemas";
import { requireOwner, jsonError, parseBody } from "@/lib/api-helpers";

export async function PUT(req: Request) {
  const { error: authError } = await requireOwner();
  if (authError) return authError;

  const { data, error } = await parseBody(req, changePasswordSchema);
  if (error) return error;

  try {
    await dbConnect();
    const owner = await User.findOne({ role: "owner" }).select("+password");
    if (!owner) return jsonError("Không tìm thấy tài khoản admin", 404);

    const valid = await bcrypt.compare(data.currentPassword, owner.password);
    if (!valid) return jsonError("Mật khẩu hiện tại không đúng", 400);

    owner.password = await bcrypt.hash(data.newPassword, 12);
    await owner.save();

    return NextResponse.json({ ok: true });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
