import { apiUrl } from "./url";
import { resolveBearerToken } from "@/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {},
): Promise<Response> {
  const { accessToken, ...rest } = init;
  const token = resolveBearerToken(accessToken ?? undefined);
  const headers = new Headers(rest.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const body = rest.body;
  if (body && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const url = path.startsWith("http") ? path : apiUrl(path);
  return fetch(url, { ...rest, headers });
}

export async function apiJson<T>(
  path: string,
  init?: RequestInit & { accessToken?: string | null },
): Promise<T> {
  const res = await apiFetch(path, init);
  const text = await res.text();
  if (res.status === 204) return {} as T;
  if (!res.ok) {
    throw new ApiError(
      text || res.statusText || "Request failed",
      res.status,
      text,
    );
  }
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}
