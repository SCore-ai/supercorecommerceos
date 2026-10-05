export function originAllowList(env: {
  WEB_URL: string;
  ADMIN_URL: string;
  API_URL: string;
  CORS_ORIGINS?: string;
}): string[] {
  const fromCsv = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  return [...new Set([env.WEB_URL, env.ADMIN_URL, env.API_URL, ...fromCsv])];
}

function originFromReferer(referer: string): string | null {
  try {
    const url = new URL(referer);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

export function resolveRequestOrigin(headers: { get(name: string): string | null }): string | null {
  const origin = headers.get('origin');
  if (origin && origin.trim() !== '') {
    return origin.trim();
  }
  const referer = headers.get('referer');
  if (referer && referer.trim() !== '') {
    return originFromReferer(referer);
  }
  return null;
}

export function isAllowedOrigin(origin: string | null, allowList: string[]): boolean {
  if (!origin) {
    return false;
  }
  return allowList.includes(origin);
}

export function requiresOriginCheck(method: string): boolean {
  return method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';
}
