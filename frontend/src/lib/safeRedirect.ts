/**
 * Where to go after signing in. Only same-site paths are accepted: "/vehicle/7?x=1" is fine, but
 * "//evil.example", "/\evil.example", "https://evil.example" and "javascript:..." all fall back to the home page,
 * so a crafted login link can never send someone to another site (an "open redirect").
 */
export function safeReturnPath(candidate: unknown, fallback = "/"): string {
  if (typeof candidate !== "string") return fallback;
  if (!/^\/(?![/\\])/.test(candidate)) return fallback;
  if (/[\u0000-\u001f]/.test(candidate)) return fallback;
  return candidate;
}
