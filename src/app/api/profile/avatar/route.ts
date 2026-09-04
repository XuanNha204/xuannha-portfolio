import { profileAssetResponse } from "@/lib/profile-asset";

export const runtime = "nodejs";

export function GET() {
  return profileAssetResponse("avatar");
}
