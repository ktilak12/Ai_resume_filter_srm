import { Interview } from '../types';

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

  const uid = `srm-interview-${interview.id}@srmist.edu.in`;
  const summary = `SRM Placement Interview: ${interview.company} (${interview.round})`;
  const description = `Placement Interview with ${interview.company} for the role of ${interview.job_title}.\\nCandidate: ${interview.candidate_name} (${interview.candidate_reg_no})\\nInterviewer: ${interview.interviewer}\\nVenue / Link: ${interview.venue}\\nOrganized by Directorate of Career Centre, SRMIST.`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SRMIST//SRM ResumeAI Placement Operations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${interview.venue}`,
    `ORGANIZER;CN="SRM Career Centre":mailto:careers@srmist.edu.in`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${interview.candidate_name}:mailto:${interview.candidate_email || 'student@srmist.edu.in'}`,
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
  const safeCompany = interview.company.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `SRM_Interview_${safeCompany}_${interview.date}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
