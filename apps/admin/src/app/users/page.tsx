'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type UserRow = { id: string; email: string; name: string; roles: string[] };

export default function UsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [secret, setSecret] = useState<string | null>(null);

  async function load() {
    const payload = await graphqlRequest<{ users: { items: UserRow[] } }>('{ users { items { id email name roles } } }');
    setItems(payload.users.items);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = await graphqlRequest<{ inviteUser: { invitationSecret: string } }>(
      'mutation ($email: String!, $name: String!) { inviteUser(email: $email, name: $name, roles: ["viewer"]) { invitationSecret user { id } } }',
      { email, name },
    );
    setSecret(payload.inviteUser.invitationSecret);
    setEmail('');
    setName('');
    await load();
  }

  return (
    <SignedInShell title="Users">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invite user</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-3" onSubmit={(event) => void onSubmit(event)}>
              <input className="rounded-md border border-border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input className="rounded-md border border-border px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit">Invite as viewer</Button>
            </form>
            {secret ? <p className="mt-3 text-sm">Invitation secret (shown once): {secret}</p> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Name</th>
                    <th>Email</th>
                    <th>Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-2">{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.roles.join(', ')}</td>
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
