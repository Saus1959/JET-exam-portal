import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

export function jsonError(code: string, status: number) {
  return NextResponse.json({ error: code }, { status });
}

type Guard = { user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse };

/** Use in route handlers: `const g = await guard("admin"); if (g.error) return g.error;` */
export async function guard(role?: "admin"): Promise<Guard> {
  const user = await getCurrentUser();
  if (!user) return { error: jsonError("unauthorized", 401) };
  if (role === "admin" && user.role !== "admin") return { error: jsonError("forbidden", 403) };
  return { user };
}
