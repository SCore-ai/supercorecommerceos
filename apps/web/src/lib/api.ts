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

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000';
}
