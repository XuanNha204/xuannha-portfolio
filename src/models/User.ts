import { Schema, model, models, type Model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "owner" | "viewer";
  avatar?: string;
  headline?: string;
  about?: string;
  location?: string;
  phone?: string;
  resumeUrl?: string;
  careerGoal?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "viewer"], default: "viewer" },
    avatar: { type: String, default: "" },
    headline: { type: String, default: "" },
    about: { type: String, default: "" },
    location: { type: String, default: "" },
    phone: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    careerGoal: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User || model<IUser>("User", UserSchema);
