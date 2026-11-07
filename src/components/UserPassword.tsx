"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnGhost, inputCls } from "@/components/ui";
import { errorText } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";
import type { Role } from "@/types";

interface Props {
  userId: string;
  role: Role;
  hasPassword: boolean;
}

const smallBtn = `${btnGhost} !px-3 !py-1.5 !text-xs`;

export default function UserPassword({ userId, role, hasPassword }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [revealed, setRevealed] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (revealed !== null) return setRevealed(null);
    setBusy(true);
    setError(null);
    const res = await api(`/api/users/${userId}/password`, "GET");
    setBusy(false);
    if (!res.ok) return setError(errorText(t, res.error));
    setRevealed(String(res.data?.password ?? ""));
  }

  async function copy() {
    if (revealed === null) return;
    await navigator.clipboard.writeText(revealed).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function save() {
    if (value.length < 6) return setError(t.errors.invalid_input);
    setBusy(true);
    setError(null);
    const res = await api(`/api/users/${userId}/password`, "PUT", { password: value });
    setBusy(false);
    if (!res.ok) return setError(errorText(t, res.error));
    setRevealed(role === "user" ? value : null);
    setEditing(false);
    setValue("");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {role === "user" && (
          <>
            <code className="rounded-lg bg-slate-100 px-2 py-1 text-xs">
              {revealed ?? (hasPassword ? "••••••••" : "—")}
            </code>
            {hasPassword && (
              <button type="button" onClick={toggle} disabled={busy} className={smallBtn}>
                {revealed !== null ? t.adminUsers.hide : t.adminUsers.show}
              </button>
            )}
            {revealed !== null && (
              <button type="button" onClick={copy} className={smallBtn}>
                {copied ? t.adminUsers.copied : t.adminUsers.copy}
              </button>
            )}
          </>
        )}
        {!editing && (
          <button type="button" onClick={() => setEditing(true)} className={smallBtn}>
            {t.adminUsers.changePassword}
          </button>
        )}
      </div>

      {role === "user" && !hasPassword && revealed === null && (
        <p className="text-xs text-slate-500">{t.adminUsers.passwordUnknown}</p>
      )}

      {editing && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            minLength={6}
            autoComplete="off"
            placeholder={t.adminUsers.newPassword}
            className={`${inputCls} !w-48 !px-3 !py-1.5 text-sm`}
          />
          <button type="button" onClick={save} disabled={busy} className={smallBtn}>
            {t.common.save}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setValue("");
              setError(null);
            }}
            className={smallBtn}
          >
            {t.common.cancel}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
