import bcrypt from "bcryptjs";
import { User } from "@/models/User";

let checked = false;

/** Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD if it does not exist yet. */
export async function ensureAdmin(): Promise<void> {
  if (checked) return;

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    const exists = await User.exists({ email });
    if (!exists) {
      await User.create({
        name: "Administrator",
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: "admin",
      });
    }
  }
  checked = true;
}
