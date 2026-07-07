import { NextRequest, NextResponse } from "next/server";
import { Project } from "@/models";
import { projectSchema } from "@/schemas";
import { createCollectionHandlers } from "@/lib/crud-factory";
import { requireOwner, jsonError } from "@/lib/api-helpers";
import { getAdminProjects } from "@/services/project.service";

const { POST } = createCollectionHandlers({
  model: Project,
  schema: projectSchema,
  slugFrom: "title",
  dateFields: ["completedAt"],
});

export { POST };

export async function GET(req: NextRequest) {
  const { error } = await requireOwner();
  if (error) return error;

  try {
    const sp = req.nextUrl.searchParams;
    const result = await getAdminProjects({
      page: Number(sp.get("page")) || 1,
      limit: Number(sp.get("limit")) || 10,
      search: sp.get("search") ?? undefined,
      status: sp.get("status") ?? undefined,
      featured: sp.get("featured") ?? undefined,
    });
    return NextResponse.json(result);
  } catch {
    return jsonError("Lỗi máy chủ", 500);
  }
}
