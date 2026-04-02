import { useCallback, useState } from "react";

import type { CompareData } from "./compare.types";

export function useCompareFlow() {
  const [showInput, setShowInput] = useState(true);

  const goToInput = useCallback(() => setShowInput(true), []);
  const goToResults = useCallback(() => setShowInput(false), []);

  return { showInput, goToInput, goToResults, setShowInput };
}

export function useCompareResults() {
  const [compareData, setCompareData] = useState<CompareData[] | null>(null);
  const [didFail, setDidFail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(() => {
    setIsLoading(true);
    setDidFail(false);
    window.setTimeout(() => {
      setCompareData([
        { age: 30, height: 70, income: 5000 },
        { age: 35, height: 68, income: 6000 },
      ]);
      setIsLoading(false);
    }, 400);
  }, []);

  const clearResults = useCallback(() => {
    setCompareData(null);
    setDidFail(false);
  }, []);

  return {
    compareData,
    didFail,
    isLoading,
    fetchResults,
    clearResults,
    setDidFail,
  };
}
