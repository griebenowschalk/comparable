import { useNavigate } from "react-router-dom";

import { SignInForm } from "../components/sign-in-form";
import { useAuth } from "../auth-context";
import { PageShell } from "@/shared/components/layout/page-shell";
import { getPublicApiUrl } from "@/env";

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="space-y-2 pb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        {getPublicApiUrl() ? (
          <p className="text-muted-foreground text-xs">
            API:{" "}
            <code className="bg-muted rounded px-1 py-0.5">
              {getPublicApiUrl()}
            </code>
          </p>
        ) : null}
      </div>
      <SignInForm
        onSuccess={() => {
          login();
          navigate("/compare", { replace: true });
        }}
      />
    </PageShell>
  );
}
