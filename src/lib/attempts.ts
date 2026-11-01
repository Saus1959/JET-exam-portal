import type { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { Attempt, type IAttempt } from "@/models/Attempt";
import { Exam, type IExam } from "@/models/Exam";
import { User } from "@/models/User";
import type { AttemptDTO, AttemptWithUser } from "@/types";

type LeanAttempt = IAttempt & { _id: Types.ObjectId };

function toAttemptDTO(d: LeanAttempt): AttemptDTO {
  return {
    id: String(d._id),
    userId: String(d.user),
    examId: String(d.exam),
    examTitle: { en: d.examTitle.en, az: d.examTitle.az },
    answers: d.answers,
    score: d.score,
    total: d.total,
    percent: d.percent,
    passed: d.passed,
    status: d.status,
    startedAt: d.startedAt.toISOString(),
    expiresAt: d.expiresAt.toISOString(),
    finishedAt: d.finishedAt ? d.finishedAt.toISOString() : null,
  };
}

export async function getAttempt(id: string): Promise<AttemptDTO | null> {
  if (!isObjectId(id)) return null;
  await connectDB();
  const doc = await Attempt.findById(id).lean<LeanAttempt | null>();
  return doc ? toAttemptDTO(doc) : null;
}

export async function listAttemptsForUser(userId: string): Promise<AttemptDTO[]> {
  await connectDB();
  const docs = await Attempt.find({ user: userId }).sort({ startedAt: -1 }).lean<LeanAttempt[]>();
  return docs.map(toAttemptDTO);
}

export async function listRecentAttempts(limit: number): Promise<AttemptWithUser[]> {
  await connectDB();
  const docs = await Attempt.find({ status: "finished" })
    .sort({ finishedAt: -1 })
    .limit(limit)
    .lean<LeanAttempt[]>();

  const ids = [...new Set(docs.map((d) => String(d.user)))];
  const users = await User.find({ _id: { $in: ids } }).lean();
  const names = new Map(users.map((u) => [String(u._id), u.name]));

  return docs.map((d) => ({ ...toAttemptDTO(d), userName: names.get(String(d.user)) ?? "—" }));
}

/** Grades the answers and closes the attempt. Safe to call twice: only the first call wins. */
export async function finalizeAttempt(attemptId: string, answers: unknown[]): Promise<void> {
  await connectDB();
  const attempt = await Attempt.findById(attemptId).lean<LeanAttempt | null>();
  if (!attempt || attempt.status === "finished") return;

  const exam = await Exam.findById(attempt.exam).lean<(IExam & { _id: Types.ObjectId }) | null>();
  const questions = exam?.questions ?? [];

  const clean = questions.map((q, i) => {
    const a = answers[i];
    return typeof a === "number" && Number.isInteger(a) && a >= 0 && a < q.options.length ? a : -1;
  });
  const score = clean.filter((a, i) => a === questions[i].correctIndex).length;
  const total = questions.length;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = exam ? percent >= exam.passingScore : false;

  await Attempt.updateOne(
    { _id: attempt._id, status: "in_progress" },
    { $set: { answers: clean, score, total, percent, passed, status: "finished", finishedAt: new Date() } },
  );
}
