import { Schema, model, models, type Model, Types } from "mongoose";

export interface IBlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category?: Types.ObjectId | null;
  tags: string[];
  readingTime: number;
  status: "draft" | "published" | "scheduled";
  publishedAt?: Date;
  scheduledAt?: Date;
  views: number;
  featured: boolean;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
    canonicalUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    tags: { type: [String], default: [] },
    readingTime: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["draft", "published", "scheduled"],
      default: "draft",
      index: true,
    },
    publishedAt: { type: Date },
    scheduledAt: { type: Date },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: [String], default: [] },
      ogImage: { type: String, default: "" },
      canonicalUrl: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

BlogPostSchema.index({ title: "text", excerpt: "text", tags: "text" });

export const BlogPost: Model<IBlogPost> =
  models.BlogPost || model<IBlogPost>("BlogPost", BlogPostSchema);
