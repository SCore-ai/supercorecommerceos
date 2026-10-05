'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getPublicApiUrl } from '@/lib/api';

export default function ActivatePage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch(`${getPublicApiUrl()}/auth/activate`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, tenantSlug, secret, password }),
    });
    const body = (await response.json()) as { error?: { message: string } };
    if (!response.ok) {
      setError(body.error?.message ?? 'Activation failed');
      return;
    }
    router.replace('/');
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-lg font-semibold">Activate account</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={(event) => void onSubmit(event)}>
            <input className="w-full rounded-md border border-border px-3 py-2" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full rounded-md border border-border px-3 py-2" placeholder="Tenant slug" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} required />
            <input className="w-full rounded-md border border-border px-3 py-2" placeholder="Invitation secret" value={secret} onChange={(e) => setSecret(e.target.value)} required />
            <input className="w-full rounded-md border border-border px-3 py-2" placeholder="New password" type="password" minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Activate</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
