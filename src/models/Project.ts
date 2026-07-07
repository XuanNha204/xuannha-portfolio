import { Schema, model, models, type Model } from "mongoose";

export interface IProjectImage {
  url: string;
  publicId?: string;
  alt?: string;
  order?: number;
}

export interface IProject {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  coverImage: string;
  gallery: IProjectImage[];
  videoUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  techStack: string[];
  role?: string;
  challenges?: string;
  solutions?: string;
  results?: string;
  tags: string[];
  featured: boolean;
  status: "draft" | "published" | "archived";
  completedAt?: Date;
  order: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectImageSchema = new Schema<IProjectImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    gallery: { type: [ProjectImageSchema], default: [] },
    videoUrl: { type: String, default: "" },
    githubUrl: { type: String, default: "" },
    demoUrl: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    role: { type: String, default: "" },
    challenges: { type: String, default: "" },
    solutions: { type: String, default: "" },
    results: { type: String, default: "" },
    tags: { type: [String], default: [] },
    featured: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    completedAt: { type: Date },
    order: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ title: "text", summary: "text", techStack: "text" });

export const Project: Model<IProject> =
  models.Project || model<IProject>("Project", ProjectSchema);
