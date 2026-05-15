import { test, expect } from '@playwright/test';

const BASE = process.env.API_BASE_URL ?? 'http://localhost:3000';

test.describe('POST /risk/score — contract', () => {
  test('returns 200 with required fields for valid payload', async ({ request }) => {
    const res = await request.post(`${BASE}/risk/score`, {
      data: { claimsGovernment: true, demandsImmediateTransfer: true },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('level');
    expect(body).toHaveProperty('reasons');
    expect(body).toHaveProperty('confidence');
    expect(body).toHaveProperty('action');

    expect(typeof body.score).toBe('number');
    expect(body.score).toBeGreaterThanOrEqual(0);
    expect(body.score).toBeLessThanOrEqual(100);
    expect(['low', 'medium', 'high', 'critical']).toContain(body.level);
    expect(Array.isArray(body.reasons)).toBe(true);
    expect(['allow', 'warn', 'verify', 'block']).toContain(body.action);
  });

  test('returns 200 with empty body (all signals optional)', async ({ request }) => {
    const res = await request.post(`${BASE}/risk/score`, { data: {} });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.score).toBe(0);
    expect(body.level).toBe('low');
  });
});

test.describe('POST /risk/token — contract', () => {
  test('returns token with correct JWT shape', async ({ request }) => {
    const res = await request.post(`${BASE}/risk/token`, {
      data: { claimsGovernment: true, demandsImmediateTransfer: true },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body).toHaveProperty('expiresAt');
    expect(body).toHaveProperty('ttlSeconds');

    expect(typeof body.token).toBe('string');
    expect(body.token.split('.')).toHaveLength(3);
    expect(typeof body.expiresAt).toBe('number');
    expect(typeof body.ttlSeconds).toBe('number');
    expect(body.ttlSeconds).toBeGreaterThan(0);
  });

  test('token payload contains no PII', async ({ request }) => {
    const res = await request.post(`${BASE}/risk/token`, {
      data: { claimsGovernment: true },
    });
    expect(res.status()).toBe(200);
    const { token } = await res.json();
    const [, payloadB64] = token.split('.');
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());
    expect(payload).not.toHaveProperty('phone');
    expect(payload).not.toHaveProperty('userId');
    expect(payload).not.toHaveProperty('phoneHash');
  });
});

test.describe('POST /risk/token/verify — contract', () => {
  test('returns decoded payload for valid token', async ({ request }) => {
    const tokenRes = await request.post(`${BASE}/risk/token`, {
      data: { claimsGovernment: true },
    });
    const { token } = await tokenRes.json();

    const res = await request.post(`${BASE}/risk/token/verify`, {
      data: { token },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty('riskLevel');
    expect(body).toHaveProperty('score');
    expect(body).toHaveProperty('source');
    expect(body).toHaveProperty('issuedAt');
    expect(body).toHaveProperty('expiresAt');
  });

  test('returns 401 for tampered token', async ({ request }) => {
    const res = await request.post(`${BASE}/risk/token/verify`, {
      data: { token: 'header.payload.INVALIDSIGNATURE' },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('GET /risk/lookup — contract', () => {
  test('returns 200 or 404 for a valid phone number', async ({ request }) => {
    const res = await request.get(`${BASE}/risk/lookup?phone=0901234567`);
    expect([200, 404]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty('score');
      expect(body).toHaveProperty('level');
    }
  });
});
