import type { ReactNode } from "react";

import { Label } from "@/shared/components/atoms/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: string;
  children: ReactNode;
  className?: string;
};

export function FormField({ id, label, children, className }: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
