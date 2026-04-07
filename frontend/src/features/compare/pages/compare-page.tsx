import { useCallback } from "react";

import { useAuth } from "@/features/auth/auth-context";
import { PageShell } from "@/shared/components/layout/page-shell";

import type { CompareScope } from "../compare.types";
import { CompareInputForm } from "../components/compare-input-form";
import { CompareResultsPanel } from "../components/compare-results-panel";
import { useCompareFlow, useCompareResults } from "../use-compare-flow";

export function ComparePage() {
  const { accessToken } = useAuth();
  const { showInput, goToInput, goToResults } = useCompareFlow();
  const {
    compareData,
    scope,
    setScope,
    didFail,
    errorMessage,
    isLoading,
    fetchCompare,
    addEntry,
    removeEntry,
    clearResults,
    setDidFail,
  } = useCompareResults(accessToken);

  const onAddEntry = useCallback(
    async (body: Parameters<typeof addEntry>[0]) => {
      setDidFail(false);
      await addEntry(body);
      goToResults();
    },
    [addEntry, goToResults, setDidFail],
  );

  const onLoadFromServer = useCallback(async () => {
    await fetchCompare();
    goToResults();
  }, [fetchCompare, goToResults]);

  const onScopeChange = useCallback(
    (next: CompareScope) => {
      setScope(next);
      void fetchCompare(next);
    },
    [setScope, fetchCompare],
  );

  return (
    <PageShell className="max-w-3xl">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm">
          {showInput
            ? "Step 1: define what appears in your comparison, then review charts and rankings."
            : "Step 2: review entries, choose a metric, and see how each row stacks up."}
        </p>
      </div>
      {showInput ? (
        <CompareInputForm
          onAddEntry={onAddEntry}
          onLoadFromServer={onLoadFromServer}
        />
      ) : (
        <CompareResultsPanel
          compareData={compareData}
          scope={scope}
          onScopeChange={onScopeChange}
          didFail={didFail}
          errorMessage={errorMessage}
          isLoading={isLoading}
          onSetData={goToInput}
          onClearServer={() => {
            clearResults();
            setDidFail(false);
          }}
          onRefresh={() => void fetchCompare()}
          onRemoveEntry={removeEntry}
        />
      )}
    </PageShell>
  );
}
