import { FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/atoms/spinner";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import {
  FormFieldsFromConfig,
  type FormInputFieldConfig,
} from "@/shared/components/molecules/form-fields-from-config";
import { getErrorMessage } from "@/lib/error-message";

import { confirmSignUp, signUpWithEmail } from "../cognito";

const SIGN_UP_REGISTER_FORM_FIELDS = [
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
      autoComplete: "new-password" as const,
      required: true,
    },
  },
  {
    id: "confirmPassword",
    name: "confirmPassword",
    label: "Confirm password",
    inputProps: {
      type: "password" as const,
      autoComplete: "new-password" as const,
      required: true,
    },
  },
] as const satisfies readonly FormInputFieldConfig[];

const SIGN_UP_CONFIRM_FIELD_BASE = {
  id: "validationCode",
  name: "cognitoOtpCode",
  label: "Validation code",
  inputProps: {
    autoComplete: "one-time-code" as const,
    inputMode: "numeric" as const,
    required: true,
  },
} as const satisfies Omit<FormInputFieldConfig, "controlled">;

type Props = {
  onConfirmed: () => void;
};

export function SignUpForm({ onConfirmed }: Props) {
  const [didFail, setDidFail] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  const confirmFields = useMemo((): FormInputFieldConfig[] => {
    return [
      {
        ...SIGN_UP_CONFIRM_FIELD_BASE,
        controlled: {
          value: confirmCode,
          onChange: setConfirmCode,
        },
      },
    ];
  }, [confirmCode]);

  useEffect(() => {
    if (showConfirm) {
      setConfirmCode("");
    }
  }, [showConfirm]);

  async function onSubmitRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDidFail(false);
    setErrorMessage(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");
    if (password !== confirm) {
      setDidFail(true);
      setErrorMessage("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);
      setRegisteredEmail(email);
      setShowConfirm(true);
    } catch (err) {
      setDidFail(true);
      setErrorMessage(getErrorMessage(err, "Something went wrong."));
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmitConfirm(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDidFail(false);
    setErrorMessage(null);
    const code = confirmCode.trim();
    if (!registeredEmail || !code) {
      setDidFail(true);
      setErrorMessage("Email and code are required.");
      return;
    }
    setIsLoading(true);
    try {
      await confirmSignUp(registeredEmail, code);
      onConfirmed();
    } catch (err) {
      setDidFail(true);
      setErrorMessage(getErrorMessage(err, "Something went wrong."));
    } finally {
      setIsLoading(false);
    }
  }

  if (showConfirm) {
    return (
      <form
        key="sign-up-confirm"
        onSubmit={onSubmitConfirm}
        autoComplete="off"
        className="border-border bg-card relative space-y-6 rounded-xl border p-8 shadow-sm"
      >
        {/*
          Decoy fields: password managers often autofill the first input on a new "form"
          with the last password; absorb that before the real OTP field.
        */}
        <div
          className="pointer-events-none absolute top-0 -left-[9999px] h-0 overflow-hidden opacity-0"
          aria-hidden="true"
        >
          <input type="text" autoComplete="username" tabIndex={-1} readOnly />
          <input
            type="password"
            autoComplete="new-password"
            tabIndex={-1}
            readOnly
          />
        </div>
        <p className="text-muted-foreground text-center text-sm">
          Enter the validation code sent to{" "}
          <strong className="text-foreground">{registeredEmail}</strong>.
        </p>
        {didFail && errorMessage ? (
          <AlertBanner>{errorMessage}</AlertBanner>
        ) : null}
        <FormFieldsFromConfig fields={confirmFields} />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner className="size-4" /> Confirming…
            </span>
          ) : (
            "Confirm account"
          )}
        </Button>
      </form>
    );
  }

  return (
    <form
      key="sign-up-register"
      onSubmit={onSubmitRegister}
      autoComplete="on"
      className="border-border bg-card relative space-y-6 rounded-xl border p-8 shadow-sm"
    >
      {didFail && errorMessage ? (
        <AlertBanner>{errorMessage}</AlertBanner>
      ) : null}
      <FormFieldsFromConfig fields={SIGN_UP_REGISTER_FORM_FIELDS} />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Submitting…" : "Create account"}
      </Button>
    </form>
  );
}
