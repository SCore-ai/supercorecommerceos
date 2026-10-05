'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Tenant = { id: string; name: string; slug: string; status: string; updatedAt: string };

export default function TenantSettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void graphqlRequest<{ tenant: Tenant }>('{ tenant { id name slug status updatedAt } }').then((payload) => {
      setTenant(payload.tenant);
      setName(payload.tenant.name);
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!tenant) return;
    const payload = await graphqlRequest<{ updateTenantName: Tenant }>(
      'mutation ($name: String!, $updatedAt: String!) { updateTenantName(name: $name, updatedAt: $updatedAt) { id name slug status updatedAt } }',
      { name, updatedAt: tenant.updatedAt },
    );
    setTenant(payload.updateTenantName);
    setName(payload.updateTenantName.name);
    setMessage('Saved');
  }

  return (
    <SignedInShell title="Tenant">
      <Card>
        <CardHeader>
          <CardTitle>Tenant settings</CardTitle>
        </CardHeader>
        <CardContent>
          {tenant ? (
            <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
              <p className="text-sm text-muted-foreground">
                Slug {tenant.slug} — status {tenant.status}
              </p>
              <label className="block space-y-1 text-sm">
                <span>Name</span>
                <input className="w-full rounded-md border border-border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              {message ? <p className="text-sm">{message}</p> : null}
              <Button type="submit">Save</Button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">Loading…</p>
          )}
        </CardContent>
      </Card>
    </SignedInShell>
  );
}
