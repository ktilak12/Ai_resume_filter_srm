import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;

function sanitizeHeader(val: any): string {
  return String(val || '').replace(/[\r\n\t\x00-\x1F]/g, ' ').trim();
}

// In-Memory Rate Limiter for Dev/Preview Server (Max 25 requests/min per IP)
const devRateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkDevRateLimit(ip: string): boolean {
  const now = Date.now();
  const clientData = devRateLimitMap.get(ip) || { count: 0, resetTime: now + 60000 };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + 60000;
    devRateLimitMap.set(ip, clientData);
    return false;
  }

  clientData.count += 1;
  devRateLimitMap.set(ip, clientData);

  // Periodically clean stale entries
  if (devRateLimitMap.size > 1000) {
    for (const [key, val] of devRateLimitMap.entries()) {
      if (now > val.resetTime) devRateLimitMap.delete(key);
    }
  }

  return clientData.count > 25;
}

function resendServerPlugin(apiKey?: string, defaultFrom?: string): Plugin {
  const allowedOrigins = new Set([
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
  ]);

  const handler = (req: any, res: any, next: any) => {
    const rawUrl = req.url || '';
    const urlPath = rawUrl.split('?')[0].replace(/\/+$/, '');
    
    // Safely get client IP (only trust x-forwarded-for if explicitly enabled)
    const clientIp = (process.env.TRUST_PROXY === 'true' && req.headers['x-forwarded-for'])
      ? String(req.headers['x-forwarded-for']).split(',')[0].trim()
      : req.socket?.remoteAddress || '127.0.0.1';

    const origin = req.headers.origin;
    // In dev, permit same-origin, configured origins, or any localhost/127.0.0.1 port
    const isOriginAllowed = !origin || 
      allowedOrigins.has(origin) || 
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

    // Apply comprehensive security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    // 'same-origin-allow-popups' is required for Google OAuth Identity Services popup flow
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

    if (origin && isOriginAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Vary', 'Origin');
    }

    // CORS preflight handling
    if (req.method === 'OPTIONS' && (urlPath === '/api/send-email' || urlPath === '/api/test-email')) {
      if (!isOriginAllowed) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Cross-origin request blocked.' }));
        return;
      }
      res.statusCode = 204;
      res.end();
      return;
    }

    if (urlPath === '/api/send-email' && req.method === 'POST') {
      if (!isOriginAllowed) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Forbidden cross-origin request.' }));
        return;
      }

      if (checkDevRateLimit(clientIp)) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          error: 'Rate limit exceeded (Max 25 emails/min). Please try again shortly.'
        }));
        return;
      }

      const chunks: Buffer[] = [];
      let totalLength = 0;
      let isPayloadTooLarge = false;

      req.on('data', (chunk: any) => {
        if (isPayloadTooLarge) return;
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        chunks.push(buf);
        totalLength += buf.length;
        if (totalLength > 200 * 1024) {
          isPayloadTooLarge = true;
          res.statusCode = 413;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Payload too large (Max 200KB).' }));
          req.destroy();
        }
      });

      req.on('end', async () => {
        if (isPayloadTooLarge) return;
        try {
          const bodyStr = Buffer.concat(chunks).toString('utf-8');
          const body = JSON.parse(bodyStr || '{}');
          const key = apiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';

          if (!key) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'RESEND_API_KEY is not configured in .env on the server.'
            }));
            return;
          }

          if (!body.to || !body.subject || !body.html) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Invalid payload: "to", "subject", and "html" are required.'
            }));
            return;
          }

          const rawRecipients = Array.isArray(body.to) ? body.to : [body.to];
          const recipients = rawRecipients
            .map((e: any) => sanitizeHeader(e))
            .filter((e: string) => e.length > 0 && e.length <= 100);

          const invalidEmails = recipients.filter((e: string) => !EMAIL_REGEX.test(e));

          if (invalidEmails.length > 0 || recipients.length === 0 || recipients.length > 50) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: `Invalid recipient email address(es): ${invalidEmails.slice(0, 5).join(', ')}`
            }));
            return;
          }

          // Strip CRLF from subject to prevent header injection
          const safeSubject = sanitizeHeader(body.subject).slice(0, 200);

          let fromEmail = defaultFrom || process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';
          if (body.from && typeof body.from === 'string') {
            const candidateFrom = sanitizeHeader(body.from);
            if (candidateFrom.length <= 100 && /^[a-zA-Z0-9\s<@.>_-]+$/.test(candidateFrom)) {
              fromEmail = candidateFrom;
            }
          }

          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: recipients,
              subject: safeSubject,
              html: body.html,
              text: sanitizeHeader(body.text) || safeSubject,
            }),
          });

          const data = await resendRes.json();
          res.statusCode = resendRes.status;
          res.setHeader('Content-Type', 'application/json');

          if (resendRes.ok) {
            res.end(JSON.stringify({ success: true, messageId: data.id }));
          } else {
            res.end(JSON.stringify({
              success: false,
              error: data.message || data.error || `Resend Error HTTP ${resendRes.status}`
            }));
          }
        } catch (err: any) {
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
        }
      });
      return;
    }

    if (urlPath === '/api/test-email' && req.method === 'POST') {
      if (!isOriginAllowed) {
        res.statusCode = 403;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Forbidden cross-origin request.' }));
        return;
      }

      if (checkDevRateLimit(clientIp)) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait.' }));
        return;
      }

      const key = apiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || '';
      if (!key) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          error: 'RESEND_API_KEY is not configured in .env on the server.'
        }));
        return;
      }

      (async () => {
        try {
          const fromEmail = defaultFrom || process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: ['delivered@resend.dev'],
              subject: 'SRM ResumeAI - Secure Gateway Verification',
              html: `
                <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 10px;">
                  <h2 style="color: #38bdf8; margin-top: 0;">SRM Placement Directorate - Server Gateway Active</h2>
                  <p>Your Resend API key is stored securely on the backend with rate limiting and payload validation active.</p>
                </div>
              `,
            }),
          });

          const data = await resendRes.json();
          res.statusCode = resendRes.status;
          res.setHeader('Content-Type', 'application/json');

          if (resendRes.ok) {
            res.end(JSON.stringify({ success: true, messageId: data.id }));
          } else {
            res.end(JSON.stringify({
              success: false,
              error: data.message || data.error || 'Resend Authentication failed'
            }));
          }
        } catch (err: any) {
          if (!res.writableEnded) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
        }
      })();
      return;
    }

    next();
  };

  return {
    name: 'resend-server-api',
    configureServer(server) {
      server.middlewares.use(handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      resendServerPlugin(env.RESEND_API_KEY || env.VITE_RESEND_API_KEY, env.RESEND_FROM_EMAIL)
    ],
    server: {
      port: 3000,
      open: false,
      host: true,
      strictPort: false
    },
    preview: {
      port: 3000,
      host: true,
      strictPort: false
    }
  };
});
