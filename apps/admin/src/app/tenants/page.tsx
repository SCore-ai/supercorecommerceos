'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Tenant = { id: string; name: string; slug: string; status: string };

export default function TenantsPage() {
  const [items, setItems] = useState<Tenant[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [secret, setSecret] = useState<string | null>(null);

  async function load() {
    const payload = await graphqlRequest<{ tenants: { items: Tenant[] } }>('{ tenants { items { id name slug status } } }');
    setItems(payload.tenants.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const created = await graphqlRequest<{ provisionTenant: Tenant }>(
      'mutation ($name: String!, $slug: String!) { provisionTenant(name: $name, slug: $slug) { id name slug status } }',
      { name, slug },
    );
    const invited = await graphqlRequest<{ inviteTenantAdmin: { invitationSecret: string } }>(
      'mutation ($tenantId: ID!, $email: String!, $name: String!) { inviteTenantAdmin(tenantId: $tenantId, email: $email, name: $name) { invitationSecret } }',
      { tenantId: created.provisionTenant.id, email: adminEmail, name: adminName },
    );
    await graphqlRequest('mutation ($id: ID!) { setTenantStatus(id: $id, status: "active") { id } }', {
      id: created.provisionTenant.id,
    });
    setSecret(invited.inviteTenantAdmin.invitationSecret);
    setName('');
    setSlug('');
    setAdminEmail('');
    setAdminName('');
    await load();
  }

  return (
    <SignedInShell title="Tenants">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Provision tenant</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
              <input className="rounded-md border border-border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="rounded-md border border-border px-3 py-2" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
              <input className="rounded-md border border-border px-3 py-2" placeholder="Admin name" value={adminName} onChange={(e) => setAdminName(e.target.value)} required />
              <input className="rounded-md border border-border px-3 py-2" placeholder="Admin email" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required />
              <Button type="submit">Provision and activate</Button>
            </form>
            {secret ? <p className="mt-3 text-sm">First admin invitation secret (shown once): {secret}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tenants yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Name</th>
                    <th>Slug</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-2">{item.name}</td>
                      <td>{item.slug}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </SignedInShell>
  );
}
