'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Supplier = { id: string; name: string; email: string | null; status: string; updatedAt: string };

export default function SupplierDetailPage() {
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<Supplier | null>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    void graphqlRequest<{ supplier: Supplier }>('query ($id: ID!) { supplier(id: $id) { id name email status updatedAt } }', {
      id: params.id,
    }).then((payload) => {
      setRow(payload.supplier);
      setName(payload.supplier.name);
    });
  }, [params.id]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!row) return;
    const payload = await graphqlRequest<{ updateSupplier: Supplier }>(
      'mutation ($id: ID!, $name: String, $updatedAt: String!) { updateSupplier(id: $id, name: $name, updatedAt: $updatedAt) { id name email status updatedAt } }',
      { id: row.id, name, updatedAt: row.updatedAt },
    );
    setRow(payload.updateSupplier);
  }

  return (
    <SignedInShell title="Supplier">
      <Card>
        <CardHeader>
          <CardTitle>Supplier</CardTitle>
        </CardHeader>
        <CardContent>
          {row ? (
            <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
              <input className="w-full rounded-md border border-border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} />
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
