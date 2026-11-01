import Header from "@/components/Header";
import { getDict } from "@/i18n/server";
import { requireUser } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(); // every page in this group needs a login
  const { t } = await getDict();

  return (
    <>
      <Header user={user} t={t} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
