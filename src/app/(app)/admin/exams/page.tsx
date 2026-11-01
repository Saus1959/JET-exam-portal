import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { btnGhost, btnPrimary, passPillCls, pillCls, tdCls, thCls } from "@/components/ui";
import { pick } from "@/i18n";
import { getDict } from "@/i18n/server";
import { listExams } from "@/lib/exams";

export default async function AdminExamsPage() {
  const { t, locale } = await getDict();
  const exams = await listExams(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-black md:text-4xl">{t.adminExams.title}</h1>
        <Link href="/admin/exams/new" className={btnPrimary}>
          + {t.adminExams.new}
        </Link>
      </div>

      {exams.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">{t.common.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50">
              <tr>
                <th className={thCls}>{t.common.exam}</th>
                <th className={thCls}>{t.adminExams.questions}</th>
                <th className={thCls}>{t.common.status}</th>
                <th className={thCls}>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className={`${tdCls} font-semibold`}>{pick(exam.title, locale)}</td>
                  <td className={tdCls}>{exam.questions.length}</td>
                  <td className={tdCls}>
                    <span className={exam.published ? passPillCls : pillCls}>
                      {exam.published ? t.adminExams.published : t.adminExams.draft}
                    </span>
                  </td>
                  <td className={tdCls}>
                    <div className="flex gap-2">
                      <Link href={`/admin/exams/${exam.id}`} className={btnGhost}>
                        {t.common.edit}
                      </Link>
                      <DeleteButton url={`/api/exams/${exam.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
