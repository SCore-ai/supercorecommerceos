export type MeUser = {
  id: string;
  email: string;
  name: string;
  tenantId: string | null;
  roles: string[];
  permissions: string[];
};

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000';
}

export type HealthResponse = {
  status: string;
  service: string;
  timestamp?: string;
};

export async function fetchApiHealth(apiUrl: string): Promise<HealthResponse> {
  const response = await fetch(`${apiUrl}/health`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('API health check failed');
  }
  return (await response.json()) as HealthResponse;
}

async function parseJson(response: Response): Promise<unknown> {
  return response.json();
}

export async function signInRequest(input: {
  email: string;
  password: string;
  tenantSlug?: string;
}): Promise<{ user: MeUser; tenantName: string | null }> {
  const response = await fetch(`${getPublicApiUrl()}/auth/sign-in`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await parseJson(response)) as { user?: MeUser; tenantName?: string | null; error?: { message: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? 'Sign in failed');
  }
  return { user: body.user as MeUser, tenantName: body.tenantName ?? null };
}

export async function signOutRequest(): Promise<void> {
  await fetch(`${getPublicApiUrl()}/auth/sign-out`, { method: 'POST', credentials: 'include' });
}

export async function fetchMe(): Promise<MeUser | null> {
  const response = await fetch(`${getPublicApiUrl()}/auth/me`, { credentials: 'include', cache: 'no-store' });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Failed to load session');
  }
  const body = (await parseJson(response)) as { user: MeUser };
  return body.user;
}

export async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${getPublicApiUrl()}/graphql`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const body = (await parseJson(response)) as { data?: T; errors?: Array<{ message: string }>; error?: { message: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? 'Request failed');
  }
  if (body.errors?.[0]) {
    throw new Error(body.errors[0].message);
  }
  if (!body.data) {
    throw new Error('Empty GraphQL response');
  }
  return body.data;
}
