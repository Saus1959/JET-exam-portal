import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { Exam, type IExam } from "@/models/Exam";
import type { ExamDTO } from "@/types";

type LeanExam = IExam & { _id: Types.ObjectId };

function toExamDTO(d: LeanExam): ExamDTO {
  return {
    id: String(d._id),
    title: { en: d.title.en, az: d.title.az },
    description: { en: d.description?.en ?? "", az: d.description?.az ?? "" },
    durationMinutes: d.durationMinutes,
    passingScore: d.passingScore,
    published: d.published,
    questions: d.questions.map((q) => ({
      text: { en: q.text.en, az: q.text.az },
      options: q.options.map((o) => ({ en: o.en, az: o.az })),
      correctIndex: q.correctIndex,
    })),
  };
}

export async function listExams(onlyPublished: boolean): Promise<ExamDTO[]> {
  await connectDB();
  const docs = await Exam.find(onlyPublished ? { published: true } : {})
    .sort({ createdAt: -1 })
    .lean<LeanExam[]>();
  return docs.map(toExamDTO);
}

export async function getExam(id: string): Promise<ExamDTO | null> {
  if (!isObjectId(id)) return null;
  await connectDB();
  const doc = await Exam.findById(id).lean<LeanExam | null>();
  return doc ? toExamDTO(doc) : null;
}
