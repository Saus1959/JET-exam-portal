"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { btnDanger, btnGhost, btnPrimary, cardCls, inputCls } from "@/components/ui";
import { errorText, fmt } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";
import type { ExamInput, Localized, QuestionInput } from "@/types";

const emptyL = (): Localized => ({ en: "", az: "" });
const emptyQuestion = (): QuestionInput => ({
  text: emptyL(),
  options: [emptyL(), emptyL()],
  correctIndex: 0,
});
const blankExam = (): ExamInput => ({
  title: emptyL(),
  description: emptyL(),
  durationMinutes: 30,
  passingScore: 60,
  published: false,
  questions: [emptyQuestion()],
});

function LField({
  value,
  onChange,
  label,
  multiline,
}: {
  value: Localized;
  onChange: (v: Localized) => void;
  label: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {(["en", "az"] as const).map((l) => {
        const common = {
          value: value[l],
          placeholder: `${label} (${l.toUpperCase()})`,
          "aria-label": `${label} (${l.toUpperCase()})`,
          className: inputCls,
          onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...value, [l]: e.target.value }),
        };
        return multiline ? <textarea key={l} rows={2} {...common} /> : <input key={l} {...common} />;
      })}
    </div>
  );
}

export default function ExamEditor({ examId, initial }: { examId?: string; initial?: ExamInput }) {
  const { t } = useI18n();
  const router = useRouter();
  const [form, setForm] = useState<ExamInput>(initial ?? blankExam());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const patchQuestion = (qi: number, fn: (q: QuestionInput) => QuestionInput) =>
    setForm((f) => ({ ...f, questions: f.questions.map((q, i) => (i === qi ? fn(q) : q)) }));

  const removeOption = (qi: number, oi: number) =>
    patchQuestion(qi, (q) => ({
      ...q,
      options: q.options.filter((_, i) => i !== oi),
      correctIndex: q.correctIndex === oi ? 0 : q.correctIndex > oi ? q.correctIndex - 1 : q.correctIndex,
    }));

  async function save() {
    setBusy(true);
    setError(null);
    const res = examId
      ? await api(`/api/exams/${examId}`, "PUT", form)
      : await api("/api/exams", "POST", form);
    setBusy(false);
    if (!res.ok) {
      setError(errorText(t, res.error));
      return;
    }
    router.push("/admin/exams");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className={`${cardCls} space-y-4`}>
        <p className="text-sm text-slate-500">{t.editor.hint}</p>
        <LField label={t.editor.examTitle} value={form.title} onChange={(title) => setForm({ ...form, title })} />
        <LField
          label={t.editor.description}
          value={form.description}
          multiline
          onChange={(description) => setForm({ ...form, description })}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1">
            <span className="text-sm text-slate-600">{t.editor.duration}</span>
            <input
              type="number"
              min={1}
              max={600}
              value={form.durationMinutes}
              onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              className={inputCls}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm text-slate-600">{t.editor.passingScore}</span>
            <input
              type="number"
              min={0}
              max={100}
              value={form.passingScore}
              onChange={(e) => setForm({ ...form, passingScore: Number(e.target.value) })}
              className={inputCls}
            />
          </label>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="size-5 accent-blue-600"
          />
          <span className="font-semibold">{t.editor.published}</span>
        </label>
      </section>

      <h2 className="text-xl font-extrabold">{t.editor.questions}</h2>

      {form.questions.map((q, qi) => (
        <section key={qi} className={`${cardCls} space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-extrabold">{fmt(t.editor.questionN, { n: qi + 1 })}</h3>
            {form.questions.length > 1 && (
              <button
                type="button"
                className={btnDanger}
                onClick={() => setForm({ ...form, questions: form.questions.filter((_, i) => i !== qi) })}
              >
                {t.editor.removeQuestion}
              </button>
            )}
          </div>

          <LField
            label={t.editor.questionText}
            value={q.text}
            multiline
            onChange={(text) => patchQuestion(qi, (old) => ({ ...old, text }))}
          />

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-600">{t.editor.correct}</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-start gap-3">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => patchQuestion(qi, (old) => ({ ...old, correctIndex: oi }))}
                  aria-label={`${t.editor.correct}: ${fmt(t.editor.option, { n: oi + 1 })}`}
                  className="mt-4 size-5 shrink-0 accent-emerald-400"
                />
                <div className="flex-1">
                  <LField
                    label={fmt(t.editor.option, { n: oi + 1 })}
                    value={opt}
                    onChange={(v) =>
                      patchQuestion(qi, (old) => ({
                        ...old,
                        options: old.options.map((o, i) => (i === oi ? v : o)),
                      }))
                    }
                  />
                </div>
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qi, oi)}
                    aria-label={t.editor.removeOption}
                    title={t.editor.removeOption}
                    className="mt-2 grid size-9 shrink-0 place-items-center rounded-full text-red-600 hover:bg-red-50"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            {q.options.length < 10 && (
              <button
                type="button"
                className={btnGhost}
                onClick={() => patchQuestion(qi, (old) => ({ ...old, options: [...old.options, emptyL()] }))}
              >
                + {t.editor.addOption}
              </button>
            )}
          </div>
        </section>
      ))}

      <button
        type="button"
        className={btnGhost}
        onClick={() => setForm({ ...form, questions: [...form.questions, emptyQuestion()] })}
      >
        + {t.editor.addQuestion}
      </button>

      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={save} disabled={busy} className={btnPrimary}>
          {busy ? t.common.loading : t.common.save}
        </button>
        <button type="button" onClick={() => router.push("/admin/exams")} className={btnGhost}>
          {t.common.cancel}
        </button>
      </div>
    </div>
  );
}
