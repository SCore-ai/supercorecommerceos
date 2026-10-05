'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { signInRequest } from '@/lib/api';

export default function WebSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await signInRequest({
        email,
        password,
        tenantSlug: tenantSlug.trim() === '' ? undefined : tenantSlug.trim(),
      });
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-lg font-semibold">Sign in</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void onSubmit(event)}>
            <input className="w-full rounded-md border border-border px-3 py-2" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="w-full rounded-md border border-border px-3 py-2" type="password" placeholder="Password" minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input className="w-full rounded-md border border-border px-3 py-2" placeholder="Tenant slug (tenant users)" value={tenantSlug} onChange={(e) => setTenantSlug(e.target.value)} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
