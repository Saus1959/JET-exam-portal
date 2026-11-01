import { NextResponse } from "next/server";
import { guard, jsonError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { sanitizeExam } from "@/lib/validation";
import { Exam } from "@/models/Exam";

export async function POST(req: Request) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const input = sanitizeExam(await req.json().catch(() => null));
  if (!input) return jsonError("invalid_input", 400);

  await connectDB();
  const exam = await Exam.create(input);
  return NextResponse.json({ id: String(exam._id) }, { status: 201 });
}
