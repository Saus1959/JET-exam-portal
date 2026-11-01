import AttemptsTable from "@/components/AttemptsTable";
import StatCard from "@/components/StatCard";
import { getDict } from "@/i18n/server";
import { listRecentAttempts } from "@/lib/attempts";
import { getAdminOverview } from "@/lib/stats";

export default async function AdminDashboard() {
  const { t, locale } = await getDict();
  const [overview, latest] = await Promise.all([getAdminOverview(), listRecentAttempts(8)]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black md:text-4xl">{t.admin.dashboard}</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.admin.totalExams} value={overview.exams} />
        <StatCard label={t.admin.totalUsers} value={overview.users} />
        <StatCard label={t.admin.totalAttempts} value={overview.attempts} />
        <StatCard label={t.admin.passRate} value={`${overview.passRate}%`} />
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">{t.admin.latest}</h2>
        <AttemptsTable attempts={latest} locale={locale} t={t} showUser />
      </section>
    </div>
  );
}
