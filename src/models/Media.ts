import { Schema, model, models, type Model } from "mongoose";

export interface IMedia {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  type: "image" | "video" | "pdf" | "other";
  format?: string;
  bytes: number;
  width?: number;
  height?: number;
  folder?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    type: {
      type: String,
      enum: ["image", "video", "pdf", "other"],
      default: "image",
      index: true,
    },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
    folder: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Media: Model<IMedia> = models.Media || model<IMedia>("Media", MediaSchema);
