import { useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import { cn } from "@/lib/utils";
import { isPublicDebugUi } from "@/env";

import type { CompareResponse, CompareScope } from "../compare.types";
import { CompareFilterRow } from "./compare-filter-row";

type Props = {
  compareData: CompareResponse | null;
  scope: CompareScope;
  onScopeChange: (scope: CompareScope) => void;
  didFail: boolean;
  errorMessage: string | null;
  isLoading: boolean;
  onSetData: () => void;
  onClearServer: () => void;
  onRefresh: () => void;
  onRemoveEntry: (entryId: string) => Promise<void>;
};

export function CompareResultsPanel({
  compareData,
  scope,
  onScopeChange,
  didFail,
  errorMessage,
  isLoading,
  onSetData,
  onClearServer,
  onRefresh,
  onRemoveEntry,
}: Props) {
  const series = useMemo(() => compareData?.series ?? [], [compareData]);
  const entries = useMemo(() => compareData?.entries ?? [], [compareData]);

  const metricKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const row of series) {
      for (const k of Object.keys(row.metrics)) keys.add(k);
    }
    return Array.from(keys).sort();
  }, [series]);

  const [filter, setFilter] = useState<string>("");
  const [lowerIsBetter, setLowerIsBetter] = useState(true);

  const activeMetric = filter || metricKeys[0] || "";

  const rowClass = useMemo(() => {
    return (metrics: Record<string, number>) => {
      if (!series.length || !activeMetric) return "border-border bg-card";
      const values = series
        .map((r) => r.metrics[activeMetric])
        .filter((v) => typeof v === "number");
      if (!values.length) return "border-border bg-card";
      const v = metrics[activeMetric];
      if (typeof v !== "number") return "border-border bg-card";
      const best = lowerIsBetter ? Math.min(...values) : Math.max(...values);
      const isBest = v === best;
      const tieCount = values.filter((x) => x === best).length;
      if (isBest && tieCount === 1)
        return "border-emerald-500/50 bg-emerald-500/10";
      if (isBest) return "border-amber-500/50 bg-amber-500/10";
      return "border-border bg-card";
    };
  }, [series, activeMetric, lowerIsBetter]);

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Comparison results
        </h2>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed">
          Scope controls whose data is included. Refresh pulls the latest from
          the server; clear only empties this screen until you load again.
        </p>
        {isPublicDebugUi() ? (
          <p className="text-muted-foreground text-xs">
            <code className="text-xs">GET /me/compare?scope=you|everyone</code>
          </p>
        ) : null}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant={scope === "you" ? "default" : "secondary"}
            onClick={() => onScopeChange("you")}
          >
            Just me
          </Button>
          <Button
            type="button"
            variant={scope === "everyone" ? "default" : "secondary"}
            onClick={() => onScopeChange("everyone")}
          >
            Everyone
          </Button>
          <Button type="button" variant="secondary" onClick={onSetData}>
            Add another entry
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void onRefresh()}
          >
            Refresh
          </Button>
          <Button type="button" variant="destructive" onClick={onClearServer}>
            Clear this view
          </Button>
        </div>
      </header>

      {entries.length > 0 ? (
        <section
          className="border-border bg-card/30 space-y-3 rounded-lg border p-5"
          aria-labelledby="compare-entries-heading"
        >
          <div className="space-y-1 text-center sm:text-left">
            <h3 id="compare-entries-heading" className="text-sm font-medium">
              Rows you are comparing
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              These are the entries stored for your account. Delete removes one
              row from the server list (not the underlying body measurements).
            </p>
            {isPublicDebugUi() ? (
              <p className="text-muted-foreground text-xs">
                <code className="text-xs">
                  DELETE /me/compare/entries/{"{entryId}"}
                </code>
              </p>
            ) : null}
          </div>
          <ul className="space-y-2">
            {entries.map((e) => (
              <li
                key={e.entryId}
                className="border-border flex items-center justify-between gap-2 rounded-md border px-4 py-2 text-sm"
              >
                <span>
                  {e.label ?? "Untitled"}{" "}
                  <span className="text-muted-foreground">({e.entryId})</span>
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void onRemoveEntry(e.entryId)}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4" aria-labelledby="compare-metrics-heading">
        <div className="space-y-1 text-center">
          <h3 id="compare-metrics-heading" className="text-sm font-medium">
            Which number should we highlight?
          </h3>
          <p className="text-muted-foreground mx-auto max-w-md text-xs leading-relaxed">
            Pick a metric from the API response. We tint the best row green
            (ties in amber). Toggle whether lower or higher values win.
          </p>
        </div>
        {metricKeys.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm leading-relaxed">
            No numeric metrics yet. When your API returns fields like weight or
            VO₂ max on each series row, they will show up here.
            {isPublicDebugUi() ? (
              <>
                {" "}
                <code className="text-xs">series[].metrics</code>
              </>
            ) : null}
          </p>
        ) : (
          <div className="grid gap-2">
            {metricKeys.map((key) => (
              <CompareFilterRow
                key={key}
                label={key}
                active={activeMetric === key}
                onSelect={() => setFilter(key)}
              />
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={lowerIsBetter ? "default" : "outline"}
            onClick={() => setLowerIsBetter(true)}
          >
            Lower is better
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!lowerIsBetter ? "default" : "outline"}
            onClick={() => setLowerIsBetter(false)}
          >
            Higher is better
          </Button>
        </div>
      </section>

      <section aria-labelledby="compare-series-heading">
        <h3
          id="compare-series-heading"
          className="mb-3 text-center text-sm font-medium"
        >
          Side-by-side values
        </h3>
        {isLoading ? (
          <p className="text-muted-foreground text-center text-sm">Loading…</p>
        ) : null}
        {didFail && errorMessage ? (
          <AlertBanner>{errorMessage}</AlertBanner>
        ) : null}
        <ul className="space-y-2">
          {series.map((row) => (
            <li
              key={row.id}
              className={cn(
                "rounded-md border px-4 py-3 text-sm",
                rowClass(row.metrics),
              )}
            >
              <div className="font-medium">{row.label}</div>
              <div className="text-muted-foreground mt-1 font-mono text-xs">
                {activeMetric
                  ? `${activeMetric}: ${row.metrics[activeMetric] ?? "—"}`
                  : JSON.stringify(row.metrics)}
              </div>
            </li>
          ))}
        </ul>
        {!isLoading && series.length === 0 && !didFail ? (
          <p className="text-muted-foreground text-center text-sm">
            No series rows yet. Add an entry or refresh after your backend
            returns comparison data.
          </p>
        ) : null}
      </section>
    </div>
  );
}
