import { Schema, model, models, type Model } from "mongoose";

export interface IAnalytics {
  _id: string;
  path: string;
  date: string; // YYYY-MM-DD
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    path: { type: String, required: true },
    date: { type: String, required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

AnalyticsSchema.index({ path: 1, date: 1 }, { unique: true });

export const Analytics: Model<IAnalytics> =
  models.Analytics || model<IAnalytics>("Analytics", AnalyticsSchema);
