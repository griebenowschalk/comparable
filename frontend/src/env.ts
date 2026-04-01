export function getPublicApiUrl(): string {
  if (typeof process !== "undefined" && process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL;
  }
  return "";
}
