import { Schema, model, models, type Model } from "mongoose";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", CategorySchema);
