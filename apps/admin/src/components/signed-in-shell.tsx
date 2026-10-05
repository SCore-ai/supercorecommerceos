'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchMe, signOutRequest, type MeUser } from '@/lib/api';

export function SignedInShell({ title, children }: { title: string; children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null | undefined>(undefined);

  useEffect(() => {
    void fetchMe().then((value) => {
      if (!value) {
        router.replace('/sign-in');
        return;
      }
      setUser(value);
    });
  }, [router]);

  if (user === undefined) {
    return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  }
  if (!user) {
    return null;
  }

  const platform = user.roles.includes('super_admin') && !user.tenantId;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Supercore Commerce OS</p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link className="hover:underline" href="/">
              Home
            </Link>
            {platform ? (
              <>
                <Link className="hover:underline" href="/tenants">
                  Tenants
                </Link>
                <Link className="hover:underline" href="/audit">
                  Audit
                </Link>
              </>
            ) : (
              <>
                <Link className="hover:underline" href="/tenant">
                  Tenant
                </Link>
                <Link className="hover:underline" href="/organizations">
                  Organisations
                </Link>
                <Link className="hover:underline" href="/users">
                  Users
                </Link>
                <Link className="hover:underline" href="/customers">
                  Customers
                </Link>
                <Link className="hover:underline" href="/suppliers">
                  Suppliers
                </Link>
                <Link className="hover:underline" href="/addresses">
                  Addresses
                </Link>
                <Link className="hover:underline" href="/audit">
                  Audit
                </Link>
              </>
            )}
            <Link className="hover:underline" href="/status">
              Status
            </Link>
            <button
              className="hover:underline"
              type="button"
              onClick={() => {
                void signOutRequest().then(() => router.replace('/sign-in'));
              }}
            >
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
