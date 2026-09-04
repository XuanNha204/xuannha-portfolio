import { profileAssetResponse } from "@/lib/profile-asset";

export const runtime = "nodejs";

export function GET() {
  return profileAssetResponse("resumeUrl", "xuan-nha-cv.pdf");
}
