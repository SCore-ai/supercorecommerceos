'use client';

import { useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Audit = { id: string; action: string; entity: string; entityId: string; occurredAt: string };

export default function AuditPage() {
  const [items, setItems] = useState<Audit[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void graphqlRequest<{ auditRecords: { items: Audit[] } }>('{ auditRecords { items { id action entity entityId occurredAt } } }')
      .then((payload) => setItems(payload.auditRecords.items))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, []);

  return (
    <SignedInShell title="Audit">
      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <p className="text-sm text-muted-foreground">{error}</p> : null}
          {items.length === 0 && !error ? (
            <p className="text-sm text-muted-foreground">No audit rows yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="py-2">When</th>
                  <th>Action</th>
                  <th>Entity</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-border">
                    <td className="py-2">{item.occurredAt}</td>
                    <td>{item.action}</td>
                    <td>
                      {item.entity} {item.entityId}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </SignedInShell>
  );
}
