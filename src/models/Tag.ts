import { Schema, model, models, type Model } from "mongoose";

export interface ITag {
  _id: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

export const Tag: Model<ITag> = models.Tag || model<ITag>("Tag", TagSchema);
