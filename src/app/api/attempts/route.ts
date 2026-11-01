import { NextResponse } from "next/server";
import { guard, jsonError } from "@/lib/api";
import { finalizeAttempt } from "@/lib/attempts";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { Attempt } from "@/models/Attempt";
import { Exam } from "@/models/Exam";

/** Starts an exam (or returns the attempt that is already running). */
export async function POST(req: Request) {
  const g = await guard();
  if (g.error) return g.error;

  const body = (await req.json().catch(() => null)) as { examId?: unknown } | null;
  const examId = typeof body?.examId === "string" ? body.examId : "";
  if (!isObjectId(examId)) return jsonError("not_found", 404);

  await connectDB();
  const exam = await Exam.findById(examId);
  if (!exam || (!exam.published && g.user.role !== "admin")) return jsonError("exam_unavailable", 404);

  const running = await Attempt.findOne({ user: g.user.id, exam: examId, status: "in_progress" });
  if (running) {
    if (running.expiresAt.getTime() > Date.now()) {
      return NextResponse.json({ id: String(running._id) });
    }
    await finalizeAttempt(String(running._id), []); // expired while away
  }

  const startedAt = new Date();
  const attempt = await Attempt.create({
    user: g.user.id,
    exam: examId,
    examTitle: { en: exam.title.en, az: exam.title.az },
    total: exam.questions.length,
    startedAt,
    expiresAt: new Date(startedAt.getTime() + exam.durationMinutes * 60_000),
  });
  return NextResponse.json({ id: String(attempt._id) }, { status: 201 });
}
