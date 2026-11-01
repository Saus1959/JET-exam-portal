import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import HtmlLang from "@/components/HtmlLang";
import { I18nProvider } from "@/i18n/client";
import { getDict } from "@/i18n/server";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "ExamHub",
  description: "Online exams / Onlayn imtahanlar",
};

/**
 * Everything that depends on the request (language cookie, session, database) lives inside
 * this Suspense boundary. The root layout itself is static, so the app works both with and
 * without `cacheComponents` in next.config.ts.
 */
async function RequestShell({ children }: { children: ReactNode }) {
  const { locale, t } = await getDict();
  return (
    <I18nProvider locale={locale} t={t}>
      <HtmlLang locale={locale} />
      {children}
    </I18nProvider>
  );
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="az" className={nunito.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Suspense
          fallback={
            <div className="grid min-h-screen place-items-center">
              <div className="size-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            </div>
          }
        >
          <RequestShell>{children}</RequestShell>
        </Suspense>
      </body>
    </html>
  );
}
