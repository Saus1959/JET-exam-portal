export interface ApiResult {
  ok: boolean;
  error?: string;
  data?: Record<string, unknown>;
}

/** Small fetch wrapper for client components. Errors are API error codes. */
export async function api(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.ok) return { ok: true, data };
    return { ok: false, error: typeof data.error === "string" ? data.error : "generic" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export function setLocaleCookie(locale: string): void {
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
}
