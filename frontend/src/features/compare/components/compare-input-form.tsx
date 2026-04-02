import { FormEvent, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/atoms/input";
import { Spinner } from "@/shared/components/atoms/spinner";
import { AlertBanner } from "@/shared/components/molecules/alert-banner";
import { FormField } from "@/shared/components/molecules/form-field";

import type { CompareData } from "../compare.types";

type Props = {
  onSubmitted: (data: CompareData) => void;
  onFetchStored?: () => void;
};

export function CompareInputForm({ onSubmitted, onFetchStored }: Props) {
  const [couldNotLoadData, setCouldNotLoadData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const age = Number(data.get("age"));
    const height = Number(data.get("height"));
    const income = Number(data.get("income"));
    if ([age, height, income].some((n) => Number.isNaN(n))) return;
    onSubmitted({ age, height, income });
  }

  function handleFetchStored() {
    setCouldNotLoadData(false);
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setCouldNotLoadData(true);
      onFetchStored?.();
    }, 500);
  }

  return (
    <div className="space-y-8">
      <h2 className="text-center text-lg font-semibold tracking-tight">
        Set your data
      </h2>
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4">
        <FormField id="age" label="Age">
          <Input id="age" name="age" type="number" min={0} required />
        </FormField>
        <FormField id="height" label="Height (inch)">
          <Input
            id="height"
            name="height"
            type="number"
            min={0}
            step="0.1"
            required
          />
        </FormField>
        <FormField id="income" label="Monthly income (USD)">
          <Input id="income" name="income" type="number" min={0} required />
        </FormField>
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
      <hr className="border-border" />
      <div className="flex flex-col items-center gap-4 text-center">
        {couldNotLoadData ? (
          <AlertBanner>
            An error occurred, please try again or submit new data!
          </AlertBanner>
        ) : null}
        <Button type="button" variant="secondary" onClick={handleFetchStored}>
          I already stored data on the server!
        </Button>
        {isLoading ? (
          <span className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <Spinner className="size-4" /> Loading…
          </span>
        ) : null}
      </div>
    </div>
  );
}
