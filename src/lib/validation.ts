import type { ExamInput, Localized, QuestionInput } from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Returns null when both languages are empty. */
function localized(value: unknown, max: number): Localized | null {
  if (!isRecord(value)) return null;
  const result = { en: str(value.en, max), az: str(value.az, max) };
  return result.en || result.az ? result : null;
}

function intInRange(value: unknown, min: number, max: number): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export function sanitizeExam(body: unknown): ExamInput | null {
  if (!isRecord(body)) return null;

  const title = localized(body.title, 200);
  const durationMinutes = intInRange(body.durationMinutes, 1, 600);
  const passingScore = intInRange(body.passingScore, 0, 100);
  if (!title || durationMinutes === null || passingScore === null) return null;

  const desc = isRecord(body.description) ? body.description : {};
  const description: Localized = { en: str(desc.en, 1000), az: str(desc.az, 1000) };

  if (!Array.isArray(body.questions) || body.questions.length < 1 || body.questions.length > 200) {
    return null;
  }

  const questions: QuestionInput[] = [];
  for (const raw of body.questions as unknown[]) {
    if (!isRecord(raw)) return null;
    const text = localized(raw.text, 1000);
    if (!text || !Array.isArray(raw.options) || raw.options.length < 2 || raw.options.length > 10) {
      return null;
    }

    const options: Localized[] = [];
    for (const opt of raw.options as unknown[]) {
      const o = localized(opt, 500);
      if (!o) return null;
      options.push(o);
    }

    const correctIndex = intInRange(raw.correctIndex, 0, options.length - 1);
    if (correctIndex === null) return null;
    questions.push({ text, options, correctIndex });
  }

  return {
    title,
    description,
    durationMinutes,
    passingScore,
    published: body.published === true,
    questions,
  };
}
