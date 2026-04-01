import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute, SignInPage, SignUpPage } from "@/features/auth";
import { ComparePage } from "@/features/compare";
import { AppHeader } from "@/shared/components/layout/app-header";

export function App() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <ComparePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
