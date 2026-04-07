import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "../auth-context";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuth();
  if (isHydrating) {
    return (
      <div className="text-muted-foreground flex flex-1 items-center justify-center p-8 text-sm">
        Restoring session…
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return children;
}
