import type { CellValue } from "exceljs";
import type { Localized, QuestionInput } from "@/types";

/** Лимиты совпадают с sanitizeExam (src/lib/validation.ts). */
export const MAX_QUESTIONS = 200;
export const MAX_QUESTION_LEN = 1000;
export const MAX_OPTION_LEN = 500;
export const MIN_OPTIONS = 2;
export const MAX_IMPORT_OPTIONS = 4;
const MAX_FILE_BYTES = 2 * 1024 * 1024;

/**
 * Первая строка листа — ровно такие заголовки, в таком порядке
 * (как в public/exam_import_template.xlsx). Иначе импорт отклоняется.
 *
 * A  Sual (AZ)*        B  Question (EN)
 * C  Variant 1 (AZ)*   D  Option 1 (EN)
 * E  Variant 2 (AZ)*   F  Option 2 (EN)
 * G  Variant 3 (AZ)    H  Option 3 (EN)
 * I  Variant 4 (AZ)    J  Option 4 (EN)
 * K  Düzgün Cavab / Correct (1-4)*
 */
export const IMPORT_HEADERS: string[] = [
  "Sual (AZ)*",
  "Question (EN)",
  "Variant 1 (AZ)*",
  "Option 1 (EN)",
  "Variant 2 (AZ)*",
  "Option 2 (EN)",
  "Variant 3 (AZ)",
  "Option 3 (EN)",
  "Variant 4 (AZ)",
  "Option 4 (EN)",
  "Düzgün Cavab / Correct (1-4)*",
];

const COL_QUESTION_AZ = 1;
const COL_QUESTION_EN = 2;
const COL_OPTION_FIRST = 3; // дальше пары AZ, EN
const COL_CORRECT = COL_OPTION_FIRST + MAX_IMPORT_OPTIONS * 2; // 11 (K)

export type ImportErrorCode =
  | "file_type"
  | "file_size"
  | "read_failed"
  | "no_sheet"
  | "bad_header"
  | "empty"
  | "too_many"
  | "az_required"
  | "too_long"
  | "options_min"
  | "options_gap"
  | "correct_invalid";

export interface ImportError {
  code: ImportErrorCode;
  /** Номер строки в Excel (для ошибок конкретной строки). */
  row?: number;
}

export type ImportResult =
  | { ok: true; questions: QuestionInput[] }
  | { ok: false; errors: ImportError[] };

const fail = (...errors: ImportError[]): ImportResult => ({ ok: false, errors });
const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

/** exceljs отдаёт строки, числа, rich text, формулы, ссылки — приводим к строке. */
function cellText(v: CellValue | undefined): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") {
    if ("richText" in v) return v.richText.map((r) => r.text).join("").trim();
    if ("result" in v) return cellText(v.result as CellValue); // формула
    if ("text" in v) return String(v.text).trim(); // гиперссылка
    return "";
  }
  return String(v).trim();
}

export async function parseExamFile(file: File): Promise<ImportResult> {
  if (!file.name.toLowerCase().endsWith(".xlsx")) return fail({ code: "file_type" });
  if (file.size > MAX_FILE_BYTES) return fail({ code: "file_size" });

  let sheet;
  try {
    // динамический импорт: exceljs тяжёлый, грузим только при импорте
    const ExcelJS = (await import("exceljs")).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    sheet = wb.worksheets[0]; // читаем только ПЕРВЫЙ лист (второй — инструкция)
  } catch {
    return fail({ code: "read_failed" });
  }
  if (!sheet) return fail({ code: "no_sheet" });

  // 1. Заголовки: точное совпадение, лишних колонок быть не должно
  const headerCells = sheet.getRow(1).values as CellValue[]; // индекс 0 пустой
  const width = Math.max(headerCells.length - 1, IMPORT_HEADERS.length);
  for (let c = 1; c <= width; c++) {
    const got = norm(cellText(headerCells[c]));
    const want = norm(IMPORT_HEADERS[c - 1] ?? "");
    if (got !== want) return fail({ code: "bad_header" });
  }

  // 2. Строки с данными
  const questions: QuestionInput[] = [];
  const errors: ImportError[] = [];

  for (let r = 2; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const cell = (c: number) => cellText(row.getCell(c).value);

    // шаблон содержит много пустых отформатированных строк — пропускаем
    if (IMPORT_HEADERS.every((_, i) => cell(i + 1) === "")) continue;

    const before = errors.length;
    const push = (code: ImportErrorCode) => errors.push({ code, row: r });

    // вопрос: AZ обязателен
    const text: Localized = { az: cell(COL_QUESTION_AZ), en: cell(COL_QUESTION_EN) };
    if (!text.az) push("az_required");
    if (text.az.length > MAX_QUESTION_LEN || text.en.length > MAX_QUESTION_LEN) {
      push("too_long");
    }

    // варианты: заполняются подряд, у каждого заполненного AZ обязателен
    const options: Localized[] = [];
    let gap = false;
    for (let i = 0; i < MAX_IMPORT_OPTIONS; i++) {
      const o: Localized = {
        az: cell(COL_OPTION_FIRST + i * 2),
        en: cell(COL_OPTION_FIRST + i * 2 + 1),
      };
      if (!o.az && !o.en) {
        gap = true;
        continue;
      }
      if (gap) {
        push("options_gap");
        break;
      }
      if (!o.az) push("az_required");
      if (o.az.length > MAX_OPTION_LEN || o.en.length > MAX_OPTION_LEN) push("too_long");
      options.push(o);
    }
    if (options.length < MIN_OPTIONS) push("options_min");

    // правильный ответ: номер 1..N, N — число заполненных вариантов
    const raw = cell(COL_CORRECT);
    const n = Number(raw);
    if (raw === "" || !Number.isInteger(n) || n < 1 || n > options.length) {
      push("correct_invalid");
    }

    if (errors.length === before) questions.push({ text, options, correctIndex: n - 1 });
  }

  if (errors.length) return fail(...errors);
  if (questions.length === 0) return fail({ code: "empty" });
  if (questions.length > MAX_QUESTIONS) return fail({ code: "too_many" });
  return { ok: true, questions };
}
