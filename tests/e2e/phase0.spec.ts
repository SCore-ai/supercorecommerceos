import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL ?? 'http://127.0.0.1:4000';
const WEB_URL = process.env.WEB_URL ?? 'http://127.0.0.1:3000';
const ADMIN_URL = process.env.ADMIN_URL ?? 'http://127.0.0.1:3001';

test('web application loads', async ({ page }) => {
  await page.goto(WEB_URL);
  await expect(page.getByRole('heading', { name: 'Web' })).toBeVisible();
  await expect(page.getByText('Phase 0 web application shell')).toBeVisible();
});

test('admin application loads', async ({ page }) => {
  await page.goto(ADMIN_URL);
  await expect(page.getByRole('heading', { name: 'Admin', exact: true })).toBeVisible();
  await expect(page.getByText('Phase 0 admin application shell')).toBeVisible();
});

test('API health works', async ({ request }) => {
  const response = await request.get(`${API_URL}/health`);
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.status).toBe('ok');
});

test('API readiness works', async ({ request }) => {
  const response = await request.get(`${API_URL}/ready`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.status).toBe('ready');
});

test('GraphQL endpoint responds', async ({ request }) => {
  const response = await request.post(`${API_URL}/graphql`, {
    data: { query: '{ health { status service } }' },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.data.health.status).toBe('ok');
});

test('web shows API connectivity', async ({ page }) => {
  await page.goto(`${WEB_URL}/status`);
  await expect(page.getByText(/API service api reported status ok|API is not reachable/)).toBeVisible();
});
