import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureAdmin } from "@/lib/admin-seed";
import { jsonError } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) return jsonError("invalid_input", 400);

  await connectDB();
  await ensureAdmin();

  const user = await User.findOne({ email });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) return jsonError("invalid_credentials", 401);

  await createSession(String(user._id));
  return NextResponse.json({ ok: true });
}
