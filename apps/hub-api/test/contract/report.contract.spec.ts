import { test, expect } from '@playwright/test';

const BASE = process.env.API_BASE_URL ?? 'http://localhost:3000';

test.describe('POST /report — contract', () => {
  test('returns 201 with jobId for valid payload', async ({ request }) => {
    const res = await request.post(`${BASE}/report`, {
      data: { phone: '0901234567', scenarioType: 'impersonation' },
    });
    expect(res.status()).toBe(201);

    const body = await res.json();
    expect(body).toHaveProperty('jobId');
    expect(typeof body.jobId).toBe('string');
    expect(body.jobId.length).toBeGreaterThan(0);
  });

  test('returns 400 for invalid scenarioType', async ({ request }) => {
    const res = await request.post(`${BASE}/report`, {
      data: { phone: '0901234567', scenarioType: 'INVALID_TYPE_XYZ' },
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 for missing phone', async ({ request }) => {
    const res = await request.post(`${BASE}/report`, {
      data: { scenarioType: 'impersonation' },
    });
    expect(res.status()).toBe(400);
  });

  test('returns 400 for missing scenarioType', async ({ request }) => {
    const res = await request.post(`${BASE}/report`, {
      data: { phone: '0901234567' },
    });
    expect(res.status()).toBe(400);
  });
});
