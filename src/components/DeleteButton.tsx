"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { btnDanger } from "@/components/ui";
import { errorText } from "@/i18n";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";

export default function DeleteButton({ url }: { url: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(t.common.confirmDelete)) return;
    setBusy(true);
    const res = await api(url, "DELETE");
    setBusy(false);
    if (!res.ok) {
      window.alert(errorText(t, res.error));
      return;
    }
    router.refresh();
  }

  return (
    <button onClick={remove} disabled={busy} className={btnDanger}>
      {t.common.delete}
    </button>
  );
}
