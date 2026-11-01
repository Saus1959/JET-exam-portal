"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { btnPrimary, cardCls, inputCls } from "@/components/ui";
import { errorText } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export default function CreateUserForm() {
  const { t } = useI18n();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError(null);
    const res = await api("/api/users", "POST", data);
    setBusy(false);
    if (!res.ok) {
      setError(errorText(t, res.error));
      return;
    }
    formRef.current?.reset();
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className={`${cardCls} space-y-3`}>
      <h2 className="text-lg font-extrabold">{t.adminUsers.create}</h2>
      <input name="name" required minLength={2} placeholder={t.adminUsers.name} className={inputCls} />
      <input name="email" type="email" required placeholder={t.common.email} className={inputCls} />
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder={t.adminUsers.password}
        className={inputCls}
      />
      <select name="role" defaultValue="user" className={inputCls}>
        <option value="user" className="bg-white">
          {t.roles.user}
        </option>
        <option value="admin" className="bg-white">
          {t.roles.admin}
        </option>
      </select>
      {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
        {busy ? t.common.loading : t.common.create}
      </button>
    </form>
  );
}
