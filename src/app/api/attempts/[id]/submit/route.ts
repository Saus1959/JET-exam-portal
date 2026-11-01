import { NextResponse } from "next/server";
import { guard, jsonError } from "@/lib/api";
import { finalizeAttempt } from "@/lib/attempts";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { Attempt } from "@/models/Attempt";

const GRACE_MS = 30_000;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard();
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);

  await connectDB();
  const attempt = await Attempt.findById(id);
  if (!attempt || String(attempt.user) !== g.user.id) return jsonError("not_found", 404);
  if (attempt.status === "finished") return NextResponse.json({ ok: true });

  const body = (await req.json().catch(() => null)) as { answers?: unknown } | null;
  const answers = Array.isArray(body?.answers) ? (body.answers as unknown[]) : [];

  // Answers that arrive long after the deadline are ignored.
  const late = Date.now() > attempt.expiresAt.getTime() + GRACE_MS;
  await finalizeAttempt(id, late ? [] : answers);
  return NextResponse.json({ ok: true });
}
