import { NextResponse } from "next/server";
import { guard, jsonError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { Attempt } from "@/models/Attempt";

/** Admin only: delete a finished attempt (a running one cannot be deleted). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);

  await connectDB();
  const result = await Attempt.deleteOne({ _id: id, status: "finished" });
  if (result.deletedCount === 0) return jsonError("not_found", 404);
  return NextResponse.json({ ok: true });
}
