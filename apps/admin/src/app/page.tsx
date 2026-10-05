'use client';

import { useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type MePayload = {
  me: {
    name: string;
    email: string;
    roles: string[];
    tenant: { name: string; slug: string; status: string } | null;
  };
};

export default function AdminHomePage() {
  const [data, setData] = useState<MePayload['me'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void graphqlRequest<MePayload>('{ me { name email roles tenant { name slug status } } }')
      .then((payload) => setData(payload.me))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  return (
    <SignedInShell title="Admin">
      <Card>
        <CardHeader>
          <CardTitle>Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {error ? <p>{error}</p> : null}
          {data ? (
            <>
              <p>
                Signed in as {data.name} ({data.email})
              </p>
              <p>Roles: {data.roles.join(', ')}</p>
              <p>
                Tenant: {data.tenant ? `${data.tenant.name} (${data.tenant.slug}) — ${data.tenant.status}` : 'Platform'}
              </p>
            </>
          ) : (
            <p>Loading profile…</p>
          )}
        </CardContent>
      </Card>
    </SignedInShell>
  );
}
