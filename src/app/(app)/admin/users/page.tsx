import CreateUserForm from "@/components/CreateUserForm";
import DeleteButton from "@/components/DeleteButton";
import { passPillCls, pillCls, tdCls, thCls } from "@/components/ui";
import { getDict } from "@/i18n/server";
import { requireAdmin } from "@/lib/auth";
import { listUsers } from "@/lib/stats";
import { formatDate } from "@/lib/utils";

export default async function AdminUsersPage() {
  const me = await requireAdmin();
  const { t, locale } = await getDict();
  const users = await listUsers();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black md:text-4xl">{t.adminUsers.title}</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-200">
          <table className="w-full min-w-[640px]">
            <thead className="bg-slate-50">
              <tr>
                <th className={thCls}>{t.common.name}</th>
                <th className={thCls}>{t.common.email}</th>
                <th className={thCls}>{t.common.role}</th>
                <th className={thCls}>{t.adminUsers.created}</th>
                <th className={thCls} />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className={`${tdCls} font-semibold`}>{u.name}</td>
                  <td className={`${tdCls} text-slate-600`}>{u.email}</td>
                  <td className={tdCls}>
                    <span className={u.role === "admin" ? passPillCls : pillCls}>{t.roles[u.role]}</span>
                  </td>
                  <td className={`${tdCls} text-slate-500`}>{formatDate(u.createdAt, locale)}</td>
                  <td className={`${tdCls} text-right`}>
                    {u.id === me.id ? (
                      <span className="text-xs text-slate-500">{t.adminUsers.you}</span>
                    ) : (
                      <DeleteButton url={`/api/users/${u.id}`} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <CreateUserForm />
      </div>
    </div>
  );
}
