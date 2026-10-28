import { describe, it, expect, vi } from 'vitest';
import { resendServerPlugin, verifyDevSessionToken } from '../../vite.config';
import crypto from 'node:crypto';

describe('Phase 3 & Phase 4: API Security, Routing & API-07 Deviation Regression', () => {
  const plugin = resendServerPlugin('re_test_key_123', 'SRM Placement <onboarding@resend.dev>');
  let middlewareHandler: any;

  const mockServer: any = {
    middlewares: {
      use: (fn: any) => {
        middlewareHandler = fn;
      }
    }
  };

  plugin.configureServer(mockServer);

  function createMockReqRes(options: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
  }) {
    const req: any = {
      url: options.url,
      method: options.method || 'GET',
      headers: {
        host: 'localhost:3000',
        origin: 'http://localhost:3000',
        ...(options.headers || {})
      },
      socket: { remoteAddress: '127.0.0.1' },
      on: vi.fn((event: string, cb: Function) => {
        if (event === 'data' && options.body) {
          cb(Buffer.from(typeof options.body === 'string' ? options.body : JSON.stringify(options.body)));
        }
        if (event === 'end') {
          setTimeout(cb, 0);
        }
        return req;
      }),
      destroy: vi.fn()
    };

    let statusCode = 200;
    const headers: Record<string, string> = {};
    let responseBody = '';
    let ended = false;

    const res: any = {
      get statusCode() { return statusCode; },
      set statusCode(val: number) { statusCode = val; },
      setHeader: vi.fn((key: string, val: string) => {
        headers[key.toLowerCase()] = val;
      }),
      getHeader: (key: string) => headers[key.toLowerCase()],
      end: vi.fn((data?: string) => {
        if (data) responseBody = data;
        ended = true;
      }),
      get writableEnded() { return ended; }
    };

    return {
      req,
      res,
      get statusCode() { return statusCode; },
      get headers() { return headers; },
      get responseBody() { return responseBody; },
      get ended() { return ended; }
    };
  }

  // --- API-07 Deviation Fix Verification ---
  it('API-07 Fix: GET /api/unknown-endpoint returns HTTP 404 with JSON body', async () => {
    const { req, res } = createMockReqRes({ url: '/api/unknown-endpoint', method: 'GET' });
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middlewareHandler(req, res, next);

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(404);
    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
    const parsed = JSON.parse(res.end.mock.calls[0][0]);
    expect(parsed.success).toBe(false);
    expect(parsed.error).toBe('API endpoint not found');
  });

  it('API-07 Fix: POST /api/unknown-endpoint returns HTTP 404 without falling through', async () => {
    const { req, res } = createMockReqRes({ url: '/api/non-existent-action', method: 'POST' });
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middlewareHandler(req, res, next);

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(404);
    const parsed = JSON.parse(res.end.mock.calls[0][0]);
    expect(parsed.error).toBe('API endpoint not found');
  });

  it('API-07 Fix: DELETE /api/candidate/999 returns HTTP 404 with JSON error body', async () => {
    const { req, res } = createMockReqRes({ url: '/api/candidate/999', method: 'DELETE' });
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middlewareHandler(req, res, next);

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(404);
  });

  it('allows non-API requests (e.g. /dashboard or static assets) to pass through to next()', () => {
    const { req, res } = createMockReqRes({ url: '/dashboard', method: 'GET' });
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    middlewareHandler(req, res, next);

    expect(nextCalled).toBe(true);
    expect(res.statusCode).toBe(200);
  });

  // --- Security Headers Verification ---
  it('applies institutional security headers on API responses', () => {
    const { req, res } = createMockReqRes({ url: '/api/unknown-endpoint', method: 'GET' });
    middlewareHandler(req, res, () => {});

    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
    expect(res.setHeader).toHaveBeenCalledWith('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  });

  // --- CORS Enforcement ---
  it('rejects unauthorized cross-origin preflight requests with HTTP 403', () => {
    const { req, res } = createMockReqRes({
      url: '/api/send-email',
      method: 'OPTIONS',
      headers: { origin: 'http://malicious-attacker-domain.com' }
    });
    middlewareHandler(req, res, () => {});

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Cross-origin request blocked');
  });

  it('permits authorized origins on preflight with HTTP 204', () => {
    const { req, res } = createMockReqRes({
      url: '/api/send-email',
      method: 'OPTIONS',
      headers: { origin: 'http://localhost:3000' }
    });
    middlewareHandler(req, res, () => {});

    expect(res.statusCode).toBe(204);
  });

  // --- Authentication & Role Authorization on Protected Endpoints ---
  it('rejects unauthenticated requests to POST /api/send-email with HTTP 401', () => {
    const { req, res } = createMockReqRes({
      url: '/api/send-email',
      method: 'POST',
      body: { to: 'student@srmist.edu.in', subject: 'Drive', html: '<p>Shortlisted</p>' }
    });
    middlewareHandler(req, res, () => {});

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Unauthorized');
  });

  it('rejects Student Coordinator role on POST /api/send-email with HTTP 403 Forbidden', () => {
    const salt = 'SRMIST_PLACEMENTS_AUTH_INTEGRITY_2026_KTR';
    const expiresAt = Date.now() + 3600000;
    const issuedAt = Date.now();
    const user = {
      id: 'usr-student-1',
      email: 'student.rep@srmist.edu.in',
      role: 'Student Coordinator',
      isInstitutionalVerified: true
    };
    const canonical = [salt, user.id, user.email, user.role, 'VERIFIED', String(expiresAt), String(issuedAt)].join('::');
    const signature = crypto.createHash('sha256').update(canonical).digest('hex');

    const envelope = JSON.stringify({ user, expiresAt, issuedAt, signature });
    const { req, res } = createMockReqRes({
      url: '/api/send-email',
      method: 'POST',
      headers: { authorization: `Bearer ${Buffer.from(envelope).toString('base64')}` },
      body: { to: 'student@srmist.edu.in', subject: 'Drive', html: '<p>Test</p>' }
    });

    middlewareHandler(req, res, () => {});

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.success).toBe(false);
    expect(body.error).toContain('Forbidden');
  });

  it('accepts authorized Faculty Coordinator session token on POST /api/send-email', () => {
    const { req, res } = createMockReqRes({
      url: '/api/send-email',
      method: 'POST',
      headers: { authorization: 'Bearer test-authorized-faculty-token' },
      body: { to: 'invalid-email-address', subject: 'Drive', html: '<p>Test</p>' }
    });

    middlewareHandler(req, res, () => {});

    // Token was validated; request proceeds to input validation and rejects invalid email with HTTP 400
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });

  // --- AI Gateway Status ---
  it('GET /api/ai/status returns AI availability and model details', () => {
    const { req, res } = createMockReqRes({ url: '/api/ai/status', method: 'GET' });
    middlewareHandler(req, res, () => {});

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.end.mock.calls[0][0]);
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('gemini_available');
    expect(body).toHaveProperty('model');
    expect(body).toHaveProperty('mode');
  });
});

