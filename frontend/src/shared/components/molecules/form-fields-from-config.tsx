import type { InputHTMLAttributes } from "react";

import { Input } from "@/shared/components/atoms/input";

import { FormField } from "./form-field";

export type FormInputFieldConfig = {
  id: string;
  name: string;
  label: string;
  description?: string;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name">;
  controlled?: {
    value: string;
    onChange: (value: string) => void;
  };
};

export function FormFieldsFromConfig({
  fields,
}: {
  fields: readonly FormInputFieldConfig[];
}) {
  return (
    <>
      {fields.map((field) => {
        const { controlled, inputProps } = field;
        return (
          <FormField
            key={field.id}
            id={field.id}
            label={field.label}
            description={field.description}
          >
            <Input
              id={field.id}
              name={field.name}
              {...inputProps}
              {...(controlled
                ? {
                    value: controlled.value,
                    onChange: (e) => controlled.onChange(e.target.value),
                  }
                : {})}
            />
          </FormField>
        );
      })}
    </>
  );
}
