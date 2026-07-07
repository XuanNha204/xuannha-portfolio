import { Schema, model, models, type Model } from "mongoose";

export interface ISocialLink {
  _id: string;
  platform: string; // github | linkedin | facebook | zalo | email | ...
  label: string;
  url: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true, lowercase: true, trim: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SocialLink: Model<ISocialLink> =
  models.SocialLink || model<ISocialLink>("SocialLink", SocialLinkSchema);
