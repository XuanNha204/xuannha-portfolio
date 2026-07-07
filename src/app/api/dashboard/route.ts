import { NextResponse } from "next/server";
import { requireOwner } from "@/lib/api-helpers";
import { getDashboardStats } from "@/services/stats.service";

export async function GET() {
  const { error } = await requireOwner();
  if (error) return error;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
