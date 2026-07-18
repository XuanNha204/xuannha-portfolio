import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/services/settings.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Phục vụ favicon do CMS quản lý (Cài đặt > Favicon).
 *
 * CMS lưu favicon dạng data URL base64 trong MongoDB; nhét thẳng chuỗi đó vào
 * <head> sẽ phình HTML của mọi trang, nên generateMetadata chỉ trỏ tới route
 * này kèm ?v=<hash> — đổi favicon là đổi URL, trình duyệt tự tải bản mới còn
 * bản cũ được cache dài hạn.
 */
export async function GET(req: NextRequest) {
  const settings = await getSiteSettings();
  const favicon = settings.favicon || "";

  // CMS lưu URL ngoài (http/https) → chuyển hướng thẳng tới đó.
  if (/^https?:\/\//.test(favicon)) {
    return NextResponse.redirect(favicon, 302);
  }

  const match = favicon.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match) {
    // Chưa cấu hình trong CMS → dùng icon mặc định trong /public.
    return NextResponse.redirect(new URL("/icon.png", req.url), 302);
  }

  const [, mime, base64] = match;
  const body = Buffer.from(base64, "base64");
  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(body.length),
      // URL đã version hóa bằng ?v= nên cache thoải mái.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
