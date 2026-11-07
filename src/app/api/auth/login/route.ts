import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureAdmin } from "@/lib/admin-seed";
import { jsonError } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { encryptPassword } from "@/lib/password-crypto";
import { User } from "@/models/User";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) return jsonError("invalid_input", 400);

  try {
    await connectDB();
    await ensureAdmin();

    const user = await User.findOne({ email });
    const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!user || !valid) return jsonError("invalid_credentials", 401);

    // Accounts created before the "admin can view passwords" feature: remember the password on first login.
    if (user.role === "user" && !user.passwordEnc) {
      await User.updateOne({ _id: user._id }, { $set: { passwordEnc: encryptPassword(password) } });
    }

    await createSession(String(user._id));
  } catch (err) {
    // Shows up in Vercel -> Logs (missing env vars, MongoDB Atlas network access, etc.)
    console.error("[login] failed:", err);
    return jsonError("generic", 500);
  }
  return NextResponse.json({ ok: true });
}
