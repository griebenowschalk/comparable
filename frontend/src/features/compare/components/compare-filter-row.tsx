import { cn } from "@/lib/utils";

type Props = {
  label: string;
  active: boolean;
  onSelect: () => void;
};

export function CompareFilterRow({ label, active, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "hover:bg-accent w-full rounded-md border px-4 py-3 text-left text-sm transition-colors",
        active ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      {label}
    </button>
  );
}
