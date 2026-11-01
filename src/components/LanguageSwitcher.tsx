"use client";

import { useRouter } from "next/navigation";
import { LOCALES } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { setLocaleCookie } from "@/lib/client";
import type { Locale } from "@/types";

export default function LanguageSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();

  function change(next: Locale) {
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="flex rounded-full bg-slate-100 p-1 text-xs font-bold">
      {LOCALES.map((l) => (
        <button
          key={l}
          onClick={() => change(l)}
          aria-pressed={l === locale}
          className={`rounded-full px-3 py-1 transition ${
            l === locale ? "bg-brand text-white" : "text-slate-500 hover:text-brand"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
