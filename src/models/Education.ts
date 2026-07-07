import { Schema, model, models, type Model } from "mongoose";

export interface IEducation {
  _id: string;
  school: string;
  degree: string;
  field?: string;
  description?: string;
  startDate: Date;
  endDate?: Date | null;
  current: boolean;
  gpa?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const EducationSchema = new Schema<IEducation>(
  {
    school: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    field: { type: String, default: "" },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    current: { type: Boolean, default: false },
    gpa: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Education: Model<IEducation> =
  models.Education || model<IEducation>("Education", EducationSchema);
