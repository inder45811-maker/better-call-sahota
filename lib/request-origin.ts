/** Account for a hosting proxy without trusting arbitrary forwarded headers. */
export function isAllowedOrigin(
  requestUrl: string,
  origin: string | null,
  configuredOrigin?: string,
  vercelHost?: string,
) {
  // Non-browser clients omit Origin. JSON-only body validation remains mandatory.
  if (!origin) return true;
  const allowed = new Set([new URL(requestUrl).origin]);
  for (const candidate of [configuredOrigin, vercelHost ? 'https://' + vercelHost : undefined]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' || url.protocol === 'http:') allowed.add(url.origin);
    } catch {
      // Invalid deployment configuration must not disable the origin check.
    }
  }
  return allowed.has(origin);
}
