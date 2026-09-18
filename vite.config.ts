import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function resendServerPlugin(apiKey?: string, defaultFrom?: string): Plugin {
  return {
    name: 'resend-server-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/send-email' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', chunk => {
            bodyStr += chunk;
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

              const fromEmail = body.from || defaultFrom || process.env.RESEND_FROM_EMAIL || 'SRM Placement Directorate <onboarding@resend.dev>';
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
                subject: 'SRM ResumeAI - Secure Server Gateway Verified',
                html: `
                  <div style="font-family: sans-serif; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 10px;">
                    <h2 style="color: #38bdf8; margin-top: 0;">SRM Placement Directorate - Server Gateway Active</h2>
                    <p>Your Resend API key is stored securely in the server backend (.env) and is <strong>never exposed</strong> in the client-side browser JavaScript bundle.</p>
                    <hr style="border-color: #334155; margin: 16px 0;" />
                    <p style="font-size: 12px; color: #94a3b8;">SRM Institute of Science and Technology • Placement AI Engine</p>
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
  // Load server-side environment variables without exposing to client bundle
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
