import { redirect } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDict } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/");
  const { t } = await getDict();

  return (
    <div className="relative grid min-h-screen place-items-center bg-linear-to-b from-brand-soft to-white px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-brand/10">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-xl font-black text-white">
            E
          </span>
          <span className="text-xl font-extrabold">{t.appName}</span>
        </div>
        {children}
      </div>
    </div>
  );
}
