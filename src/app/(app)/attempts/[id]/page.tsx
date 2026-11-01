import Link from "next/link";
import { notFound } from "next/navigation";
import TakeExam from "@/components/TakeExam";
import { btnGhost, cardCls, failPillCls, passPillCls } from "@/components/ui";
import { fmt, pick } from "@/i18n";
import { getDict } from "@/i18n/server";
import { finalizeAttempt, getAttempt } from "@/lib/attempts";
import { requireUser } from "@/lib/auth";
import { getExam } from "@/lib/exams";
import { formatDate, isExpired } from "@/lib/utils";

export default async function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const { t, locale } = await getDict();

  let attempt = await getAttempt(id);
  if (!attempt) notFound();

  const isOwner = attempt.userId === user.id;
  if (!isOwner && user.role !== "admin") notFound();

  // The deadline passed while the student was away: close the attempt.
  if (isExpired(attempt)) {
    await finalizeAttempt(id, []);
    attempt = (await getAttempt(id)) ?? attempt;
  }

  const exam = await getExam(attempt.examId);
  if (!exam) notFound();

  // ---------- Exam in progress ----------
  if (attempt.status === "in_progress") {
    if (!isOwner) notFound();
    return (
      <TakeExam
        attemptId={attempt.id}
        expiresAt={attempt.expiresAt}
        title={pick(exam.title, locale)}
        questions={exam.questions.map((q) => ({
          text: pick(q.text, locale),
          options: q.options.map((o) => pick(o, locale)),
        }))}
      />
    );
  }

  // ---------- Result ----------
  const backHref = isOwner && user.role !== "admin" ? "/" : "/admin/results";

  return (
    <div className="space-y-8">
      <section className={`${cardCls} space-y-3 text-center`}>
        <p className="text-slate-500">{pick(attempt.examTitle, locale)}</p>
        <p className="text-6xl font-black">{attempt.percent}%</p>
        <div>
          <span className={attempt.passed ? passPillCls : failPillCls}>
            {attempt.passed ? t.result.passed : t.result.failed}
          </span>
        </div>
        <p className="font-semibold">{fmt(t.result.correctOf, { score: attempt.score, total: attempt.total })}</p>
        {attempt.finishedAt && (
          <p className="text-sm text-slate-500">
            {fmt(t.result.finishedAt, { date: formatDate(attempt.finishedAt, locale) })}
          </p>
        )}
        <Link href={backHref} className={btnGhost}>
          {backHref === "/" ? t.result.back : t.result.backAdmin}
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-extrabold">{t.result.review}</h2>
        {exam.questions.map((q, qi) => {
          const chosen = attempt.answers[qi] ?? -1;
          return (
            <article key={qi} className={`${cardCls} space-y-3`}>
              <h3 className="font-extrabold">
                {qi + 1}. {pick(q.text, locale)}
              </h3>
              <ul className="space-y-2">
                {q.options.map((o, oi) => {
                  const correct = oi === q.correctIndex;
                  const wrong = oi === chosen && !correct;
                  return (
                    <li
                      key={oi}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-sm ${
                        correct
                          ? "border-emerald-300 bg-emerald-50"
                          : wrong
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200"
                      }`}
                    >
                      <span>{pick(o, locale)}</span>
                      <span className="text-xs font-bold">
                        {correct && <span className="text-emerald-700">{t.result.correctAnswer}</span>}
                        {oi === chosen && <span className="ml-2 text-slate-600">{t.result.yourAnswer}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {chosen < 0 && <p className="text-sm text-amber-600">{t.result.notAnswered}</p>}
            </article>
          );
        })}
      </section>
    </div>
  );
}
