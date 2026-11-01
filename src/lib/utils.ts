import type { Locale } from "@/types";

export const isObjectId = (value: string): boolean => /^[a-f\d]{24}$/i.test(value);

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "az" ? "az-AZ" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export const gradients = [
  "from-blue-600 to-sky-400",
  "from-indigo-600 to-blue-400",
  "from-sky-600 to-cyan-400",
  "from-blue-700 to-indigo-400",
  "from-cyan-600 to-blue-400",
  "from-blue-500 to-indigo-500",
];

/** True while an attempt is running and its deadline has not passed. */
export function isActive(a: { status: string; expiresAt: string }): boolean {
  return a.status === "in_progress" && new Date(a.expiresAt).getTime() > Date.now();
}

/** True when an attempt is still marked in progress but its deadline has passed. */
export function isExpired(a: { status: string; expiresAt: string }): boolean {
  return a.status === "in_progress" && new Date(a.expiresAt).getTime() <= Date.now();
}
