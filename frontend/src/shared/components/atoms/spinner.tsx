import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "border-primary inline-block size-5 animate-spin rounded-full border-2 border-solid border-r-transparent",
        className,
      )}
    />
  );
}
