import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { hydrateSessionFromStorage, signOutCognito } from "./cognito";

export type AuthContextValue = {
  /** True when a JWT (ID token) is present from Cognito sign-in or restored session. */
  isAuthenticated: boolean;
  /** Cognito ID token — sent as `Authorization: Bearer` to the API. */
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  /** Session restore from Cognito local storage (on load). */
  isHydrating: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void hydrateSessionFromStorage()
      .then((token) => {
        if (!cancelled && token) setAccessToken(token);
      })
      .finally(() => {
        if (!cancelled) setIsHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    signOutCognito();
    setAccessToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(accessToken?.trim()),
      accessToken,
      setAccessToken,
      isHydrating,
      logout,
    }),
    [accessToken, isHydrating, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
