/** Account for a hosting proxy without trusting arbitrary forwarded headers. */
export function isAllowedOrigin(
  requestUrl: string,
  origin: string | null,
  configuredOrigin?: string,
  vercelHost?: string,
) {
  // Non-browser clients omit Origin. JSON-only body validation remains mandatory.
  if (!origin) return true;
  const requestOrigin = new URL(requestUrl);
  const allowed = new Set([requestOrigin.origin]);
  if (requestOrigin.hostname === 'localhost') {
    allowed.add(`http://127.0.0.1${requestOrigin.port ? ':' + requestOrigin.port : ''}`);
  } else if (requestOrigin.hostname === '127.0.0.1') {
    allowed.add(`http://localhost${requestOrigin.port ? ':' + requestOrigin.port : ''}`);
  }
  for (const candidate of [configuredOrigin, vercelHost ? 'https://' + vercelHost : undefined]) {
    if (!candidate) continue;
    try {
      const url = new URL(candidate);
      if (url.protocol === 'https:' || url.protocol === 'http:') {
        allowed.add(url.origin);
        if (url.hostname === 'localhost') {
          allowed.add(`http://127.0.0.1${url.port ? ':' + url.port : ''}`);
        } else if (url.hostname === '127.0.0.1') {
          allowed.add(`http://localhost${url.port ? ':' + url.port : ''}`);
        }
      }
    } catch {
      // Invalid deployment configuration must not disable the origin check.
    }
  }
  return allowed.has(origin);
}
