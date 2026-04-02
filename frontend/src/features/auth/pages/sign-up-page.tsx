import { useNavigate } from "react-router-dom";

import { SignUpForm } from "../components/sign-up-form";
import { useAuth } from "../auth-context";
import { PageShell } from "@/shared/components/layout/page-shell";

export function SignUpPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <PageShell>
      <div className="pb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Register, then confirm with the code sent to your email.
        </p>
      </div>
      <SignUpForm
        onRegistered={() => {
          login();
          navigate("/compare", { replace: true });
        }}
      />
    </PageShell>
  );
}
