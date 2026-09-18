/**
 * SRM ResumeAI - Secure Production Node.js Server
 * Hardened with Rate Limiting, Input Validation, and Backend API Key Isolation.
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
const DIST_DIR = path.join(__dirname, 'dist');

// --- Security: In-Memory IP Rate Limiter (Max 20 requests per minute) ---
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

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

  // Clean up stale map entries periodically
  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  return clientData.count > MAX_REQUESTS_PER_WINDOW;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
        error: 'Too many requests. Rate limit exceeded (Max 20 emails/minute). Please try again shortly.'
      }));
      return;
    }

    let bodyStr = '';
    req.on('data', chunk => {
      bodyStr += chunk;
      // Protect against oversized JSON body attack
      if (bodyStr.length > 200 * 1024) {
        req.destroy();
      }
    });

    req.on('end', async () => {
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

        const recipients = (Array.isArray(body.to) ? body.to : [body.to]).map(e => String(e).trim());
        
        // Validate recipient emails
        const invalidEmails = recipients.filter(e => !EMAIL_REGEX.test(e));
        if (invalidEmails.length > 0 || recipients.length === 0 || recipients.length > 50) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: `Invalid recipient email address(es): ${invalidEmails.join(', ')}`
          }));
          return;
        }

        const fromEmail = body.from || process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipients,
            subject: String(body.subject).slice(0, 200),
            html: body.html,
            text: body.text || body.subject,
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

  // 3. Static File Serving (for production dist build)
  let filePath = path.join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found. Build the frontend first via npm run build.');
  }
});

server.listen(PORT, () => {
  console.log(`[SRM ResumeAI Server] Running securely on http://localhost:${PORT}`);
  console.log(`[Resend Gateway] Active - API Key secured with Rate Limiting.`);
});
