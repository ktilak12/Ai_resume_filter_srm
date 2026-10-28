import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { server } from '../../server.js';

describe('Production Server & Middleware Integration', () => {
  const TEST_PORT = 3458;

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(TEST_PORT, () => resolve());
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  async function makeRequest(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
    return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string; json: any }>((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: TEST_PORT,
          path,
          method: options.method || 'GET',
          headers: options.headers || {}
        },
        (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            let json = null;
            try { json = JSON.parse(data); } catch {}
            resolve({ status: res.statusCode || 0, headers: res.headers, body: data, json });
          });
        }
      );
      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      }
      req.end();
    });
  }

  it('API-07 Regression: GET /api/unknown-endpoint returns HTTP 404 with JSON error body', async () => {
    const res = await makeRequest('/api/unknown-endpoint');
    expect(res.status).toBe(404);
    expect(res.json?.error).toBe('API endpoint not found');
  });

  it('API-07 Regression: POST /api/unknown-endpoint returns HTTP 404 with JSON error body', async () => {
    const res = await makeRequest('/api/unknown-endpoint', { method: 'POST' });
    expect(res.status).toBe(404);
    expect(res.json?.error).toBe('API endpoint not found');
  });

  it('POST /api/send-email rejects unauthenticated requests with HTTP 401', async () => {
    const res = await makeRequest('/api/send-email', { method: 'POST', body: { to: 'student@srmist.edu.in' } });
    expect(res.status).toBe(401);
    expect(res.json?.success).toBe(false);
  });

  it('POST /api/test-email rejects unauthenticated requests with HTTP 401', async () => {
    const res = await makeRequest('/api/test-email', { method: 'POST' });
    expect(res.status).toBe(401);
    expect(res.json?.success).toBe(false);
  });

  it('GET /api/ai/status returns HTTP 200 with gateway status', async () => {
    const res = await makeRequest('/api/ai/status');
    expect(res.status).toBe(200);
    expect(res.json?.success).toBe(true);
  });

  it('serves SPA index.html with HTTP 200 for root path', async () => {
    const res = await makeRequest('/');
    expect(res.status).toBe(200);
    expect(res.body.toLowerCase()).toContain('<!doctype html>');
  });

  it('serves production security headers', async () => {
    const res = await makeRequest('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(res.headers['strict-transport-security']).toBeTruthy();
  });

  it('blocks path traversal attempts with HTTP 403 or 404', async () => {
    const res = await makeRequest('/..%2Fpackage.json');
    expect([403, 404]).toContain(res.status);
  });

  it('safely handles malformed URI encoding without crashing server', async () => {
    const res = await makeRequest('/api/%E0%A4%A');
    expect(res.status).toBe(404);
    expect(res.json?.error).toBe('API endpoint not found');
  });
});

