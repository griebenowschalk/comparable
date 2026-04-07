/** Best-effort message from thrown values (e.g. Cognito `Error` with `.message`). */
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return fallback;
}
