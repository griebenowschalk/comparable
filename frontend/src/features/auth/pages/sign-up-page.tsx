import { useNavigate } from "react-router-dom";

import { SignUpForm } from "../components/sign-up-form";
import { PageShell } from "@/shared/components/layout/page-shell";
import { DebugCode } from "@/shared/components/debug-code";
import { isCognitoConfigured, isPublicDebugUi } from "@/env";

export function SignUpPage() {
  const navigate = useNavigate();
  const cognitoReady = isCognitoConfigured();

  return (
    <PageShell>
      <div className="pb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Register with your email, then enter the code we send you.
        </p>
        {!cognitoReady ? (
          <p className="text-destructive mx-auto mt-4 max-w-md text-sm">
            Cognito is not configured. Add User Pool ID and App Client ID to{" "}
            <span className="font-medium">frontend/.env</span> from your stack
            outputs after deploy.
            {isPublicDebugUi() ? (
              <>
                {" "}
                Variables:{" "}
                <DebugCode className="text-xs">
                  PUBLIC_COGNITO_USER_POOL_ID
                </DebugCode>
                ,{" "}
                <DebugCode className="text-xs">
                  PUBLIC_COGNITO_CLIENT_ID
                </DebugCode>{" "}
                (after <DebugCode className="text-xs">sam deploy</DebugCode>).
              </>
            ) : null}
          </p>
        ) : null}
      </div>
      <SignUpForm
        onConfirmed={() => {
          navigate("/", { replace: true });
        }}
      />
    </PageShell>
  );
}
