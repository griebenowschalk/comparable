import { apiFetch, apiJson, ApiError } from "@/api/client";
import { getPublicApiUrl } from "@/env";

import type {
  CompareResponse,
  CompareScope,
  PostCompareEntryBody,
  PostCompareEntryResponse,
} from "./compare.types";

export async function getCompare(
  scope: CompareScope,
  accessToken: string | null,
): Promise<CompareResponse> {
  if (!getPublicApiUrl()) {
    throw new Error("Set PUBLIC_API_URL in frontend/.env");
  }
  return apiJson<CompareResponse>(
    `/me/compare?scope=${encodeURIComponent(scope)}`,
    { method: "GET", accessToken },
  );
}

export async function postCompareEntry(
  body: PostCompareEntryBody,
  accessToken: string | null,
): Promise<PostCompareEntryResponse> {
  return apiJson<PostCompareEntryResponse>("/me/compare/entries", {
    method: "POST",
    body: JSON.stringify(body),
    accessToken,
  });
}

export async function deleteCompareEntry(
  entryId: string,
  accessToken: string | null,
): Promise<void> {
  const res = await apiFetch(
    `/me/compare/entries/${encodeURIComponent(entryId)}`,
    { method: "DELETE", accessToken },
  );
  if (res.ok || res.status === 204) return;
  const text = await res.text();
  throw new ApiError(text || res.statusText, res.status, text);
}
