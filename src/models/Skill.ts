import { Schema, model, models, type Model } from "mongoose";

export interface ISkill {
  _id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "tools" | "other";
  level: number; // 1-100
  icon?: string;
  order: number;
  visible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["frontend", "backend", "database", "devops", "tools", "other"],
      default: "other",
    },
    level: { type: Number, min: 1, max: 100, default: 70 },
    icon: { type: String, default: "" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Skill: Model<ISkill> = models.Skill || model<ISkill>("Skill", SkillSchema);
