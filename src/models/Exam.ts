import mongoose, { Schema, type Model } from "mongoose";
import { LocalizedSchema } from "@/models/shared";
import type { ExamInput } from "@/types";

export interface IExam extends ExamInput {
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema(
  {
    text: { type: LocalizedSchema, required: true },
    options: { type: [LocalizedSchema], default: [] },
    correctIndex: { type: Number, required: true },
  },
  { _id: false },
);

const ExamSchema = new Schema<IExam>(
  {
    title: { type: LocalizedSchema, required: true },
    description: { type: LocalizedSchema, default: () => ({ en: "", az: "" }) },
    durationMinutes: { type: Number, required: true, min: 1 },
    passingScore: { type: Number, required: true, min: 0, max: 100 },
    published: { type: Boolean, default: false },
    questions: { type: [QuestionSchema], default: [] },
  },
  { timestamps: true },
);

export const Exam: Model<IExam> =
  (mongoose.models.Exam as Model<IExam>) || mongoose.model<IExam>("Exam", ExamSchema);
