import { cn } from "@/lib/utils";

type Variant = "destructive" | "default";

export function AlertBanner({
  children,
  variant = "destructive",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        variant === "destructive" &&
          "border-destructive/50 bg-destructive/10 text-destructive",
        variant === "default" && "border-border bg-muted/50 text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}
