import { useNavigate } from "react-router-dom";

import { SignInForm } from "../components/sign-in-form";
import { useAuth } from "../auth-context";
import { PageShell } from "@/shared/components/layout/page-shell";
import { DebugCode } from "@/shared/components/debug-code";
import { getPublicApiUrl, isCognitoConfigured, isPublicDebugUi } from "@/env";

export function SignInPage() {
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();
  const cognitoReady = isCognitoConfigured();

  return (
    <PageShell>
      <div className="space-y-2 pb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        {getPublicApiUrl() && isPublicDebugUi() ? (
          <p className="text-muted-foreground text-xs">
            API:{" "}
            <code className="bg-muted rounded px-1 py-0.5">
              {getPublicApiUrl()}
            </code>
          </p>
        ) : null}
        {!cognitoReady ? (
          <p className="text-destructive mx-auto max-w-md text-center text-sm">
            Cognito is not configured. Add your User Pool ID and App Client ID
            to <span className="font-medium">frontend/.env</span> using values
            from your SAM deploy outputs.
            {isPublicDebugUi() ? (
              <>
                {" "}
                Set{" "}
                <DebugCode className="text-xs">
                  PUBLIC_COGNITO_USER_POOL_ID
                </DebugCode>{" "}
                and{" "}
                <DebugCode className="text-xs">
                  PUBLIC_COGNITO_CLIENT_ID
                </DebugCode>
                .
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      <SignInForm
        onSuccess={(idToken) => {
          setAccessToken(idToken);
          navigate("/compare", { replace: true });
        }}
      />
    </PageShell>
  );
}
