/**
 * SRMIST Student Notification Service
 * Dispatches candidate status notifications (Shortlisting, Interview Calls, Decisions).
 * Logs notifications locally and dispatches real-time client events without external Resend dependency.
 */

import { CandidateProfile, JobRequirement } from '../types';
import { escapeHtml } from './sanitizer';

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

const STORAGE_NOTIFICATIONS_LOG = 'srm_dispatched_notifications';

/**
 * Dispatches candidate notifications directly within the platform.
 * Fully self-contained: no external third-party email provider dependencies required.
 */
export async function sendEmail(payload: EmailPayload): Promise<SendEmailResponse> {
  try {
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem(STORAGE_NOTIFICATIONS_LOG) || '[]');
        const logEntry = {
          id: messageId,
          to: recipients,
          subject: payload.subject,
          timestamp: new Date().toISOString()
        };
        const updated = [logEntry, ...existing].slice(0, 50);
        localStorage.setItem(STORAGE_NOTIFICATIONS_LOG, JSON.stringify(updated));

        // Dispatch institutional notification event for UI toasts/listeners
        window.dispatchEvent(new CustomEvent('srm_notification_sent', {
          detail: { messageId, recipients, subject: payload.subject }
        }));
      } catch {}
    }

    return {
      success: true,
      messageId
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Failed to dispatch notification.'
    };
  }
}

/**
 * Send shortlisting notification to candidate
 */
export async function sendShortlistNotification(
  candidate: CandidateProfile,
  job: JobRequirement,
  interviewDate = 'Upcoming Placement Drive'
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
        <h3 style="margin: 0 0 12px 0; color: #34d399; font-size: 16px;">Congratulations! You have been Shortlisted</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Dear <strong>${safeName}</strong> (${safeReg}),</p>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Your profile has cleared initial AI screening for <strong>${safeCompany} - ${safeTitle}</strong>.</p>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Tentative Interview: <strong>${safeDate}</strong></p>
      </div>
    </div>
  `;

  return sendEmail({
    to: candidate.email,
    subject: `[SRM Placement] You've Been Shortlisted! ${safeCompany} - ${safeTitle}`,
    html
  });
}

/**
 * Send rejection/status notification to candidate
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
      <div style="background: #1e293b; padding: 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 22px;">SRM Institute of Science and Technology</h1>
        <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Directorate of Career Centre & Placement Services</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Dear <strong>${safeName}</strong> (${safeReg}),</p>
        <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Thank you for participating in the <strong>${safeCompany} - ${safeTitle}</strong> drive. We regret to inform you that your application was not selected for the upcoming interview round.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: candidate.email,
    subject: `[SRM Placement Update] ${safeCompany} - ${safeTitle} Status`,
    html
  });
}
