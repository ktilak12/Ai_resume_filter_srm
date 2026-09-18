import { CandidateProfile, JobRequirement } from '../types';

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

const STORAGE_FROM_EMAIL = 'srm_resend_from_email';

/**
 * Retrieves configured sender email address (stored locally or default)
 */
export function getResendFromEmail(): string {
  const localFrom = localStorage.getItem(STORAGE_FROM_EMAIL);
  if (localFrom && localFrom.trim()) return localFrom.trim();
  return 'SRM Placement Directorate <onboarding@resend.dev>';
}

/**
 * Saves Resend sender email to localStorage
 */
export function setResendFromEmail(email: string): void {
  if (email && email.trim()) {
    localStorage.setItem(STORAGE_FROM_EMAIL, email.trim());
  } else {
    localStorage.removeItem(STORAGE_FROM_EMAIL);
  }
}

/**
 * Core function to send an email via the secure server-side backend proxy.
 * Note: The Resend API Key is kept strictly on the server (.env) and never exposed in the browser!
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResponse> {
  const fromEmail = payload.from || getResendFromEmail();

  try {
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: recipients,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.subject,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[Server Email Error]', data);
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Failed to send email via Server Gateway`
      };
    }

    return {
      success: true,
      messageId: data.messageId,
    };
  } catch (err: any) {
    console.error('[Email Gateway Network Error]', err);
    return {
      success: false,
      error: err?.message || 'Network error communicating with server email gateway.'
    };
  }
}

/**
 * Test Resend API configuration via secure backend endpoint
 */
export async function testResendConnection(): Promise<SendEmailResponse> {
  try {
    const response = await fetch('/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: Backend Resend verification failed.`
      };
    }

    return {
      success: true,
      messageId: data.messageId
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to reach backend email gateway.'
    };
  }
}

/**
 * Sanitizes input strings to prevent HTML / script injection in email templates
 */
function escapeHtml(text: string | number | undefined | null): string {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str.replace(/[&<>"']/g, char => {
    switch (char) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&#39;';
      default: return char;
    }
  });
}

/**
 * Send shortlisting notification to candidate via Server Gateway
 */
export async function sendShortlistNotification(
  candidate: CandidateProfile,
  job: JobRequirement,
  interviewDate = 'October 15, 2026'
): Promise<SendEmailResponse> {
  const safeName = escapeHtml(candidate.name);
  const safeReg = escapeHtml(candidate.reg_number);
  const safeCompany = escapeHtml(job.company);
  const safeTitle = escapeHtml(job.title);
  const safeDate = escapeHtml(interviewDate);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #3b82f6); padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px;">SRM Institute of Science and Technology</h1>
        <p style="margin: 4px 0 0 0; color: #93c5fd; font-size: 13px;">Directorate of Career Centre & Placement Services</p>
      </div>
      
      <div style="padding: 24px;">
        <div style="background-color: #102a43; border-left: 4px solid #10b981; padding: 12px 16px; margin-bottom: 20px; border-radius: 4px;">
          <h3 style="margin: 0; color: #34d399; font-size: 16px;">🎉 Congratulations! You have been Shortlisted</h3>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Dear <strong>${safeName}</strong> (${safeReg}),</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          We are pleased to inform you that your profile has successfully cleared the initial AI screening for the placement drive below:
        </p>

        <div style="background-color: #1e293b; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px; color: #94a3b8;">Company: <strong style="color: #ffffff;">${safeCompany}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #94a3b8;">Role: <strong style="color: #ffffff;">${safeTitle}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #94a3b8;">Tentative Interview Date: <strong style="color: #fbbf24;">${safeDate}</strong></p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Please ensure your resume and technical portfolio are updated. Detailed schedule and venue instructions will follow shortly on the student placement portal.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0;">Directorate of Career Centre • SRMIST Kattankulathur</p>
          <p style="margin: 4px 0 0 0;">This is an automated notification from SRM Placement AI Engine.</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: candidate.email,
    subject: `[SRM Placement] You've Been Shortlisted! ${safeCompany} - ${safeTitle}`,
    html,
  });
}

/**
 * Send rejection notification to candidate via Server Gateway
 */
export async function sendRejectionNotification(
  candidate: CandidateProfile,
  job: JobRequirement
): Promise<SendEmailResponse> {
  const safeName = escapeHtml(candidate.name);
  const safeReg = escapeHtml(candidate.reg_number);
  const safeCompany = escapeHtml(job.company);
  const safeTitle = escapeHtml(job.title);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: #1e293b; padding: 24px; text-align: center; border-bottom: 1px solid #334155;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px;">SRM Institute of Science and Technology</h1>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Directorate of Career Centre & Placement Services</p>
      </div>
      
      <div style="padding: 24px;">
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Dear <strong>${safeName}</strong> (${safeReg}),</p>
        
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          Thank you for applying for the <strong>${safeCompany} - ${safeTitle}</strong> drive.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          After screening all submissions against the criteria set by the recruiting company, we regret to inform you that your application was not selected for the upcoming interview round.
        </p>

        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
          We encourage you to update your technical skills and project portfolio on the SRM Placement Portal for upcoming drives.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0;">Directorate of Career Centre • SRMIST Kattankulathur</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: candidate.email,
    subject: `[SRM Placement Update] ${safeCompany} - ${safeTitle} Status`,
    html,
  });
}

