import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchApiHealth, getPublicApiUrl } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let apiStatus = 'unreachable';
  try {
    const health = await fetchApiHealth(getPublicApiUrl());
    apiStatus = health.status;
  } catch {
    apiStatus = 'unreachable';
  }

  return (
    <AppShell title="Web">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform shell</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>This is the Phase 0 web application shell. Commerce screens are not implemented yet.</p>
            <p>API connectivity: {apiStatus}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
