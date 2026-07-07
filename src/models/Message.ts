import { Schema, model, models, type Model } from "mongoose";

export interface IMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  content: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    subject: { type: String, default: "" },
    content: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Message: Model<IMessage> =
  models.Message || model<IMessage>("Message", MessageSchema);
