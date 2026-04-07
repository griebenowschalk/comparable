/**
 * Bun’s HTML bundler only inlines **literal** `process.env.PUBLIC_*` reads into the browser
 * bundle. Do not gate on `typeof process` or indirect access — that skips inlining and
 * `process` is undefined in the browser.
 */
function trimEnv(value: string | undefined): string | undefined {
  const t = value?.trim();
  return t || undefined;
}

/** API base URL (no trailing slash), e.g. https://xxx.execute-api.region.amazonaws.com/Prod */
export function getPublicApiUrl(): string {
  return trimEnv(process.env.PUBLIC_API_URL) ?? "";
}

/** Cognito User Pool ID from stack output `UserPoolId`. */
export function getCognitoUserPoolId(): string | undefined {
  return trimEnv(process.env.PUBLIC_COGNITO_USER_POOL_ID);
}

/** Cognito app client ID from stack output `UserPoolClientId`. */
export function getCognitoClientId(): string | undefined {
  return trimEnv(process.env.PUBLIC_COGNITO_CLIENT_ID);
}

export function isCognitoConfigured(): boolean {
  return Boolean(getCognitoUserPoolId() && getCognitoClientId());
}

/** When true, show API paths, env var names, and other developer-only UI. */
export function isPublicDebugUi(): boolean {
  const v = trimEnv(process.env.PUBLIC_DEBUG_UI)?.toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** Use the ID/access token from auth context for API calls. */
export function resolveBearerToken(
  explicit: string | null | undefined,
): string | undefined {
  const t = explicit?.trim();
  return t || undefined;
}
