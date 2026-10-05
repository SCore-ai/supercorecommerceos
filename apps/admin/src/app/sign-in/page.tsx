'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { signInRequest } from '@/lib/api';

export default function AdminSignInPage() {
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
            <label className="block space-y-1 text-sm">
              <span>Email</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Password</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={12}
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span>Tenant slug (tenant users only)</span>
              <input
                className="w-full rounded-md border border-border px-3 py-2"
                value={tenantSlug}
                onChange={(event) => setTenantSlug(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
