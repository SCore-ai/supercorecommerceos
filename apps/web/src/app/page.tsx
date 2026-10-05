'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchMe, graphqlRequest, signOutRequest, type MeUser } from '@/lib/api';

export default function WebHomePage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);
  const [tenantName, setTenantName] = useState<string | null>(null);

  useEffect(() => {
    void fetchMe().then((value) => {
      if (!value) {
        router.replace('/sign-in');
        return;
      }
      setUser(value);
      void graphqlRequest<{ me: { tenant: { name: string } | null } }>('{ me { tenant { name } } }').then((payload) => {
        setTenantName(payload.me.tenant?.name ?? 'Platform');
      });
    });
  }, [router]);

  if (user === undefined || !user) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <AppShell title="Web">
      <Card>
        <CardHeader>
          <CardTitle>Signed in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            {user.name} ({user.email})
          </p>
          <p>Tenant: {tenantName ?? '…'}</p>
          <button
            className="underline"
            type="button"
            onClick={() => {
              void signOutRequest().then(() => router.replace('/sign-in'));
            }}
          >
            Sign out
          </button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
