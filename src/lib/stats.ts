import { connectDB } from "@/lib/mongodb";
import { Attempt } from "@/models/Attempt";
import { Exam } from "@/models/Exam";
import { User } from "@/models/User";
import type { AttemptDTO, UserDTO } from "@/types";

export async function getAdminOverview() {
  await connectDB();
  const [exams, users, attempts, passed] = await Promise.all([
    Exam.countDocuments(),
    User.countDocuments({ role: "user" }),
    Attempt.countDocuments({ status: "finished" }),
    Attempt.countDocuments({ status: "finished", passed: true }),
  ]);
  return { exams, users, attempts, passRate: attempts ? Math.round((passed / attempts) * 100) : 0 };
}

export function summarize(attempts: AttemptDTO[]) {
  const finished = attempts.filter((a) => a.status === "finished");
  const passed = finished.filter((a) => a.passed).length;
  const average = finished.length
    ? Math.round(finished.reduce((sum, a) => sum + a.percent, 0) / finished.length)
    : 0;
  const best = finished.reduce((max, a) => Math.max(max, a.percent), 0);
  return { count: finished.length, passed, average, best };
}

export async function listUsers(): Promise<UserDTO[]> {
  await connectDB();
  const docs = await User.find().sort({ createdAt: -1 }).lean();
  return docs.map((u) => ({
    id: String(u._id),
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));
}
