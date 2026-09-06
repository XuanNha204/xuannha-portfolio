import { cache } from "react";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { SocialLink } from "@/models/SocialLink";
import { serialize } from "./serialize";
import { freshProfile } from "@/lib/fresh-profile";
import type {
  ProfileDTO,
  SocialLinkDTO,
} from "@/types";

const FALLBACK_PROFILE: ProfileDTO = {
  ...freshProfile,
  _id: "",
  email: "nhahx204@gmail.com",
};

function publicAssetProjection(field: "avatar" | "resumeUrl", route: "avatar" | "resume") {
  return { $cond: [
    { $eq: [{ $substrBytes: [{ $ifNull: [`$${field}`, ""] }, 0, 5] }, "data:"] },
    { $concat: [`/api/profile/${route}?v=`, { $toString: { $toLong: { $ifNull: ["$updatedAt", new Date(0)] } } }] },
    { $ifNull: [`$${field}`, ""] },
  ] };
}

export const getProfile = cache(async (): Promise<ProfileDTO> => {
  try {
    await dbConnect();
    // Resolve inline assets inside MongoDB; do not read megabytes of PDF/base64
    // into the render process just to turn them into public URLs.
    const [owner] = await User.aggregate([
      { $match: { role: "owner" } }, { $limit: 1 },
      { $project: {
        name: 1, email: 1, headline: 1, about: 1, location: 1, phone: 1, careerGoal: 1,
        avatar: publicAssetProjection("avatar", "avatar"),
        resumeUrl: publicAssetProjection("resumeUrl", "resume"),
      } },
    ]);
    if (!owner) return FALLBACK_PROFILE;

    return serialize<ProfileDTO>(owner);
  } catch {
    return FALLBACK_PROFILE;
  }
});

export const getSocialLinks = cache(async (onlyVisible = true): Promise<SocialLinkDTO[]> => {
  try {
    await dbConnect();
    const filter = onlyVisible ? { visible: { $ne: false } } : {};
    return serialize<SocialLinkDTO[]>(await SocialLink.find(filter).sort({ order: 1 }).lean());
  } catch {
    return [];
  }
});
