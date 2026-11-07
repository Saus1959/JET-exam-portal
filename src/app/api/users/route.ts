import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { guard, jsonError } from "@/lib/api";
import { connectDB } from "@/lib/mongodb";
import { encryptPassword } from "@/lib/password-crypto";
import { User } from "@/models/User";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const g = await guard("admin");
  if (g.error) return g.error;

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role === "admin" ? "admin" : "user";

  if (name.length < 2 || !EMAIL_RE.test(email) || password.length < 6) {
    return jsonError("invalid_input", 400);
  }

  await connectDB();
  if (await User.exists({ email })) return jsonError("email_taken", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const passwordEnc = role === "user" ? encryptPassword(password) : undefined;
  await User.create({ name, email, passwordHash, passwordEnc, role });
  return NextResponse.json({ ok: true }, { status: 201 });
}
