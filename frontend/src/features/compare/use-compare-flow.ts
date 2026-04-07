import { useCallback, useState } from "react";

import { ApiError } from "@/api/client";
import { getPublicApiUrl } from "@/env";

import {
  deleteCompareEntry,
  getCompare,
  postCompareEntry,
} from "./compare-api";
import type {
  CompareResponse,
  CompareScope,
  PostCompareEntryBody,
} from "./compare.types";

function hasBearer(accessToken: string | null): boolean {
  return Boolean(accessToken?.trim());
}

export function useCompareFlow() {
  const [showInput, setShowInput] = useState(true);

  const goToInput = useCallback(() => setShowInput(true), []);
  const goToResults = useCallback(() => setShowInput(false), []);

  return { showInput, goToInput, goToResults, setShowInput };
}

export function useCompareResults(accessToken: string | null) {
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [scope, setScope] = useState<CompareScope>("you");
  const [didFail, setDidFail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCompare = useCallback(
    async (overrideScope?: CompareScope) => {
      const effectiveScope = overrideScope ?? scope;
      setIsLoading(true);
      setDidFail(false);
      setErrorMessage(null);
      try {
        if (!getPublicApiUrl()) {
          throw new Error("Set PUBLIC_API_URL in frontend/.env");
        }
        if (!hasBearer(accessToken)) {
          throw new Error(
            "Sign in with Cognito first — your session should include an ID token for the API.",
          );
        }
        const data = await getCompare(effectiveScope, accessToken);
        setCompareData(data);
      } catch (e) {
        setCompareData(null);
        setDidFail(true);
        const msg =
          e instanceof ApiError
            ? `${e.message} (${e.status})`
            : e instanceof Error
              ? e.message
              : "Request failed";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, scope],
  );

  const addEntry = useCallback(
    async (body: PostCompareEntryBody) => {
      setIsLoading(true);
      setDidFail(false);
      setErrorMessage(null);
      try {
        if (!getPublicApiUrl()) {
          throw new Error("Set PUBLIC_API_URL in frontend/.env");
        }
        if (!hasBearer(accessToken)) {
          throw new Error(
            "Sign in with Cognito first so the app can send Authorization: Bearer <ID token>.",
          );
        }
        await postCompareEntry(body, accessToken);
        const data = await getCompare(scope, accessToken);
        setCompareData(data);
      } catch (e) {
        setDidFail(true);
        const msg =
          e instanceof ApiError
            ? `${e.message} (${e.status})`
            : e instanceof Error
              ? e.message
              : "Request failed";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, scope],
  );

  const removeEntry = useCallback(
    async (entryId: string) => {
      setIsLoading(true);
      setDidFail(false);
      setErrorMessage(null);
      try {
        if (!hasBearer(accessToken)) {
          throw new Error(
            "Sign in with Cognito first so the app can send Authorization: Bearer <ID token>.",
          );
        }
        await deleteCompareEntry(entryId, accessToken);
        const data = await getCompare(scope, accessToken);
        setCompareData(data);
      } catch (e) {
        setDidFail(true);
        const msg =
          e instanceof ApiError
            ? `${e.message} (${e.status})`
            : e instanceof Error
              ? e.message
              : "Request failed";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken, scope],
  );

  const clearResults = useCallback(() => {
    setCompareData(null);
    setDidFail(false);
    setErrorMessage(null);
  }, []);

  return {
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
  };
}
