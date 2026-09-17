import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApiHealth, getPublicApiUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function StatusPage() {
  let body = 'API is not reachable from the web app.';
  try {
    const health = await fetchApiHealth(getPublicApiUrl());
    body = `API service ${health.service} reported status ${health.status}.`;
  } catch {
    body = 'API is not reachable from the web app.';
  }

  return (
    <AppShell title="Web">
      <Card>
        <CardHeader>
          <CardTitle>API connectivity</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
      </Card>
    </AppShell>
  );
}
