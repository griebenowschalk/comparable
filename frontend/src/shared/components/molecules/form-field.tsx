import type { ReactNode } from "react";

import { Label } from "@/shared/components/atoms/label";
import { cn } from "@/lib/utils";

type FormFieldProps = {
  id: string;
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormField({
  id,
  label,
  description,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {description ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          {description}
        </p>
      ) : null}
      {children}
    </div>
  );
}
