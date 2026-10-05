'use client';

import { type FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Customer = { id: string; name: string; email: string | null; status: string };

export default function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  async function load() {
    const payload = await graphqlRequest<{ customers: { items: Customer[] } }>(
      '{ customers { items { id name email status } } }',
    );
    setItems(payload.customers.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await graphqlRequest('mutation ($name: String!, $email: String) { createCustomer(name: $name, email: $email) { id } }', {
      name,
      email: email || null,
    });
    setName('');
    setEmail('');
    await load();
  }

  return (
    <SignedInShell title="Customers">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={(event) => void onSubmit(event)}>
              <input className="rounded-md border border-border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="rounded-md border border-border px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No customers yet.</p>
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
                        <Link className="underline" href={`/customers/${item.id}`}>
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
