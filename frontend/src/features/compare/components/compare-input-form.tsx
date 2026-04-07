import { FormEvent, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/atoms/spinner";
import {
  FormFieldsFromConfig,
  type FormInputFieldConfig,
} from "@/shared/components/molecules/form-fields-from-config";
import { isPublicDebugUi } from "@/env";

import type { PostCompareEntryBody } from "../compare.types";

type Props = {
  onAddEntry: (body: PostCompareEntryBody) => Promise<void>;
  onLoadFromServer: () => Promise<void>;
};

/** Field `name` values sent in FormData and mapped into the compare POST body. */
const COMPARE_ENTRY_FORM_FIELDS = [
  {
    id: "label",
    name: "label",
    label: "Display name",
    description: "Shown in lists and charts (optional).",
    inputProps: {
      type: "text" as const,
      placeholder: "e.g. Me — morning weigh-in",
      autoComplete: "off" as const,
    },
  },
  {
    id: "targetSub",
    name: "targetSub",
    label: "Other user id",
    description:
      "If comparing people: the other person’s Cognito sub (UUID), if your API uses it.",
    inputProps: {
      type: "text" as const,
      placeholder: "e.g. a1b2c3d4-…",
      autoComplete: "off" as const,
      spellCheck: false,
    },
  },
  {
    id: "bodySk",
    name: "bodySk",
    label: "Body measurement key",
    description:
      "Optional sort key for a BODY#… row (same format your DynamoDB item uses).",
    inputProps: {
      type: "text" as const,
      placeholder: "e.g. BODY#2026-04-07T12:00:00.000Z#…",
      autoComplete: "off" as const,
      spellCheck: false,
    },
  },
] as const satisfies readonly FormInputFieldConfig[];

const COMPARE_ENTRY_BODY_KEYS = COMPARE_ENTRY_FORM_FIELDS.map(
  (f) => f.name,
) as (keyof PostCompareEntryBody)[];

function trimOrUndefined(s: string): string | undefined {
  const t = s.trim();
  return t || undefined;
}

function compareBodyFromFormData(data: FormData): PostCompareEntryBody {
  const body: PostCompareEntryBody = {};
  for (const key of COMPARE_ENTRY_BODY_KEYS) {
    const v = trimOrUndefined(String(data.get(key) ?? ""));
    if (v) body[key] = v;
  }
  return body;
}

export function CompareInputForm({ onAddEntry, onLoadFromServer }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = compareBodyFromFormData(data);

    setIsLoading(true);
    try {
      await onAddEntry(body);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFetchStored() {
    setIsLoading(true);
    try {
      await onLoadFromServer();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <header className="space-y-2 text-center">
        <h2 className="text-xl font-semibold tracking-tight">
          Add a comparison row
        </h2>
        <p className="text-muted-foreground mx-auto max-w-lg text-sm leading-relaxed">
          Each entry is one participant in your comparison: a label for you,
          optionally another user&apos;s account id, and/or a pointer to a body
          measurement row your backend understands.
        </p>
        {isPublicDebugUi() ? (
          <p className="text-muted-foreground text-xs">
            <code className="text-xs">
              POST /me/compare/entries — needs PUBLIC_API_URL + signed-in
              session.
            </code>
          </p>
        ) : null}
      </header>

      <section
        className="border-border bg-card/30 mx-auto max-w-lg space-y-4 rounded-lg border p-5"
        aria-labelledby="compare-entry-fields-heading"
      >
        <h3
          id="compare-entry-fields-heading"
          className="text-sm font-medium tracking-tight"
        >
          Entry details
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Leave fields blank if your backend only needs a subset; the API
          accepts any combination of these.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormFieldsFromConfig fields={COMPARE_ENTRY_FORM_FIELDS} />
          <Button type="submit" className="w-full" disabled={isLoading}>
            Save entry and view comparison
          </Button>
        </form>
      </section>

      <section
        className="mx-auto max-w-lg space-y-3 text-center"
        aria-labelledby="compare-load-heading"
      >
        <h3
          id="compare-load-heading"
          className="text-sm font-medium tracking-tight"
        >
          Resume from server
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          If you already added entries in this app (or your backend), load the
          latest comparison data without creating a new row.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => void handleFetchStored()}
          disabled={isLoading}
        >
          Load saved comparison
        </Button>
        {isLoading ? (
          <span className="text-muted-foreground inline-flex items-center justify-center gap-2 text-sm">
            <Spinner className="size-4" /> Working…
          </span>
        ) : null}
      </section>
    </div>
  );
}
