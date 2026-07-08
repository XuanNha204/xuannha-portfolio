import { Schema, model, models, type Model } from "mongoose";

export interface ISkill {
  _id: string;
  name: string;
  category: "frontend" | "backend" | "database" | "devops" | "tools" | "other";
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
    icon: { type: String, default: "" },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Skill: Model<ISkill> = models.Skill || model<ISkill>("Skill", SkillSchema);
