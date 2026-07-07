import { Schema, model, models, type Model } from "mongoose";

export interface ICertificate {
  _id: string;
  name: string;
  issuer: string;
  issueDate?: Date;
  credentialUrl?: string;
  image?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    issueDate: { type: Date },
    credentialUrl: { type: String, default: "" },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  models.Certificate || model<ICertificate>("Certificate", CertificateSchema);
