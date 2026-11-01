import Link from "next/link";
import { redirect } from "next/navigation";
import { pillCls } from "@/components/ui";
import { fmt, pick } from "@/i18n";
import { getDict } from "@/i18n/server";
import { listAttemptsForUser } from "@/lib/attempts";
import { requireUser } from "@/lib/auth";
import { listExams } from "@/lib/exams";
import { gradients } from "@/lib/utils";

export default async function HomePage() {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");

  const { t, locale } = await getDict();
  const [exams, attempts] = await Promise.all([listExams(true), listAttemptsForUser(user.id)]);

  const best = new Map<string, number>();
  for (const a of attempts) {
    if (a.status === "finished") best.set(a.examId, Math.max(best.get(a.examId) ?? 0, a.percent));
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand to-blue-500 p-8 text-white md:p-12">
        <h1 className="relative text-3xl font-black md:text-5xl">{t.home.title}</h1>
        <p className="relative mt-3 max-w-xl text-lg text-blue-100">{t.home.subtitle}</p>
        <div className="pointer-events-none absolute -right-12 -top-12 size-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full bg-white/10" />
      </section>

      {exams.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-8 text-center text-slate-500">{t.home.empty}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam, i) => {
            const result = best.get(exam.id);
            return (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-brand/10"
              >
                <div className={`h-24 bg-linear-to-br ${gradients[i % gradients.length]}`} />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="text-lg font-extrabold leading-snug">{pick(exam.title, locale)}</h2>
                  <p className="line-clamp-3 flex-1 text-sm text-slate-600">
                    {pick(exam.description, locale)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className={pillCls}>{fmt(t.home.questions, { n: exam.questions.length })}</span>
                    <span className={pillCls}>{fmt(t.home.minutes, { n: exam.durationMinutes })}</span>
                    <span className={pillCls}>{fmt(t.home.passMark, { n: exam.passingScore })}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-brand">
                      {result === undefined ? t.home.notTaken : fmt(t.home.best, { n: result })}
                    </span>
                    <span className="rounded-lg bg-brand-soft px-4 py-2 text-sm font-bold text-brand transition group-hover:bg-brand group-hover:text-white">
                      {t.home.open}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
