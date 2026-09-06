import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models/Media";
import { requireOwner, jsonError } from "@/lib/api-helpers";

const MAX_SIZE = 8 * 1024 * 1024;
type SafeMedia = { mime: string; format: string; type: "image" | "video" | "pdf" };

function startsWith(buffer: Buffer, signature: number[], offset = 0) {
  return signature.every((byte, index) => buffer[offset + index] === byte);
}

function detectMedia(buffer: Buffer): SafeMedia | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return { mime: "image/jpeg", format: "jpg", type: "image" };
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { mime: "image/png", format: "png", type: "image" };
  }
  if (buffer.subarray(0, 6).toString("ascii") === "GIF87a" || buffer.subarray(0, 6).toString("ascii") === "GIF89a") {
    return { mime: "image/gif", format: "gif", type: "image" };
  }
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { mime: "image/webp", format: "webp", type: "image" };
  }
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { mime: "application/pdf", format: "pdf", type: "pdf" };
  }
  if (buffer.subarray(4, 8).toString("ascii") === "ftyp") {
    return { mime: "video/mp4", format: "mp4", type: "video" };
  }
  if (startsWith(buffer, [0x1a, 0x45, 0xdf, 0xa3])) {
    return { mime: "video/webm", format: "webm", type: "video" };
  }
  return null;
}

function safeName(name: string, format: string) {
  const base = name
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/[^\p{L}\p{N}._ -]/gu, "_")
    .slice(0, 150)
    .trim();
  return base || `upload.${format}`;
}

export async function GET(req: NextRequest) {
  const { error } = await requireOwner(req);
  if (error) return error;

  try {
    await dbConnect();
    const sp = req.nextUrl.searchParams;
    const type = sp.get("type");
    const page = Math.max(1, Math.min(10_000, Number(sp.get("page")) || 1));
    const limit = Math.max(1, Math.min(100, Number(sp.get("limit")) || 24));
    const filter: Record<string, unknown> = {};
    if (["image", "video", "pdf", "other"].includes(type || "")) filter.type = type;

    const [total, items] = await Promise.all([
      Media.countDocuments(filter),
      Media.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);

    return NextResponse.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireOwner(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const requestedFolder = String(formData.get("folder") || "xuannha-dev");
    const folder = /^[a-zA-Z0-9/_-]{1,80}$/.test(requestedFolder) ? requestedFolder : "xuannha-dev";

    if (!(file instanceof File)) return jsonError("Thiếu file", 400);
    if (!file.size) return jsonError("File rỗng", 422);
    if (file.size > MAX_SIZE) return jsonError("File vượt quá 8MB", 413);

    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectMedia(buffer);
    if (!detected) return jsonError("Chỉ chấp nhận JPEG, PNG, GIF, WebP, MP4, WebM hoặc PDF hợp lệ", 415);

    const dataUrl = `data:${detected.mime};base64,${buffer.toString("base64")}`;
    const publicId = `${folder}/${Date.now()}-${crypto.randomUUID()}`;

    await dbConnect();
    const media = await Media.create({
      name: safeName(file.name, detected.format),
      url: dataUrl,
      publicId,
      type: detected.type,
      format: detected.format,
      bytes: file.size,
      folder,
    });

    return NextResponse.json(media, { status: 201 });
  } catch {
    return jsonError("Upload thất bại", 500);
  }
}
