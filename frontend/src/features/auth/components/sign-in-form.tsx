import { FormEvent, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/atoms/spinner";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import {
  FormFieldsFromConfig,
  type FormInputFieldConfig,
} from "@/shared/components/molecules/form-fields-from-config";
import { getErrorMessage } from "@/lib/error-message";

import { signInWithPassword } from "../cognito";

const SIGN_IN_FORM_FIELDS = [
  {
    id: "email",
    name: "email",
    label: "Email",
    inputProps: {
      type: "email" as const,
      autoComplete: "email" as const,
      required: true,
    },
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    inputProps: {
      type: "password" as const,
      autoComplete: "current-password" as const,
      required: true,
    },
  },
] as const satisfies readonly FormInputFieldConfig[];

type Props = {
  onSuccess: (idToken: string) => void;
};

export function SignInForm({ onSuccess }: Props) {
  const [didFail, setDidFail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDidFail(false);
    setErrorMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      setDidFail(true);
      setErrorMessage("Email and password are required.");
      return;
    }
    setIsLoading(true);
    try {
      const idToken = await signInWithPassword(email, password);
      onSuccess(idToken);
    } catch (err) {
      setDidFail(true);
      setErrorMessage(
        getErrorMessage(err, "Sign in failed. Check your email and password."),
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-card space-y-6 rounded-xl border p-8 shadow-sm"
    >
      {didFail && errorMessage ? (
        <AlertBanner>{errorMessage}</AlertBanner>
      ) : null}
      <FormFieldsFromConfig fields={SIGN_IN_FORM_FIELDS} />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner className="size-4" /> Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
