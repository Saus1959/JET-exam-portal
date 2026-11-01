import type { Locale, Localized } from "@/types";
import { az } from "./dictionaries/az";
import { en, type Dict } from "./dictionaries/en";

export type { Dict };

export const LOCALES: Locale[] = ["az", "en"];
export const DEFAULT_LOCALE: Locale = "az";
export const LOCALE_COOKIE = "locale";

export const dictionaries: Record<Locale, Dict> = { en, az };

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "az";
}

/** "{n} questions" + { n: 5 } -> "5 questions" */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}

/** Pick the text in the active language, falling back to the other one. */
export function pick(value: Localized, locale: Locale): string {
  const other: Locale = locale === "en" ? "az" : "en";
  return value[locale] || value[other] || "";
}

/** Map an API error code to a translated message. */
export function errorText(t: Dict, code?: string): string {
  const map = t.errors as Record<string, string>;
  return (code && map[code]) || t.errors.generic;
}
