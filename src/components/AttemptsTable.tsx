import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { failPillCls, passPillCls, tdCls, thCls } from "@/components/ui";
import { pick, type Dict } from "@/i18n";
import { formatDate } from "@/lib/utils";
import type { AttemptDTO, AttemptWithUser, Locale } from "@/types";

interface Props {
  attempts: (AttemptDTO | AttemptWithUser)[];
  locale: Locale;
  t: Dict;
  showUser?: boolean;
  /** Admin only: show a delete button for finished attempts. */
  canDelete?: boolean;
}

export default function AttemptsTable({ attempts, locale, t, showUser = false, canDelete = false }: Props) {
  if (attempts.length === 0) {
    return <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">{t.common.empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
      <table className="w-full min-w-[640px]">
        <thead className="bg-slate-50">
          <tr>
            {showUser && <th className={thCls}>{t.common.user}</th>}
            <th className={thCls}>{t.common.exam}</th>
            <th className={thCls}>{t.common.score}</th>
            <th className={thCls}>{t.common.result}</th>
            <th className={thCls}>{t.common.date}</th>
            <th className={thCls} />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {attempts.map((a) => (
            <tr key={a.id}>
              {showUser && <td className={tdCls}>{"userName" in a ? a.userName : ""}</td>}
              <td className={`${tdCls} font-semibold`}>{pick(a.examTitle, locale)}</td>
              <td className={tdCls}>
                {a.status === "finished" ? `${a.score}/${a.total} · ${a.percent}%` : "—"}
              </td>
              <td className={tdCls}>
                {a.status !== "finished" ? (
                  <span className="text-slate-500">{t.exam.inProgress}</span>
                ) : (
                  <span className={a.passed ? passPillCls : failPillCls}>
                    {a.passed ? t.result.passed : t.result.failed}
                  </span>
                )}
              </td>
              <td className={`${tdCls} text-slate-500`}>{formatDate(a.finishedAt ?? a.startedAt, locale)}</td>
              <td className={`${tdCls} text-right`}>
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/attempts/${a.id}`} className="font-bold text-brand hover:underline">
                    {t.common.view}
                  </Link>
                  {canDelete && a.status === "finished" && <DeleteButton url={`/api/attempts/${a.id}`} />}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
