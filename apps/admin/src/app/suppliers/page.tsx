'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Supplier = { id: string; name: string; email: string | null; status: string };

export default function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([]);
  const [name, setName] = useState('');

  async function load() {
    const payload = await graphqlRequest<{ suppliers: { items: Supplier[] } }>(
      '{ suppliers { items { id name email status } } }',
    );
    setItems(payload.suppliers.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await graphqlRequest('mutation ($name: String!) { createSupplier(name: $name) { id } }', { name });
    setName('');
    await load();
  }

  return (
    <SignedInShell title="Suppliers">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create supplier</CardTitle>
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
            <CardTitle>Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No suppliers yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-2">
                        <Link className="underline" href={`/suppliers/${item.id}`}>
                          {item.name}
                        </Link>
                      </td>
                      <td>{item.email ?? '—'}</td>
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
