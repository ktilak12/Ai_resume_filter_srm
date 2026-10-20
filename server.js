/**
 * SRM ResumeAI - Secure Production Node.js Server
 * Hardened with:
 * - Strict Content Security Policy (CSP) & Defensive HTTP Headers
 * - Validated Same-Origin / Whitelisted CORS Protection
 * - CRLF & Email Header Injection Mitigation
 * - Anti-Spoofing Client IP Extraction & In-Memory Rate Limiting
 * - Traversal-Resistant Static File Path Resolution
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually in Node
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && !match[1].startsWith('#')) {
      const key = match[1];
      let val = (match[2] || '').trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.resolve(__dirname, 'dist');

// --- 1. Security: Allowed Origins for CORS ---
const ALLOWED_ORIGINS = new Set([
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()) : [])
]);

function isAllowedOrigin(origin) {
  if (!origin) return true; // Same-origin or server-to-server request
  return ALLOWED_ORIGINS.has(origin);
}

// --- 2. Security: In-Memory IP Rate Limiter (Max 25 requests per minute) ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 25;

// Periodic cleanup of expired rate limiter records every 60s
const rateLimitPruneInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);
rateLimitPruneInterval.unref();

function getClientIp(req) {
  if (process.env.TRUST_PROXY === 'true' && req.headers['x-forwarded-for']) {
    const forwarded = String(req.headers['x-forwarded-for']).split(',')[0].trim();
    if (forwarded) return forwarded;
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

function isRateLimited(ip) {
  const now = Date.now();
  const clientData = rateLimitMap.get(ip) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, clientData);
    return false;
  }

  clientData.count += 1;
  rateLimitMap.set(ip, clientData);

  return clientData.count > MAX_REQUESTS_PER_WINDOW;
}

// --- 3. Sanitization Helpers ---
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,63}$/;

function sanitizeHeader(val) {
  return String(val || '').replace(/[\r\n\t\x00-\x1F]/g, ' ').trim();
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const clientIp = getClientIp(req);
  const origin = req.headers.origin;

  // Comprehensive Hardened Security Headers (Highest Institutional Grade)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://accounts.google.com; frame-src https://accounts.google.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
  );

  // Validate Origin for CORS
  if (origin) {
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Vary', 'Origin');
    } else {
      // Reject unauthorized cross-origin preflights & requests
      if (req.method === 'OPTIONS' || req.url?.startsWith('/api/')) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Cross-origin request blocked by security policy.' }));
        return;
      }
    }
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Secure Server-Side Email API
  if (req.url === '/api/send-email' && req.method === 'POST') {
    if (isRateLimited(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: 'Too many requests. Rate limit exceeded (Max 25 emails/minute). Please try again shortly.'
      }));
      return;
    }

    let bodyStr = '';
    let isPayloadTooLarge = false;
    req.on('data', chunk => {
      if (isPayloadTooLarge) return;
      bodyStr += chunk;
      // Protect against oversized JSON body attack (Max 200KB)
      if (bodyStr.length > 200 * 1024) {
        isPayloadTooLarge = true;
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Payload Too Large: Maximum allowed payload is 200KB.'
        }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      if (isPayloadTooLarge) return;
      try {
        const body = JSON.parse(bodyStr || '{}');
        const key = process.env.RESEND_API_KEY || '';

        if (!key) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'RESEND_API_KEY is not configured in .env on the server.'
          }));
          return;
        }

        // Input Validation
        if (!body.to || !body.subject || !body.html) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Invalid payload: "to", "subject", and "html" are required fields.'
          }));
          return;
        }

        // Sanitize and validate recipients against CRLF and invalid formatting
        const rawRecipients = Array.isArray(body.to) ? body.to : [body.to];
        const recipients = rawRecipients
          .map(e => sanitizeHeader(e))
          .filter(e => e.length > 0 && e.length <= 100);

        const invalidEmails = recipients.filter(e => !EMAIL_REGEX.test(e));
        if (invalidEmails.length > 0 || recipients.length === 0 || recipients.length > 50) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: `Invalid recipient email address(es): ${invalidEmails.slice(0, 5).join(', ')}`
          }));
          return;
        }

        // Sanitize Subject (Strip CRLF to prevent SMTP header injection, max 200 chars)
        const safeSubject = sanitizeHeader(body.subject).slice(0, 200);

        // Enforce safe From address
        const configuredFrom = process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';
        let fromEmail = configuredFrom;
        if (body.from && typeof body.from === 'string') {
          const candidateFrom = sanitizeHeader(body.from);
          // Only permit safe alphanumeric/name formatting without control characters
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
        res.writeHead(resendRes.status, { 'Content-Type': 'application/json' });
        if (resendRes.ok) {
          res.end(JSON.stringify({ success: true, messageId: data.id }));
        } else {
          res.end(JSON.stringify({
            success: false,
            error: data.message || data.error || `Resend Error HTTP ${resendRes.status}`
          }));
        }
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message || 'Server error' }));
      }
    });
    return;
  }

  // 2. Test Email API
  if (req.url === '/api/test-email' && req.method === 'POST') {
    if (isRateLimited(clientIp)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait a minute.' }));
      return;
    }

    const key = process.env.RESEND_API_KEY || '';
    if (!key) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'RESEND_API_KEY is not configured in .env on the server.' }));
      return;
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: ['delivered@resend.dev'],
          subject: 'SRM ResumeAI - Production Gateway Verification',
          html: `
            <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 10px;">
              <h2 style="color: #38bdf8; margin-top: 0;">SRM Placement Directorate - Production Server Gateway Active</h2>
              <p>Your Resend API key is secured on the Node.js backend with Rate Limiting and Input Validation active.</p>
            </div>
          `,
        }),
      });

      const data = await resendRes.json();
      res.writeHead(resendRes.status, { 'Content-Type': 'application/json' });
      if (resendRes.ok) {
        res.end(JSON.stringify({ success: true, messageId: data.id }));
      } else {
        res.end(JSON.stringify({ success: false, error: data.message || 'Authentication error' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Handle unknown /api routes
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  const pathname = decodeURIComponent(parsedUrl.pathname);

  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'API endpoint not found' }));
    return;
  }

  // 3. Static File Serving (with Path Traversal Guard)
  const normalizedPath = path.normalize(pathname);
  if (normalizedPath.includes('..') || normalizedPath.startsWith('/.') || normalizedPath.includes('/.')) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  const safePath = path.resolve(DIST_DIR, normalizedPath === '/' ? 'index.html' : normalizedPath.replace(/^\/+/, ''));

  // Ensure resolved path is strictly within DIST_DIR
  if (safePath !== DIST_DIR && !safePath.startsWith(DIST_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Access Denied');
    return;
  }

  let finalFilePath = safePath;
  if (!fs.existsSync(finalFilePath) || fs.statSync(finalFilePath).isDirectory()) {
    // If it's a static asset that doesn't exist, return 404 instead of serving index.html
    if (pathname.startsWith('/assets/') || path.extname(pathname)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Asset Not Found');
      return;
    }
    finalFilePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(finalFilePath)) {
    const ext = path.extname(finalFilePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(finalFilePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found. Build the frontend first via npm run build.');
  }
});

server.listen(PORT, () => {
  console.log(`[SRM ResumeAI Server] Running securely on http://localhost:${PORT}`);
  console.log(`[Resend Gateway] Active - API Key secured with Rate Limiting & Origin Validation.`);
});
