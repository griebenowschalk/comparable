import { FormEvent, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/atoms/input";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import { FormField } from "@/shared/components/molecules/form-field";

type Props = {
  onSuccess: () => void;
};

export function SignInForm({ onSuccess }: Props) {
  const [didFail, setDidFail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDidFail(false);
    setIsLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const username = String(data.get("username") ?? "").trim();
    const password = String(data.get("password") ?? "");
    window.setTimeout(() => {
      setIsLoading(false);
      if (!username || !password) {
        setDidFail(true);
        return;
      }
      onSuccess();
    }, 350);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-card space-y-6 rounded-xl border p-8 shadow-sm"
    >
      {didFail ? (
        <AlertBanner>Something went wrong, please try again!</AlertBanner>
      ) : null}
      <FormField id="username" label="Username">
        <Input id="username" name="username" autoComplete="username" required />
      </FormField>
      <FormField id="password" label="Password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in…" : "Submit"}
      </Button>
    </form>
  );
}
