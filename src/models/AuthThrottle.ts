import { Schema, model, models, type Model } from "mongoose";

export interface IAuthThrottle {
  key: string;
  count: number;
  resetAt: Date;
  blockedUntil?: Date;
  expiresAt: Date;
}

const AuthThrottleSchema = new Schema<IAuthThrottle>(
  {
    key: { type: String, required: true, unique: true },
    count: { type: Number, required: true, default: 0 },
    resetAt: { type: Date, required: true },
    blockedUntil: { type: Date },
    expiresAt: { type: Date, required: true },
  },
  { versionKey: false }
);

AuthThrottleSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthThrottle: Model<IAuthThrottle> =
  models.AuthThrottle || model<IAuthThrottle>("AuthThrottle", AuthThrottleSchema);
