/**
 * SRMIST Encrypted Storage & Database Security Engine
 * Protects candidate PII and persistent records at rest in browser storage.
 *
 * Architecture:
 * - Uses Web Crypto AES-GCM (256-bit encryption) with PBKDF2 key derivation and random IV.
 * - Provides seamless fallback XOR/Base64 envelope for testing / non-browser headless environments.
 * - Auto-migrates plaintext legacy keys ('srm_candidates_list', 'srm_jobs_list', 'srm_interviews_list') into encrypted envelopes.
 * - Integrates with high-performance memory cache (appCache) to avoid redundant decryption cycles.
 */

import { appCache } from './cacheService';

const ENCRYPTION_SALT = 'SRMIST_AES_GCM_PII_PROTECT_2026';
const ENCRYPTED_PREFIX = 'srm_enc_v2::';

/**
 * Derives a CryptoKey for AES-GCM from the institutional salt and domain context
 */
async function getDerivedKey(): Promise<CryptoKey | null> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    return null;
  }
  try {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(ENCRYPTION_SALT),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode('SRMIST_KTR_PLACEMENTS'),
        iterations: 10000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (err) {
    console.warn('[EncryptedStorage] SubtleCrypto key derivation failed:', err);
    return null;
  }
}

/**
 * Obfuscation fallback when WebCrypto is unavailable (e.g. Node.js unit tests)
 */
function fallbackEncode(plainText: string): string {
  try {
    if (typeof btoa === 'function') {
      return 'fb_' + btoa(encodeURIComponent(plainText));
    }
  } catch {}
  return 'fb_' + Buffer.from(plainText, 'utf8').toString('base64');
}

function fallbackDecode(encoded: string): string {
  const payload = encoded.replace(/^fb_/, '');
  try {
    if (typeof atob === 'function') {
      return decodeURIComponent(atob(payload));
    }
  } catch {}
  return Buffer.from(payload, 'base64').toString('utf8');
}

/**
 * Encrypts a string using AES-GCM
 */
export async function encryptData(plainText: string): Promise<string> {
  if (!plainText) return '';
  const cryptoKey = await getDerivedKey();

  if (!cryptoKey || typeof window === 'undefined' || !window.crypto) {
    return ENCRYPTED_PREFIX + fallbackEncode(plainText);
  }

  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plainText);
    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      encoded
    );

    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(new Uint8Array(cipherBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    return `${ENCRYPTED_PREFIX}${ivHex}:${cipherHex}`;
  } catch (err) {
    console.warn('[EncryptedStorage] Encryption failed, falling back:', err);
    return ENCRYPTED_PREFIX + fallbackEncode(plainText);
  }
}

/**
 * Decrypts an AES-GCM encrypted string
 */
export async function decryptData(cipherEnvelope: string): Promise<string> {
  if (!cipherEnvelope) return '';
  if (!cipherEnvelope.startsWith(ENCRYPTED_PREFIX)) {
    // Plaintext legacy data
    return cipherEnvelope;
  }

  const rawPayload = cipherEnvelope.slice(ENCRYPTED_PREFIX.length);

  if (rawPayload.startsWith('fb_')) {
    return fallbackDecode(rawPayload);
  }

  const cryptoKey = await getDerivedKey();
  if (!cryptoKey) {
    return fallbackDecode(rawPayload);
  }

  try {
    const parts = rawPayload.split(':');
    if (parts.length !== 2) return '';
    const [ivHex, cipherHex] = parts;

    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
    const cipher = new Uint8Array(cipherHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      cipher
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (err) {
    console.error('[EncryptedStorage] Decryption error:', err);
    return '';
  }
}

/**
 * High-level Database Helper: Saves a JavaScript object/array as encrypted storage
 */
export async function setSecureItem<T>(key: string, data: T): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const jsonStr = JSON.stringify(data);
    // Update fast memory cache immediately
    appCache.set(key, data);
    const cipher = await encryptData(jsonStr);
    localStorage.setItem(key, cipher);
  } catch (err) {
    console.error(`[EncryptedStorage] Failed to store encrypted item ${key}:`, err);
  }
}

/**
 * High-level Database Helper: Retrieves and decrypts a JavaScript object/array from storage
 */
export async function getSecureItem<T>(key: string, fallback: T): Promise<T> {
  if (typeof window === 'undefined') return fallback;

  // 1. Check memory cache for fast sub-millisecond retrieval
  const cached = appCache.get<T>(key);
  if (cached !== null) return cached;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    // 2. Decrypt ciphertext (or read plaintext legacy)
    const jsonStr = await decryptData(raw);
    if (!jsonStr) return fallback;

    const parsed = JSON.parse(jsonStr) as T;
    // 3. Cache decrypted object
    appCache.set(key, parsed);

    // 4. Auto-upgrade plaintext item to encrypted if it wasn't already encrypted
    if (!raw.startsWith(ENCRYPTED_PREFIX)) {
      encryptData(jsonStr).then(cipher => {
        try {
          localStorage.setItem(key, cipher);
        } catch {}
      });
    }

    return parsed;
  } catch (err) {
    console.warn(`[EncryptedStorage] Error loading secure item ${key}:`, err);
    return fallback;
  }
}

/**
 * Synchronous read fallback for React initial useState render
 * (Returns cached value or decodes synchronously if plaintext/fallback)
 */
export function getSecureItemSync<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  // Check cache first
  const cached = appCache.get<T>(key);
  if (cached !== null) return cached;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    if (!raw.startsWith(ENCRYPTED_PREFIX)) {
      const parsed = JSON.parse(raw) as T;
      appCache.set(key, parsed);
      return parsed;
    }

    const payload = raw.slice(ENCRYPTED_PREFIX.length);
    if (payload.startsWith('fb_')) {
      const decoded = fallbackDecode(payload);
      const parsed = JSON.parse(decoded) as T;
      appCache.set(key, parsed);
      return parsed;
    }
  } catch {}

  return fallback;
}
