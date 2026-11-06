import { redirect } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getDict } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await getCurrentUser()) redirect("/");
  const { t } = await getDict();

  return (
    <div className="relative grid min-h-screen place-items-center bg-linear-to-br from-sky via-white to-white px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-3xl border border-jet/15 bg-white p-8 shadow-xl shadow-jet/10">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-12 w-35 place-items-center rounded-xl bg-[url('/jetlogo.png')] bg-cover"></span>
          {/*  <span className="text-xl font-extrabold">{t.appName}</span> */}
        </div>
        {children}
      </div>
    </div>
  );
}
