import { cookies } from "next/headers";
import type { Locale } from "@/types";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dictionaries, isLocale, type Dict } from "@/i18n";

export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDict(): Promise<{ locale: Locale; t: Dict }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
