/**
 * SRMIST Student PII Privacy & Data Protection Service
 * Compliant with:
 * - Digital Personal Data Protection (DPDP) Act 2023
 * - Institutional Student Privacy Guidelines
 * - Role-Based PII Masking & De-identification
 */

import { UserRole } from '../types';

/**
 * Masks an email address: e.g. "aravind.s@srmist.edu.in" -> "ar****s@srmist.edu.in"
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '******@srmist.edu.in';
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local.charAt(0)}*@${domain}`;
  }
  const start = local.slice(0, 2);
  const end = local.slice(-1);
  return `${start}****${end}@${domain}`;
}

/**
 * Masks a phone number: e.g. "+91 98401 22334" -> "+91 98*** **334"
 */
export function maskPhone(phone?: string): string {
  if (!phone) return '+91 98*** *****';
  const clean = phone.trim();
  if (clean.length < 8) return '**** ****';
  const visiblePrefix = clean.slice(0, 6);
  const visibleSuffix = clean.slice(-3);
  return `${visiblePrefix}****${visibleSuffix}`;
}

/**
 * Masks an SRM Student Register Number: e.g. "RA2311003010142" -> "RA23*****0142"
 */
export function maskRegNumber(regNo?: string): string {
  if (!regNo) return 'RA23*****';
  const clean = regNo.trim().toUpperCase();
  if (clean.length < 8) return 'RA*****';
  return `${clean.slice(0, 4)}*****${clean.slice(-4)}`;
}

/**
 * Determines whether the active user role is authorized to view unmasked student PII.
 * Institutional Placement Officers and Super Admins have full access.
 * External Corporate Recruiters can only access unmasked PII if candidate is Shortlisted.
 */
export function canAccessUnmaskedPII(role: UserRole | undefined, isShortlisted: boolean = false): boolean {
  if (!role) return false;
  if (role === 'Super Admin' || role === 'Placement Officer' || role === 'Faculty Coordinator') {
    return true;
  }
  if (role === 'Corporate Recruiter') {
    // Only permit viewing unmasked contact info once candidate is shortlisted
    return isShortlisted;
  }
  if (role === 'Student Coordinator') {
    return false;
  }
  return false;
}

/**
 * Sanitizes any cell content to prevent CSV/Spreadsheet Formula Injection (CWE-1236)
 */
export function sanitizeCsvField(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // If field starts with formula trigger characters (=, +, -, @, tab, cr), escape with single quote
  if (/^[=+\-@\t\r]/.test(str.trim())) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}
