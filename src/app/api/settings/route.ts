import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { SiteSettings } from "@/models";
import { siteSettingsSchema } from "@/schemas";
import { requireOwner, jsonError, parseBody } from "@/lib/api-helpers";

export async function GET() {
  try {
    await dbConnect();
    let settings = await SiteSettings.findOne().lean();
    if (!settings) settings = (await SiteSettings.create({})).toObject();
    return NextResponse.json(settings);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}

export async function PUT(req: Request) {
  const { error: authError } = await requireOwner();
  if (authError) return authError;

  const { data, error } = await parseBody(req, siteSettingsSchema);
  if (error) return error;

  try {
    await dbConnect();
    const updated = await SiteSettings.findOneAndUpdate({}, data, {
      returnDocument: "after",
      upsert: true,
    }).lean();
    return NextResponse.json(updated);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
