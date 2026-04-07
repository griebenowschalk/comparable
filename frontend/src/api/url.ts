import { getPublicApiUrl } from "@/env";

/** Join base URL (from `PUBLIC_API_URL`) with an absolute path like `/me/compare`. */
export function apiUrl(path: string): string {
  const base = getPublicApiUrl().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}
