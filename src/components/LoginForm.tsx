"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { btnPrimary, inputCls } from "@/components/ui";
import { errorText } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export default function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setError(null);
    setLoading(true);

    const res = await api("/api/auth/login", "POST", data);
    setLoading(false);

    if (!res.ok) {
      setError(errorText(t, res.error));
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">{t.login.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{t.login.subtitle}</p>
      </div>

      <input name="email" type="email" required autoComplete="email" placeholder={t.login.email} className={inputCls} />
      <input
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder={t.login.password}
        className={inputCls}
      />

      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
        {loading ? t.common.loading : t.login.submit}
      </button>

      <p className="text-center text-sm text-slate-500">{t.login.note}</p>
    </form>
  );
}
