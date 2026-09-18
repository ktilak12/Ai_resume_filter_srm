import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// In-Memory Rate Limiter for Dev Server (Max 25 requests/min)
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
  return clientData.count > 25;
}

function resendServerPlugin(apiKey?: string, defaultFrom?: string): Plugin {
  return {
    name: 'resend-server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

        if (req.url === '/api/send-email' && req.method === 'POST') {
          if (checkDevRateLimit(clientIp)) {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'Rate limit exceeded (Max 25 emails/min). Please try again shortly.'
            }));
            return;
          }

          let bodyStr = '';
          req.on('data', chunk => {
            bodyStr += chunk;
            if (bodyStr.length > 200 * 1024) {
              req.destroy();
            }
          });

          req.on('end', async () => {
            try {
              const body = JSON.parse(bodyStr || '{}');
              const key = apiKey || process.env.RESEND_API_KEY || '';

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

              const recipients = (Array.isArray(body.to) ? body.to : [body.to]).map(e => String(e).trim());
              const invalidEmails = recipients.filter(e => !EMAIL_REGEX.test(e));

              if (invalidEmails.length > 0 || recipients.length === 0 || recipients.length > 50) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                  success: false,
                  error: `Invalid recipient email address(es): ${invalidEmails.join(', ')}`
                }));
                return;
              }

              const fromEmail = body.from || defaultFrom || process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';

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
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
            }
          });
          return;
        }

        if (req.url === '/api/test-email' && req.method === 'POST') {
          if (checkDevRateLimit(clientIp)) {
            res.statusCode = 429;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: 'Rate limit exceeded. Please wait.' }));
            return;
          }

          const key = apiKey || process.env.RESEND_API_KEY || '';
          if (!key) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: false,
              error: 'RESEND_API_KEY is not configured in .env on the server.'
            }));
            return;
          }

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
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      resendServerPlugin(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL)
    ],
    server: {
      port: 3000,
      open: false,
      host: true
    }
  };
});
