import AttemptsTable from "@/components/AttemptsTable";
import StatCard from "@/components/StatCard";
import { cardCls } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { listAttemptsForUser } from "@/lib/attempts";
import { requireUser } from "@/lib/auth";
import { summarize } from "@/lib/stats";

export default async function StatsPage() {
  const user = await requireUser();
  const { t, locale } = await getDict();
  const attempts = await listAttemptsForUser(user.id);
  const s = summarize(attempts);

  const recent = attempts
    .filter((a) => a.status === "finished")
    .slice(0, 10)
    .reverse(); // oldest -> newest

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black md:text-4xl">{t.stats.title}</h1>
        <p className="mt-2 text-slate-600">{t.stats.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t.stats.attempts} value={s.count} />
        <StatCard label={t.stats.passed} value={s.passed} />
        <StatCard label={t.stats.average} value={`${s.average}%`} />
        <StatCard label={t.stats.best} value={`${s.best}%`} />
      </div>

      {recent.length > 0 && (
        <section className={cardCls}>
          <h2 className="mb-4 font-extrabold">{t.stats.recent}</h2>
          <div className="flex h-36 items-end gap-3">
            {recent.map((a) => (
              <div key={a.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-bold">{a.percent}%</span>
                <div
                  className={`w-full rounded-t-lg ${a.passed ? "bg-emerald-400/70" : "bg-red-400/70"}`}
                  style={{ height: `${Math.max(a.percent, 3)}%` }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-extrabold">{t.stats.history}</h2>
        <AttemptsTable attempts={attempts} locale={locale} t={t} />
      </section>
    </div>
  );
}
