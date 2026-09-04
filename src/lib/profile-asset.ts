import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

type ProfileAsset = "avatar" | "resumeUrl";

export async function profileAssetResponse(
  field: ProfileAsset,
  downloadName?: string
) {
  try {
    await dbConnect();
    const owner = await User.findOne({ role: "owner" }).select(field).lean();
    const value = owner?.[field] || "";

    if (/^https?:\/\//i.test(value)) {
      return NextResponse.redirect(value, 302);
    }

    const match = value.match(/^data:([a-z0-9.+-]+\/[a-z0-9.+-]+);base64,(.+)$/i);
    if (!match) return new NextResponse(null, { status: 404 });

    const [, mime, base64] = match;
    const body = Buffer.from(base64, "base64");
    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Content-Length": String(body.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    };
    if (downloadName) {
      headers["Content-Disposition"] = `attachment; filename="${downloadName}"`;
    }

    return new NextResponse(new Uint8Array(body), { headers });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
