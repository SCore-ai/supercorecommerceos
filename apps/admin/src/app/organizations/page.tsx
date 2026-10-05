'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Org = { id: string; name: string; status: string; updatedAt: string };

export default function OrganizationsPage() {
  const [items, setItems] = useState<Org[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const payload = await graphqlRequest<{ organizations: { items: Org[] } }>(
      '{ organizations { items { id name status updatedAt } } }',
    );
    setItems(payload.organizations.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await graphqlRequest('mutation ($name: String!) { createOrganization(name: $name) { id } }', { name });
    setName('');
    await load();
  }

  return (
    <SignedInShell title="Organisations">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex gap-3" onSubmit={(event) => void onSubmit(event)}>
              <input className="flex-1 rounded-md border border-border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organisations</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No organisations yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-2">{item.name}</td>
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
