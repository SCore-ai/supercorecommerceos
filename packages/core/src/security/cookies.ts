export const SESSION_COOKIE_NAME = 'supercore_session';

export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
};

export function sessionCookieOptions(nodeEnv: string): CookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function readCookie(header: string | null | undefined, name: string): string | null {
  if (!header) {
    return null;
  }
  for (const part of header.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    if (trimmed.slice(0, eq) !== name) {
      continue;
    }
    return decodeURIComponent(trimmed.slice(eq + 1));
  }
  return null;
}
