import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryCache } from '../services/cacheService';
import { 
  containsSqlInjection, 
  containsXss, 
  sanitizeSearchQuery, 
  escapeHtml, 
  sanitizeCsvField 
} from '../services/sanitizer';
import { 
  encryptData, 
  decryptData, 
  setSecureItem, 
  getSecureItem, 
  getSecureItemSync 
} from '../services/encryptedStorage';

describe('Production Hardening & Optimization Suite', () => {

  describe('1. Memory & LRU Caching Service', () => {
    let cache: MemoryCache;

    beforeEach(() => {
      cache = new MemoryCache(3, 1000); // Max 3 items, 1 second TTL
    });

    it('stores and retrieves items correctly', () => {
      cache.set('key1', { candidate: 'Tilak' });
      expect(cache.get('key1')).toEqual({ candidate: 'Tilak' });
    });

    it('evicts least recently used item when capacity is exceeded', () => {
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);

      // Access 'a' so 'b' becomes the oldest unaccessed
      cache.get('a');

      // Adding 4th item evicts 'b'
      cache.set('d', 4);

      expect(cache.get('b')).toBeNull();
      expect(cache.get('a')).toBe(1);
      expect(cache.get('c')).toBe(3);
      expect(cache.get('d')).toBe(4);
    });

    it('expires entries after TTL', async () => {
      cache.set('temp', 'value', 50); // 50ms TTL
      expect(cache.get('temp')).toBe('value');

      await new Promise(r => setTimeout(r, 60));
      expect(cache.get('temp')).toBeNull();
    });

    it('supports prefix invalidation', () => {
      cache.set('cand_1', { name: 'A' });
      cache.set('cand_2', { name: 'B' });
      cache.set('job_1', { title: 'SDE' });

      cache.invalidatePrefix('cand_');
      expect(cache.get('cand_1')).toBeNull();
      expect(cache.get('cand_2')).toBeNull();
      expect(cache.get('job_1')).not.toBeNull();
    });
  });

  describe('2. SQL Injection & XSS Input Sanitization', () => {
    it('detects common SQL injection vectors', () => {
      expect(containsSqlInjection("' OR 1=1 --")).toBe(true);
      expect(containsSqlInjection("admin' UNION SELECT * FROM users--")).toBe(true);
      expect(containsSqlInjection("; DROP TABLE candidates;")).toBe(true);
      expect(containsSqlInjection("valid student search name")).toBe(false);
      expect(containsSqlInjection("B.Tech Computer Science")).toBe(false);
    });

    it('detects malicious XSS scripts and protocols', () => {
      expect(containsXss("<script>alert('pwned')</script>")).toBe(true);
      expect(containsXss("javascript:alert(1)")).toBe(true);
      expect(containsXss("<img src=x onerror=alert(1)>")).toBe(true);
      expect(containsXss("<iframe src='evil.com'>")).toBe(true);
      expect(containsXss("React.js, Node.js & TypeScript developer")).toBe(false);
    });

    it('neutralizes dangerous control characters and comment markers in search query', () => {
      const sanitized = sanitizeSearchQuery("Aravind' OR '1'='1' --");
      expect(sanitized).not.toContain("'");
      expect(sanitized).not.toContain("--");
      expect(sanitized).toContain("Aravind");
    });

    it('escapes HTML characters in rendered templates', () => {
      const escaped = escapeHtml('<div class="test">Hello & Welcome</div>');
      expect(escaped).toBe('&lt;div class=&quot;test&quot;&gt;Hello &amp; Welcome&lt;/div&gt;');
    });

    it('neutralizes Excel and CSV formula injection payloads', () => {
      expect(sanitizeCsvField('=cmd|/c calc.exe')).toBe(`"'=cmd|/c calc.exe"`);
      expect(sanitizeCsvField('+SUM(A1:A10)')).toBe(`"'+SUM(A1:A10)"`);
      expect(sanitizeCsvField('-EXEC("calc")')).toBe(`"'-EXEC(""calc"")"`);
      expect(sanitizeCsvField('RA2311003010142')).toBe('"RA2311003010142"');
    });
  });

  describe('3. Storage Encryption & Database Security', () => {
    it('encrypts plaintext into an envelope with srm_enc_v2 prefix', async () => {
      const sample = JSON.stringify({ name: 'Tilak', reg_number: 'RA2311003010142' });
      const cipher = await encryptData(sample);
      expect(cipher.startsWith('srm_enc_v2::')).toBe(true);
      expect(cipher).not.toContain('RA2311003010142');
    });

    it('roundtrip encrypts and decrypts accurately', async () => {
      const secretRecord = JSON.stringify({ cgpa: 9.42, email: 'tilak.k@srmist.edu.in' });
      const cipher = await encryptData(secretRecord);
      const decrypted = await decryptData(cipher);
      expect(decrypted).toBe(secretRecord);
    });

    it('handles legacy plaintext gracefully without crashing', async () => {
      const legacyRaw = JSON.stringify([{ id: 'job-1', title: 'SDE' }]);
      const decrypted = await decryptData(legacyRaw);
      expect(decrypted).toBe(legacyRaw);
    });

    it('getSecureItemSync returns fallback data when storage is empty', () => {
      const result = getSecureItemSync('non_existent_key', ['default']);
      expect(result).toEqual(['default']);
    });
  });
});
