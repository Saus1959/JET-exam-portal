"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Locale } from "@/types";
import type { Dict } from "@/i18n";

interface I18nValue {
  locale: Locale;
  t: Dict;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  t,
  children,
}: {
  locale: Locale;
  t: Dict;
  children: ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used inside <I18nProvider>");
  return value;
}
