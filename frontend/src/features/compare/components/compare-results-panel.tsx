import { useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import { cn } from "@/lib/utils";

import type { CompareData, CompareFilter } from "../compare.types";
import { CompareFilterRow } from "./compare-filter-row";

type Props = {
  user: CompareData;
  compareData: CompareData[] | null;
  didFail: boolean;
  isLoading: boolean;
  onSetData: () => void;
  onClearServer: () => void;
  onGetResults: () => void;
};

export function CompareResultsPanel({
  user,
  compareData,
  didFail,
  isLoading,
  onSetData,
  onClearServer,
  onGetResults,
}: Props) {
  const [filter, setFilter] = useState<CompareFilter>("age");
  const [lowerIsBetter, setLowerIsBetter] = useState(true);

  const rows = compareData ?? [];

  const rowClass = useMemo(() => {
    return (row: CompareData) => {
      const list = compareData ?? [];
      if (!list.length) return "border-border bg-card";
      const values = list.map((r) => r[filter]);
      const v = row[filter];
      const best = lowerIsBetter ? Math.min(...values) : Math.max(...values);
      const isBest = v === best;
      const tieCount = values.filter((x) => x === best).length;
      if (isBest && tieCount === 1)
        return "border-emerald-500/50 bg-emerald-500/10";
      if (isBest) return "border-amber-500/50 bg-amber-500/10";
      return "border-border bg-card";
    };
  }, [compareData, filter, lowerIsBetter]);

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Your results</h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="secondary" onClick={onSetData}>
            Set data
          </Button>
          <Button type="button" variant="destructive" onClick={onClearServer}>
            Clear data on server
          </Button>
          <Button type="button" onClick={onGetResults}>
            Get results
          </Button>
        </div>
      </div>
      <hr className="border-border" />
      <div className="space-y-4">
        <h3 className="text-center text-base font-medium">Select filter</h3>
        <div className="grid gap-2">
          <CompareFilterRow
            label={`Your age: ${user.age}`}
            active={filter === "age"}
            onSelect={() => setFilter("age")}
          />
          <CompareFilterRow
            label={`Your height: ${user.height}`}
            active={filter === "height"}
            onSelect={() => setFilter("height")}
          />
          <CompareFilterRow
            label={`Your income: ${user.income}`}
            active={filter === "income"}
            onSelect={() => setFilter("income")}
          />
        </div>
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
      </div>
      <hr className="border-border" />
      {isLoading ? (
        <p className="text-muted-foreground text-center text-sm">Loading…</p>
      ) : null}
      {didFail ? (
        <AlertBanner>An error occurred, please try again!</AlertBanner>
      ) : null}
      <ul className="space-y-2">
        {rows.map((data, i) => (
          <li
            key={`${data.age}-${data.height}-${data.income}-${i}`}
            className={cn(
              "rounded-md border px-4 py-3 text-sm",
              rowClass(data),
            )}
          >
            Age: {data.age} | Height: {data.height} | Income: {data.income}
          </li>
        ))}
      </ul>
    </div>
  );
}
