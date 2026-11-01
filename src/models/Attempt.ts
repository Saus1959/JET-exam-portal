import mongoose, { Schema, type Model, type Types } from "mongoose";
import { LocalizedSchema } from "@/models/shared";
import type { AttemptStatus, Localized } from "@/types";

export interface IAttempt {
  user: Types.ObjectId;
  exam: Types.ObjectId;
  examTitle: Localized;
  answers: number[];
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  status: AttemptStatus;
  startedAt: Date;
  expiresAt: Date;
  finishedAt?: Date;
}

const AttemptSchema = new Schema<IAttempt>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
  examTitle: { type: LocalizedSchema, required: true },
  answers: { type: [Number], default: [] },
  score: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  percent: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  status: { type: String, enum: ["in_progress", "finished"], default: "in_progress" },
  startedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  finishedAt: { type: Date },
});

export const Attempt: Model<IAttempt> =
  (mongoose.models.Attempt as Model<IAttempt>) ||
  mongoose.model<IAttempt>("Attempt", AttemptSchema);
