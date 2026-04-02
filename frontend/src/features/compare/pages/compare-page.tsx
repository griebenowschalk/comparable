import { useCallback, useState } from "react";

import { PageShell } from "@/shared/components/layout/page-shell";

import type { CompareData } from "../compare.types";
import { CompareInputForm } from "../components/compare-input-form";
import { CompareResultsPanel } from "../components/compare-results-panel";
import { useCompareFlow, useCompareResults } from "../use-compare-flow";

export function ComparePage() {
  const { showInput, goToInput, goToResults } = useCompareFlow();
  const [user, setUser] = useState<CompareData>({
    age: 0,
    height: 0,
    income: 0,
  });
  const {
    compareData,
    didFail,
    isLoading,
    fetchResults,
    clearResults,
    setDidFail,
  } = useCompareResults();

  const onSubmitted = useCallback(
    (data: CompareData) => {
      setUser(data);
      setDidFail(false);
      clearResults();
      goToResults();
    },
    [clearResults, goToResults, setDidFail],
  );

  return (
    <PageShell className="max-w-2xl">
      {showInput ? (
        <CompareInputForm onSubmitted={onSubmitted} />
      ) : (
        <CompareResultsPanel
          user={user}
          compareData={compareData}
          didFail={didFail}
          isLoading={isLoading}
          onSetData={goToInput}
          onClearServer={() => {
            clearResults();
            setDidFail(false);
          }}
          onGetResults={fetchResults}
        />
      )}
    </PageShell>
  );
}
