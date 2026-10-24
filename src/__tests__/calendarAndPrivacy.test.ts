import { describe, it, expect } from 'vitest';
import { generateMeetingLink, generateIcsContent } from '../services/calendarService';
import { maskEmail, maskPhone, maskRegNumber, canAccessUnmaskedPII } from '../services/privacyGuard';
import { Interview } from '../types';

describe('Calendar and Virtual Meeting Service', () => {
  it('generates deterministic and sanitized meeting URLs', () => {
    const link = generateMeetingLink('Google Cloud', 'RA2311003010142');
    expect(link).toContain('https://meet.google.com/srm-googlecloud-ra2311003010142');
  });

  it('builds RFC 5545 valid .ics calendar content', () => {
    const interview: Interview = {
      id: 'int-101',
      candidate_id: 'cand-101',
      candidate_name: 'Priya Sharma',
      candidate_reg_no: 'RA2311003010500',
      candidate_email: 'priya.s@srmist.edu.in',
      candidate_dept: 'CSE',
      job_id: 'job-1',
      job_title: 'Cloud Architect',
      company: 'Amazon Web Services',
      round: 'Technical Round 1',
      date: '2026-11-15',
      time: '10:00 AM',
      interviewer: 'Dr. Venkat',
      venue: 'Interview Room 302',
      meeting_link: 'https://meet.google.com/srm-test-room',
      status: 'Scheduled',
      created_at: new Date().toISOString()
    };

    const ics = generateIcsContent(interview);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:SRM Placement Interview: Amazon Web Services (Technical Round 1)');
    expect(ics).toContain('LOCATION:Interview Room 302');
    expect(ics).toContain('END:VCALENDAR');
  });
});

describe('Student DPDP PII Privacy Guard', () => {
  it('masks emails cleanly preserving domain and edge characters', () => {
    expect(maskEmail('aravind.swaminathan@srmist.edu.in')).toBe('ar****n@srmist.edu.in');
    expect(maskEmail('a@srmist.edu.in')).toBe('a*@srmist.edu.in');
    expect(maskEmail(undefined)).toBe('******@srmist.edu.in');
  });

  it('masks phone numbers preserving country code and ending digits', () => {
    const masked = maskPhone('+91 98401 22334');
    expect(masked).toBe('+91 98****334');
  });

  it('masks student register numbers with institutional format', () => {
    expect(maskRegNumber('RA2311003010142')).toBe('RA23*****0142');
  });

  it('enforces RBAC permissions for unmasked student PII access', () => {
    expect(canAccessUnmaskedPII('Placement Officer')).toBe(true);
    expect(canAccessUnmaskedPII('Super Admin')).toBe(true);
    expect(canAccessUnmaskedPII('Corporate Recruiter', false)).toBe(false);
    expect(canAccessUnmaskedPII('Corporate Recruiter', true)).toBe(true);
    expect(canAccessUnmaskedPII('Student Coordinator')).toBe(false);
    expect(canAccessUnmaskedPII(undefined)).toBe(false);
  });
});
