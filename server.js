/**
 * SRM ResumeAI - Secure Production Node.js Server
 * Keeps RESEND_API_KEY secure on the backend and serves the frontend build.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually if available in Node
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
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Secure Server-Side Email API
  if (req.url === '/api/send-email' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
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

        const fromEmail = body.from || process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';
        const recipients = Array.isArray(body.to) ? body.to : [body.to];

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipients,
            subject: body.subject,
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
          subject: 'SRM ResumeAI - Production Server Gateway Test',
          html: `
            <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 10px;">
              <h2 style="color: #38bdf8; margin-top: 0;">SRM Placement Directorate - Production Server Gateway Active</h2>
              <p>Your Resend API key is stored securely on the Node.js backend and is <strong>never exposed</strong> in the frontend.</p>
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
  console.log(`[Resend Gateway] Active - API Key secured on backend.`);
});
