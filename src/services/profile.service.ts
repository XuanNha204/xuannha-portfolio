import { cache } from "react";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Skill } from "@/models/Skill";
import { Experience } from "@/models/Experience";
import { Education } from "@/models/Education";
import { Certificate } from "@/models/Certificate";
import { SocialLink } from "@/models/SocialLink";
import { serialize } from "./serialize";
import type {
  ProfileDTO,
  SkillDTO,
  ExperienceDTO,
  EducationDTO,
  CertificateDTO,
  SocialLinkDTO,
} from "@/types";

const FALLBACK_PROFILE: ProfileDTO = {
  _id: "",
  name: "Xuân Nhã",
  email: "nhahx204@gmail.com",
  headline: "Fullstack Developer · Vibe Coding Studio",
  about: "",
  avatar: "",
  location: "Việt Nam",
  careerGoal: "",
};

function publicAssetUrl(
  value: string | undefined,
  asset: "avatar" | "resume",
  updatedAt: Date
) {
  if (!value?.startsWith("data:")) return value;
  return `/api/profile/${asset}?v=${updatedAt.getTime().toString(36)}`;
}

export const getProfile = cache(async (): Promise<ProfileDTO> => {
  try {
    await dbConnect();
    const owner = await User.findOne({ role: "owner" }).lean();
    if (!owner) return FALLBACK_PROFILE;

    return serialize<ProfileDTO>({
      ...owner,
      avatar: publicAssetUrl(owner.avatar, "avatar", owner.updatedAt),
      resumeUrl: publicAssetUrl(owner.resumeUrl, "resume", owner.updatedAt),
    });
  } catch {
    return FALLBACK_PROFILE;
  }
});

export const getSkills = cache(async (onlyVisible = true): Promise<SkillDTO[]> => {
  try {
    await dbConnect();
    // $ne:false thay vì true để không bỏ sót document cũ thiếu field `visible`.
    const filter = onlyVisible ? { visible: { $ne: false } } : {};
    return serialize<SkillDTO[]>(await Skill.find(filter).sort({ order: 1, name: 1 }).lean());
  } catch {
    return [];
  }
});

export const getExperiences = cache(async (): Promise<ExperienceDTO[]> => {
  try {
    await dbConnect();
    return serialize<ExperienceDTO[]>(
      await Experience.find().sort({ order: 1, startDate: -1 }).lean()
    );
  } catch {
    return [];
  }
});

export const getEducations = cache(async (): Promise<EducationDTO[]> => {
  try {
    await dbConnect();
    return serialize<EducationDTO[]>(
      await Education.find().sort({ order: 1, startDate: -1 }).lean()
    );
  } catch {
    return [];
  }
});

export const getCertificates = cache(async (): Promise<CertificateDTO[]> => {
  try {
    await dbConnect();
    return serialize<CertificateDTO[]>(
      await Certificate.find().sort({ order: 1, issueDate: -1 }).lean()
    );
  } catch {
    return [];
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
