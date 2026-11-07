import mongoose, { Schema, type Model } from "mongoose";
import type { Role } from "@/types";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  /** Encrypted copy of a student's password (admin can view it). Never set for admins. */
  passwordEnc?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    passwordEnc: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
