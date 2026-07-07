import { Schema, model, models, type Model } from "mongoose";

export interface IExperience {
  _id: string;
  company: string;
  position: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  location?: string;
  technologies: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceSchema = new Schema<IExperience>(
  {
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },
    location: { type: String, default: "" },
    technologies: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Experience: Model<IExperience> =
  models.Experience || model<IExperience>("Experience", ExperienceSchema);
