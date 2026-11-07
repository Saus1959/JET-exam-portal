import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guard, jsonError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { decryptPassword, encryptPassword } from "@/lib/password-crypto";
import { isObjectId } from "@/lib/utils";
import { User } from "@/models/User";

type Ctx = { params: Promise<{ id: string }> };

/** Admin only: reveal a student's password. */
export async function GET(_req: Request, { params }: Ctx) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);

  await connectDB();
  const user = await User.findById(id).select("role passwordEnc").lean();
  if (!user) return jsonError("not_found", 404);

  const password = user.role === "user" && user.passwordEnc ? decryptPassword(user.passwordEnc) : null;
  if (password === null) return jsonError("password_unknown", 404);

  return NextResponse.json({ password }, { headers: { "Cache-Control": "no-store" } });
}

/** Admin only: set a new password for any account. */
export async function PUT(req: Request, { params }: Ctx) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const { id } = await params;
  if (!isObjectId(id)) return jsonError("not_found", 404);

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";
  if (password.length < 6 || password.length > 100) return jsonError("invalid_input", 400);

  await connectDB();
  const user = await User.findById(id).select("role").lean();
  if (!user) return jsonError("not_found", 404);

  const passwordHash = await bcrypt.hash(password, 10);
  await User.updateOne(
    { _id: id },
    user.role === "user"
      ? { $set: { passwordHash, passwordEnc: encryptPassword(password) } }
      : { $set: { passwordHash }, $unset: { passwordEnc: "" } },
  );
  return NextResponse.json({ ok: true });
}
