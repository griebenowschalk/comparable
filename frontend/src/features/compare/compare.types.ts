/**
 * Shapes aligned with `docs/serverless-fitness-data.md` (compare trio + fitness).
 * Backend may add fields; keep extras in index signatures where needed.
 */

export type CompareScope = "you" | "everyone";

/** Item in the caller’s comparison list (`COMPARE#ENTRY#…`). */
export interface CompareEntry {
  entryId: string;
  label?: string;
  targetSub?: string;
  bodySk?: string;
  createdAt?: string;
}

/** One series row for charts/tables (GET /me/compare). */
export interface CompareSeriesRow {
  id: string;
  label: string;
  /** Numeric dimensions to compare (e.g. weightKg, vo2Max, bodyFatPercent). */
  metrics: Record<string, number>;
}

/**
 * Expected JSON from `GET /me/compare?scope=you|everyone`.
 * Lambda should return at least `series` (and optionally `entries`).
 */
export interface CompareResponse {
  entries?: CompareEntry[];
  series?: CompareSeriesRow[];
}

export interface PostCompareEntryBody {
  label?: string;
  targetSub?: string;
  bodySk?: string;
}

export interface PostCompareEntryResponse {
  entryId: string;
}
