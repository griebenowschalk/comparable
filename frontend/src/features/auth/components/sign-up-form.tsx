import { FormEvent, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/atoms/input";
import { Spinner } from "@/shared/components/atoms/spinner";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import { FormField } from "@/shared/components/molecules/form-field";

type Props = {
  onRegistered: () => void;
};

export function SignUpForm({ onRegistered }: Props) {
  const [didFail, setDidFail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function onSubmitRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDidFail(false);
    const form = e.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setDidFail(true);
      return;
    }
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setShowConfirm(true);
    }, 400);
  }

  function onSubmitConfirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      onRegistered();
    }, 400);
  }

  if (showConfirm) {
    return (
      <form
        onSubmit={onSubmitConfirm}
        className="border-border bg-card space-y-6 rounded-xl border p-8 shadow-sm"
      >
        <p className="text-muted-foreground text-center text-sm">
          Enter the validation code from your email.
        </p>
        <FormField id="usrName" label="Username">
          <Input id="usrName" name="usrName" required />
        </FormField>
        <FormField id="validationCode" label="Validation code">
          <Input id="validationCode" name="validationCode" required />
        </FormField>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="size-4" /> Confirming…
            </span>
          ) : (
            "Confirm your account"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmitRegister}
      className="border-border bg-card space-y-6 rounded-xl border p-8 shadow-sm"
    >
      {didFail ? (
        <AlertBanner>
          Passwords do not match or something went wrong.
        </AlertBanner>
      ) : null}
      <FormField id="username" label="Username">
        <Input id="username" name="username" autoComplete="username" required />
      </FormField>
      <FormField id="email" label="Email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </FormField>
      <FormField id="password" label="Password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>
      <FormField id="confirmPassword" label="Confirm password">
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
