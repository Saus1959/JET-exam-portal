import { NextResponse } from "next/server";
import { guard, jsonError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { isObjectId } from "@/lib/utils";
import { Attempt } from "@/models/Attempt";
import { User } from "@/models/User";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);
  if (id === g.user.id) return jsonError("cannot_delete_self", 400);

  await connectDB();
  await User.deleteOne({ _id: id });
  await Attempt.deleteMany({ user: id });
  return NextResponse.json({ ok: true });
}
