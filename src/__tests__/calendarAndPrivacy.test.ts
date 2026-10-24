import { describe, it, expect } from 'vitest';
import { generateMeetingLink, generateIcsContent, sanitizeIcsText, sanitizeIcsHeader } from '../services/calendarService';
import { maskEmail, maskPhone, maskRegNumber, canAccessUnmaskedPII, sanitizeCsvField } from '../services/privacyGuard';
import { isRoleElevationAllowed } from '../services/sessionSecurity';
import { Interview, AuthUser } from '../types';

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

  it('neutralizes CRLF injection and property injection in iCalendar headers', () => {
    const maliciousInterview: Interview = {
      id: 'int-999',
      candidate_id: 'cand-evil',
      candidate_name: 'Attacker\r\nATTACH:http://malicious.site/payload.exe',
      candidate_reg_no: 'RA2311003010999',
      candidate_email: 'evil\r\n@srmist.edu.in',
      candidate_dept: 'CSE',
      job_id: 'job-1',
      job_title: 'Developer',
      company: 'Injected\r\nSUMMARY:Hacked Event',
      round: 'Technical Round 1',
      date: '2026-11-15',
      time: '10:00 AM',
      interviewer: 'Panelist',
      venue: 'Main Hall',
      status: 'Scheduled',
      created_at: new Date().toISOString()
    };

    const ics = generateIcsContent(maliciousInterview);
    // Raw newlines inside values must be escaped to literal '\n' and cannot create rogue properties
    expect(ics).not.toContain('\r\nATTACH:');
    expect(ics).toContain('Injected\\nSUMMARY:Hacked Event');
  });
});

describe('Student DPDP PII Privacy Guard & CSV Security', () => {
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
    expect(canAccessUnmaskedPII('Faculty Coordinator')).toBe(true);
    expect(canAccessUnmaskedPII('Super Admin')).toBe(true);
    expect(canAccessUnmaskedPII('Student Coordinator')).toBe(false);
    expect(canAccessUnmaskedPII(undefined)).toBe(false);
  });

  it('neutralizes CSV formula injection triggers (CWE-1236)', () => {
    // Formula triggers: =, +, -, @, |, %
    expect(sanitizeCsvField('=SUM(A1:A10)')).toBe(`"'=SUM(A1:A10)"`);
    expect(sanitizeCsvField('+cmd|/c calc')).toBe(`"'+cmd|/c calc"`);
    expect(sanitizeCsvField('-2+3*4')).toBe(`"'-2+3*4"`);
    expect(sanitizeCsvField('@HYPERLINK("http://evil.com")')).toBe(`"'@HYPERLINK(""http://evil.com"")"`);
    expect(sanitizeCsvField('|calc.exe')).toBe(`"'|calc.exe"`);
    expect(sanitizeCsvField('%payload')).toBe(`"'%payload"`);
    expect(sanitizeCsvField('\0=danger')).toBe(`"'=danger"`);
    // Safe standard string
    expect(sanitizeCsvField('Computer Science')).toBe(`"Computer Science"`);
  });
});

describe('RBAC Session Elevation Security', () => {
  it('rejects substring spoofing on administrative role elevation', () => {
    const userBadminton: AuthUser = {
      id: 'u1',
      name: 'Badminton Coach',
      email: 'badminton@srmist.edu.in',
      role: 'Faculty Coordinator',
      department: 'Sports',
      regNumber: 'EMP8888',
      isInstitutionalVerified: true,
      lastLoginAt: new Date().toISOString()
    };

    const userDeanSubstring: AuthUser = {
      id: 'u2',
      name: 'Sandean Kumar',
      email: 'sandean@srmist.edu.in',
      role: 'Faculty Coordinator',
      department: 'Civil',
      regNumber: 'EMP8889',
      isInstitutionalVerified: true,
      lastLoginAt: new Date().toISOString()
    };

    // Substring matches must be rejected for Super Admin
    expect(isRoleElevationAllowed(userBadminton, 'Super Admin')).toBe(false);
    expect(isRoleElevationAllowed(userDeanSubstring, 'Super Admin')).toBe(false);
  });

  it('allows verified administrative staff with boundary match to elevate to Super Admin', () => {
    const directorUser: AuthUser = {
      id: 'u3',
      name: 'Placement Director',
      email: 'placement.director@srmist.edu.in',
      role: 'Faculty Coordinator',
      department: 'CDC',
      regNumber: 'EMP1001',
      isInstitutionalVerified: true,
      lastLoginAt: new Date().toISOString()
    };

    const adminUser: AuthUser = {
      id: 'u4',
      name: 'System Admin',
      email: 'admin@srmist.edu.in',
      role: 'Faculty Coordinator',
      department: 'ITKM',
      regNumber: 'EMP1002',
      isInstitutionalVerified: true,
      lastLoginAt: new Date().toISOString()
    };

    expect(isRoleElevationAllowed(directorUser, 'Super Admin')).toBe(true);
    expect(isRoleElevationAllowed(adminUser, 'Super Admin')).toBe(true);
  });
});
