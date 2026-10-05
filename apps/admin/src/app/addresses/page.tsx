'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { SignedInShell } from '@/components/signed-in-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { graphqlRequest } from '@/lib/api';

type Address = { id: string; line1: string; city: string; isPrimary: boolean; customerId: string | null; supplierId: string | null };
type Country = { id: string; isoAlpha2: string; name: string };
type Customer = { id: string; name: string };

export default function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [countryId, setCountryId] = useState('');
  const [line1, setLine1] = useState('');
  const [city, setCity] = useState('');

  async function load() {
    const payload = await graphqlRequest<{
      addresses: { items: Address[] };
      countries: Country[];
      customers: { items: Customer[] };
    }>('{ addresses { items { id line1 city isPrimary customerId supplierId } } countries { id isoAlpha2 name } customers { items { id name } } }');
    setItems(payload.addresses.items);
    setCountries(payload.countries);
    setCustomers(payload.customers.items);
    setCountryId((current) => current || payload.countries[0]?.id || '');
    setCustomerId((current) => current || payload.customers.items[0]?.id || '');
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await graphqlRequest(
      'mutation ($customerId: ID, $line1: String!, $city: String!, $countryId: ID!) { createAddress(customerId: $customerId, line1: $line1, city: $city, countryId: $countryId) { id } }',
      { customerId, line1, city, countryId },
    );
    setLine1('');
    setCity('');
    await load();
  }

  return (
    <SignedInShell title="Addresses">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create customer address</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
              <select className="rounded-md border border-border px-3 py-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <select className="rounded-md border border-border px-3 py-2" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.isoAlpha2} — {country.name}
                  </option>
                ))}
              </select>
              <input className="rounded-md border border-border px-3 py-2" placeholder="Line 1" value={line1} onChange={(e) => setLine1(e.target.value)} required />
              <input className="rounded-md border border-border px-3 py-2" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Button type="submit">Create</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No addresses yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="py-2">Line 1</th>
                    <th>City</th>
                    <th>Primary</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-border">
                      <td className="py-2">{item.line1}</td>
                      <td>{item.city}</td>
                      <td>{item.isPrimary ? 'yes' : 'no'}</td>
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
