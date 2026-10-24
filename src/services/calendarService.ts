import { Interview } from '../types';

/**
 * RFC 5545 Text Value Escaper
 * Escapes backslashes, semicolons, commas, and represents newlines as literal '\n'.
 * Strips non-printable ASCII control characters.
 */
export function sanitizeIcsText(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars except \t, \n, \r
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n');
}

/**
 * RFC 5545 Single-line Header/Attribute Sanitizer
 * Strips newlines, carriage returns, and control characters to prevent header and CRLF injection.
 */
export function sanitizeIcsHeader(value: string | undefined | null): string {
  if (!value) return '';
  return String(value)
    .replace(/[\r\n\x00-\x1F\x7F]/g, '') // strictly remove all linebreaks and control characters
    .trim();
}

/**
 * Validates and sanitizes email address for calendar mailto URIs
 */
export function sanitizeIcsEmail(value: string | undefined | null, fallback = 'student@srmist.edu.in'): string {
  if (!value) return fallback;
  const cleaned = String(value).replace(/[\r\n\x00-\x1F\x7F\s<>]/g, '').trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(cleaned) ? cleaned : fallback;
}

/**
 * Generates an iCalendar (.ics) string for an interview event.
 */
export function generateIcsContent(interview: Interview): string {
  // Parse date and time e.g., date: "2026-10-24", time: "11:00 AM" or "02:30 PM"
  let startDate = new Date();
  try {
    const [year, month, day] = interview.date.split('-').map(Number);
    let hours = 10;
    let minutes = 0;

    const timeParts = interview.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (timeParts) {
      hours = parseInt(timeParts[1], 10);
      minutes = parseInt(timeParts[2], 10);
      const ampm = timeParts[3]?.toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }

    startDate = new Date(year, month - 1, day, hours, minutes);
  } catch (e) {
    console.warn('Failed parsing interview date/time, using current time fallback:', e);
  }

  // 1 hour default duration
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const formatIcsDate = (d: Date) => {
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const nowStr = formatIcsDate(new Date());
  const startStr = formatIcsDate(startDate);
  const endStr = formatIcsDate(endDate);

  const safeUid = sanitizeIcsHeader(`srm-interview-${interview.id}@srmist.edu.in`);
  const safeCompany = sanitizeIcsText(interview.company);
  const safeRound = sanitizeIcsText(interview.round);
  const safeJob = sanitizeIcsText(interview.job_title);
  const safeCandidateName = sanitizeIcsText(interview.candidate_name);
  const safeCandidateReg = sanitizeIcsText(interview.candidate_reg_no);
  const safeInterviewer = sanitizeIcsText(interview.interviewer);
  const safeVenue = sanitizeIcsText(interview.venue);
  const safeMeetingLink = sanitizeIcsHeader(interview.meeting_link);
  const safeAttendeeEmail = sanitizeIcsEmail(interview.candidate_email);
  const safeAttendeeCN = sanitizeIcsHeader(interview.candidate_name).replace(/[";]/g, '');

  const summary = `SRM Placement Interview: ${safeCompany} (${safeRound})`;
  const venueOrLink = safeMeetingLink || safeVenue;
  const description = `Placement Interview with ${safeCompany} for the role of ${safeJob}.\\nCandidate: ${safeCandidateName} (${safeCandidateReg})\\nInterviewer: ${safeInterviewer}\\nVenue / Link: ${venueOrLink}${safeMeetingLink ? `\\nVirtual Meeting: ${safeMeetingLink}` : ''}\\nOrganized by Directorate of Career Centre, SRMIST.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SRMIST//SRM ResumeAI Placement Operations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${safeUid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${safeVenue}`,
    `ORGANIZER;CN="SRM Career Centre":mailto:careers@srmist.edu.in`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${safeAttendeeCN || 'Candidate'}:mailto:${safeAttendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: SRM Placement Interview in 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Triggers a browser download of an .ics calendar file.
 */
export function downloadIcsFile(interview: Interview): void {
  const icsData = generateIcsContent(interview);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeCompany = (interview.company || 'Company').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
  const safeDate = (interview.date || 'date').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
  link.setAttribute('download', `SRM_Interview_${safeCompany}_${safeDate}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates an institutional virtual meeting room link for the interview
 */
export function generateMeetingLink(company: string, candidateRegNo: string): string {
  const safeCompany = company.toLowerCase().replace(/[^a-z0-9]/g, '');
  const safeReg = candidateRegNo.toLowerCase().replace(/[^a-z0-9]/g, '') || Math.random().toString(36).slice(2, 7);
  return `https://meet.google.com/srm-${safeCompany}-${safeReg}`;
}

