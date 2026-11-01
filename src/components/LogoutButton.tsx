"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { api } from "@/lib/client";
import { btnGhost } from "@/components/ui";

export default function LogoutButton() {
  const { t } = useI18n();
  const router = useRouter();

  async function logout() {
    await api("/api/auth/logout", "POST");
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={logout} className={btnGhost}>
      {t.nav.logout}
    </button>
  );
}
