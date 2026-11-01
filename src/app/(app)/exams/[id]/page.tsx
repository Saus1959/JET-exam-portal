import { notFound } from "next/navigation";
import AttemptsTable from "@/components/AttemptsTable";
import StartExamButton from "@/components/StartExamButton";
import { cardCls, pillCls } from "@/components/ui";
import { fmt, pick } from "@/i18n";
import { getDict } from "@/i18n/server";
import { listAttemptsForUser } from "@/lib/attempts";
import { requireUser } from "@/lib/auth";
import { getExam } from "@/lib/exams";
import { isActive } from "@/lib/utils";

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const exam = await getExam(id);
  if (!exam || (!exam.published && user.role !== "admin")) notFound();

  const { t, locale } = await getDict();
  const attempts = (await listAttemptsForUser(user.id)).filter((a) => a.examId === id);

  return (
    <div className="space-y-8">
      <section className={`${cardCls} space-y-4`}>
        <h1 className="text-3xl font-black">{pick(exam.title, locale)}</h1>
        <p className="max-w-2xl text-slate-600">{pick(exam.description, locale)}</p>
        <div className="flex flex-wrap gap-2">
          <span className={pillCls}>{fmt(t.home.questions, { n: exam.questions.length })}</span>
          <span className={pillCls}>{fmt(t.home.minutes, { n: exam.durationMinutes })}</span>
          <span className={pillCls}>{fmt(t.home.passMark, { n: exam.passingScore })}</span>
        </div>

        <div>
          <h2 className="mb-2 font-extrabold">{t.exam.rules}</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>{fmt(t.exam.ruleTime, { n: exam.durationMinutes })}</li>
            <li>{t.exam.ruleSingle}</li>
            <li>{t.exam.ruleLeave}</li>
            <li>{fmt(t.exam.rulePass, { n: exam.passingScore })}</li>
          </ul>
        </div>

        <StartExamButton examId={exam.id} resume={attempts.some(isActive)} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">{t.exam.history}</h2>
        {attempts.length === 0 ? (
          <p className="text-slate-500">{t.exam.noAttempts}</p>
        ) : (
          <AttemptsTable attempts={attempts} locale={locale} t={t} />
        )}
      </section>
    </div>
  );
}
