import { dbConnect } from "@/lib/db";
import {
  User,
  Skill,
  Experience,
  Education,
  Certificate,
  SocialLink,
} from "@/models";
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

export async function getProfile(): Promise<ProfileDTO> {
  try {
    await dbConnect();
    const owner = await User.findOne({ role: "owner" }).lean();
    return owner ? serialize<ProfileDTO>(owner) : FALLBACK_PROFILE;
  } catch {
    return FALLBACK_PROFILE;
  }
}

export async function getSkills(onlyVisible = true): Promise<SkillDTO[]> {
  try {
    await dbConnect();
    // $ne:false thay vì true để không bỏ sót document cũ thiếu field `visible`.
    const filter = onlyVisible ? { visible: { $ne: false } } : {};
    return serialize<SkillDTO[]>(await Skill.find(filter).sort({ order: 1, name: 1 }).lean());
  } catch {
    return [];
  }
}

export async function getExperiences(): Promise<ExperienceDTO[]> {
  try {
    await dbConnect();
    return serialize<ExperienceDTO[]>(
      await Experience.find().sort({ order: 1, startDate: -1 }).lean()
    );
  } catch {
    return [];
  }
}

export async function getEducations(): Promise<EducationDTO[]> {
  try {
    await dbConnect();
    return serialize<EducationDTO[]>(
      await Education.find().sort({ order: 1, startDate: -1 }).lean()
    );
  } catch {
    return [];
  }
}

export async function getCertificates(): Promise<CertificateDTO[]> {
  try {
    await dbConnect();
    return serialize<CertificateDTO[]>(
      await Certificate.find().sort({ order: 1, issueDate: -1 }).lean()
    );
  } catch {
    return [];
  }
}

export async function getSocialLinks(onlyVisible = true): Promise<SocialLinkDTO[]> {
  try {
    await dbConnect();
    const filter = onlyVisible ? { visible: { $ne: false } } : {};
    return serialize<SocialLinkDTO[]>(await SocialLink.find(filter).sort({ order: 1 }).lean());
  } catch {
    return [];
  }
}
