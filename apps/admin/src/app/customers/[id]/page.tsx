'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Customer = { id: string; name: string; email: string | null; phone: string | null; status: string; updatedAt: string };

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<Customer | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    void graphqlRequest<{ customer: Customer }>('query ($id: ID!) { customer(id: $id) { id name email phone status updatedAt } }', {
      id: params.id,
    }).then((payload) => {
      setRow(payload.customer);
      setName(payload.customer.name);
      setEmail(payload.customer.email ?? '');
    });
  }, [params.id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!row) return;
    const payload = await graphqlRequest<{ updateCustomer: Customer }>(
      'mutation ($id: ID!, $name: String, $email: String, $updatedAt: String!) { updateCustomer(id: $id, name: $name, email: $email, updatedAt: $updatedAt) { id name email phone status updatedAt } }',
      { id: row.id, name, email: email || null, updatedAt: row.updatedAt },
    );
    setRow(payload.updateCustomer);
  }

  return (
    <SignedInShell title="Customer">
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          {row ? (
            <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
              <input className="w-full rounded-md border border-border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
              <input className="w-full rounded-md border border-border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
              <p className="text-sm text-muted-foreground">Status {row.status}</p>
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
