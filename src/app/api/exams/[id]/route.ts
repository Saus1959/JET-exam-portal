import { NextResponse } from "next/server";
import { guard, jsonError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { sanitizeExam } from "@/lib/validation";
import { Attempt } from "@/models/Attempt";
import { Exam } from "@/models/Exam";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);

  const input = sanitizeExam(await req.json().catch(() => null));
  if (!input) return jsonError("invalid_input", 400);

  await connectDB();
  const updated = await Exam.findByIdAndUpdate(id, input);
  if (!updated) return jsonError("not_found", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);

  await connectDB();
  await Exam.deleteOne({ _id: id });
  await Attempt.deleteMany({ exam: id });
  return NextResponse.json({ ok: true });
}
