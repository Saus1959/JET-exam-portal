"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { btnGhost, btnPrimary, cardCls } from "@/components/ui";
import { errorText, fmt } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

interface Props {
  attemptId: string;
  expiresAt: string;
  title: string;
  questions: { text: string; options: string[] }[];
}

function formatTime(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export default function TakeExam({ attemptId, expiresAt, title, questions }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);

  const submit = useCallback(async () => {
    if (sent.current) return;
    sent.current = true;
    setSubmitting(true);
    setError(null);
    const res = await api(`/api/attempts/${attemptId}/submit`, "POST", { answers });
    if (!res.ok) {
      sent.current = false;
      setSubmitting(false);
      setError(errorText(t, res.error));
      return;
    }
    router.refresh(); // the page now renders the result
  }, [answers, attemptId, router, t]);

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);

  // Tick every second; when the deadline passes, the exam is submitted automatically.
  useEffect(() => {
    const deadline = new Date(expiresAt).getTime();
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) void submitRef.current();
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  const remaining = Math.max(0, new Date(expiresAt).getTime() - now);

  const answeredCount = answers.filter((a) => a >= 0).length;
  const question = questions[index];

  function choose(optionIndex: number) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? optionIndex : a)));
  }

  function finish() {
    const missing = questions.length - answeredCount;
    if (missing > 0 && !window.confirm(fmt(t.take.unanswered, { n: missing }))) return;
    void submit();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className={cardCls}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="font-bold">
              {fmt(t.take.question, { current: index + 1, total: questions.length })}
            </p>
          </div>
          <div
            className={`rounded-2xl px-4 py-2 text-center ${
              remaining < 60_000 ? "bg-red-50 text-red-600" : "bg-slate-100"
            }`}
          >
            <p className="text-[11px] text-slate-500">{t.take.timeLeft}</p>
            <p className="text-xl font-black tabular-nums" suppressHydrationWarning>
              {formatTime(remaining)}
            </p>
          </div>
        </div>

        <h2 className="mb-5 text-xl font-extrabold leading-snug">{question.text}</h2>

        <div className="space-y-3" role="radiogroup">
          {question.options.map((option, i) => {
            const selected = answers[index] === i;
            return (
              <button
                key={i}
                role="radio"
                aria-checked={selected}
                onClick={() => choose(i)}
                disabled={submitting}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? "border-brand bg-brand-soft"
                    : "border-slate-200 bg-slate-50 hover:border-brand/50"
                }`}
              >
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${
                    selected ? "bg-brand text-white" : "bg-slate-100"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            onClick={() => setIndex((i) => i - 1)}
            disabled={index === 0 || submitting}
            className={btnGhost}
          >
            {t.take.prev}
          </button>
          {index < questions.length - 1 ? (
            <button onClick={() => setIndex((i) => i + 1)} disabled={submitting} className={btnPrimary}>
              {t.take.next}
            </button>
          ) : (
            <button onClick={finish} disabled={submitting} className={btnPrimary}>
              {submitting ? t.take.submitting : t.take.finish}
            </button>
          )}
        </div>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      </section>

      <aside className={`${cardCls} h-fit`}>
        <h3 className="mb-1 font-extrabold">{t.take.questions}</h3>
        <p className="mb-4 text-sm text-slate-500">
          {fmt(t.take.answered, { n: answeredCount, total: questions.length })}
        </p>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              disabled={submitting}
              aria-current={i === index}
              className={`aspect-square rounded-xl text-sm font-bold transition ${
                i === index
                  ? "bg-brand text-white ring-2 ring-brand/30"
                  : answers[i] >= 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 hover:bg-slate-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button onClick={finish} disabled={submitting} className={`${btnGhost} mt-5 w-full`}>
          {submitting ? t.take.submitting : t.take.finish}
        </button>
      </aside>
    </div>
  );
}
