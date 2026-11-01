"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnPrimary } from "@/components/ui";
import { errorText } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export default function StartExamButton({ examId, resume }: { examId: string; resume: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    const res = await api("/api/attempts", "POST", { examId });
    if (!res.ok || typeof res.data?.id !== "string") {
      setBusy(false);
      setError(errorText(t, res.error));
      return;
    }
    router.push(`/attempts/${res.data.id}`);
  }

  return (
    <div>
      <button onClick={start} disabled={busy} className={btnPrimary}>
        {busy ? t.common.loading : resume ? t.exam.continue : t.exam.start}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
