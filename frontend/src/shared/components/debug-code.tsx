import type { ReactNode } from "react";

import { isPublicDebugUi } from "@/env";

export function DebugCode({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  if (!isPublicDebugUi()) return null;
  return <code className={className}>{children}</code>;
}
