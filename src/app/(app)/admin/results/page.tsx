import AttemptsTable from "@/components/AttemptsTable";
import { getDict } from "@/i18n/server";
import { listRecentAttempts } from "@/lib/attempts";

export default async function AdminResultsPage() {
  const { t, locale } = await getDict();
  const attempts = await listRecentAttempts(100);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black md:text-4xl">{t.nav.results}</h1>
      <AttemptsTable attempts={attempts} locale={locale} t={t} showUser />
    </div>
  );
}
