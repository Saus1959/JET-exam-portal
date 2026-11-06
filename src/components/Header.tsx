import Link from "next/link";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LogoutButton from "@/components/LogoutButton";
import type { Dict } from "@/i18n";
import type { SessionUser } from "@/lib/auth";

export default function Header({ user, t }: { user: SessionUser; t: Dict }) {
  const links =
    user.role === "admin"
      ? [
          { href: "/admin", label: t.nav.dashboard },
          { href: "/admin/exams", label: t.nav.adminExams },
          { href: "/admin/users", label: t.nav.users },
          { href: "/admin/results", label: t.nav.results },
        ]
      : [
          { href: "/", label: t.nav.exams },
          { href: "/stats", label: t.nav.stats },
        ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-jet backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href={user.role === "admin" ? "/admin" : "/"}
          className="flex items-center gap-2"
        >
          <span className="grid h-12 w-35 place-items-center rounded-xl bg-[url('/jetlogo.png')] bg-cover"></span>
          <span className="text-lg font-extrabold text-white">{t.appName}</span>
        </Link>

        <nav className="order-3 flex w-full gap-5 overflow-x-auto text-sm font-semibold text-slate-600 sm:order-none sm:w-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap text-white font-extrabold transition hover:text-brand"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-white font-bold md:inline">
            {user.name}
          </span>
          <LanguageSwitcher />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
