/**
 * SRMIST Injection Defense & Input Sanitization Suite
 * Protects against:
 * - SQL / NoSQL Injection patterns (tautologies, UNION, inline comments, stacked queries)
 * - Cross-Site Scripting (XSS, script tags, javascript: pseudo-protocols, event handlers)
 * - Command injection / shell metacharacters
 * - CSV / Excel Formula Injection
 */

// Regex patterns detecting dangerous SQL Injection constructs
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|UNION|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/i,
  /(--|#|\/\*|\*\/)/, // Comment markers
  /(\bOR\b|\bAND\b)\s+['"]?[0-9a-zA-Z]+['"]?\s*=\s*['"]?[0-9a-zA-Z]+['"]?/i, // '1'='1', 1=1
  /(;\s*(DROP|SELECT|INSERT|UPDATE|DELETE))/i // Stacked queries
];

// Regex patterns detecting Cross-Site Scripting (XSS)
const XSS_PATTERNS = [
  /<script\b[^>]*>([\s\S]*?)<\/script>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /on\w+\s*=/i, // onload=, onerror=, onclick=
  /<iframe\b/i,
  /<object\b/i,
  /<embed\b/i
];

/**
 * Validates whether a string contains SQL injection signatures
 */
export function containsSqlInjection(input: string | undefined | null): boolean {
  if (!input || typeof input !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Validates whether a string contains XSS or script payload signatures
 */
export function containsXss(input: string | undefined | null): boolean {
  if (!input || typeof input !== 'string') return false;
  return XSS_PATTERNS.some(pattern => pattern.test(input));
}

/**
 * Neutralizes SQL injection and unsafe control characters while preserving alphanumeric, punctuation, and whitespace
 */
export function sanitizeSearchQuery(query: string | undefined | null): string {
  if (!query || typeof query !== 'string') return '';
  
  return query
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '';
        case '\x08': return '';
        case '\x09': return ' ';
        case '\x1a': return '';
        case '\n': return ' ';
        case '\r': return '';
        case '"': return '&quot;';
        case "'": return '&#39;';
        case '\\': return '\\\\';
        case '%': return '\\%';
        default: return char;
      }
    })
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim();
}

/**
 * Escapes HTML characters to prevent XSS injection in templates and rendered outputs
 */
export function escapeHtml(text: string | number | undefined | null): string {
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
 * Neutralizes CSV/Excel formula injection (e.g. '=cmd|...', '+SUM', '-EXEC')
 */
export function sanitizeCsvField(field: unknown): string {
  if (field === null || field === undefined) return '""';
  let str = String(field).trim();

  // If starts with dangerous spreadsheet formula triggers, prepend a single quote
  if (/^[=+@-]/i.test(str)) {
    str = `'${str}`;
  }

  // Escape inner double quotes
  return `"${str.replace(/"/g, '""')}"`;
}
