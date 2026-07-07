import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Media } from "@/models";
import { requireOwner, jsonError } from "@/lib/api-helpers";

const MAX_SIZE = 8 * 1024 * 1024; // Keep base64 documents below MongoDB's 16MB limit.

function mediaTypeOf(mime: string): "image" | "video" | "pdf" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

function fileFormat(file: File) {
  const fromName = file.name.split(".").pop();
  if (fromName) return fromName.toLowerCase();
  return file.type.split("/").pop() || "";
}

export async function GET(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    await dbConnect();
    const sp = req.nextUrl.searchParams;
    const type = sp.get("type");
    const page = Number(sp.get("page")) || 1;
    const limit = Number(sp.get("limit")) || 24;

    const filter: Record<string, unknown> = {};
    if (type && type !== "all") filter.type = type;

    const total = await Media.countDocuments(filter);
    const items = await Media.find(filter)
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

export async function POST(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = (formData.get("folder") as string) || "xuannha-dev";

    if (!(file instanceof File)) return jsonError("Thiếu file", 400);
    if (file.size > MAX_SIZE) return jsonError("File vượt quá 8MB", 413);

    const buffer = Buffer.from(await file.arrayBuffer());
    const type = mediaTypeOf(file.type);
    const dataUrl = `data:${file.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    const publicId = `${folder}/${Date.now()}-${crypto.randomUUID()}`;

    await dbConnect();
    const media = await Media.create({
      name: file.name,
      url: dataUrl,
      publicId,
      type,
      format: fileFormat(file),
      bytes: file.size,
      folder,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : "Upload thất bại", 500);
  }
}
