/**
 * Fills the database with the first admin, the students and a sample exam.
 * Safe to run many times: existing records are skipped.
 *
 *   npm run seed
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { encryptPassword } from "../src/lib/password-crypto";
import { SAMPLE_EXAM, STUDENTS, toEmail } from "../src/lib/seed-data";
import { Exam } from "../src/models/Exam";
import { User } from "../src/models/User";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not defined (.env.local)");

  const studentPassword = process.env.SEED_STUDENT_PASSWORD || "Exam2026!";
  await mongoose.connect(uri);

  // --- admin ---
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    if (!(await User.exists({ email: adminEmail }))) {
      await User.create({
        name: "Administrator",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 10),
        role: "admin",
      });
      console.log(`+ admin   ${adminEmail}`);
    } else {
      console.log(`= admin   ${adminEmail} (already exists)`);
    }
  } else {
    console.log("! ADMIN_EMAIL / ADMIN_PASSWORD not set: admin was not created");
  }

  // --- students ---
  const passwordHash = await bcrypt.hash(studentPassword, 10);
  for (const name of STUDENTS) {
    const email = toEmail(name);
    if (await User.exists({ email })) {
      // Backfill the admin-visible password if the student still uses the seed password.
      const existing = await User.findOne({ email });
      if (existing && !existing.passwordEnc && (await bcrypt.compare(studentPassword, existing.passwordHash))) {
        await User.updateOne({ _id: existing._id }, { $set: { passwordEnc: encryptPassword(studentPassword) } });
        console.log(`~ student ${email} (password stored for admin view)`);
      } else {
        console.log(`= student ${email} (already exists)`);
      }
      continue;
    }
    await User.create({ name, email, passwordHash, passwordEnc: encryptPassword(studentPassword), role: "user" });
    console.log(`+ student ${email}  (${name})`);
  }

  // --- sample exam ---
  if (!(await Exam.exists({ "title.en": SAMPLE_EXAM.title.en }))) {
    await Exam.create(SAMPLE_EXAM);
    console.log(`+ exam    ${SAMPLE_EXAM.title.en}`);
  } else {
    console.log(`= exam    ${SAMPLE_EXAM.title.en} (already exists)`);
  }

  console.log(`\nStudent password: ${studentPassword}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect();
  process.exit(1);
});
