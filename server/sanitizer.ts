import { DetectedType, InputType } from './types.js';

export interface SanitizationResult {
  original: string;
  sanitized: string;
  detectedType: DetectedType;
  wasModified: boolean;
  warnings: string[];
}

// Common patterns
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_CHARS_REGEX = /^[\s\d\+\-\(\)\.]{6,25}$/;
const URL_PREFIX_REGEX = /^(https?:\/\/|www\.)/i;

export function sanitizeAndDetect(rawInput: string, requestedType: InputType | 'auto' = 'auto'): SanitizationResult {
  const original = rawInput ?? '';
  let cleaned = original.trim();
  const warnings: string[] = [];

  // Remove dangerous control characters, zero-width chars, and null bytes
  const beforeStripping = cleaned;
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '');
  if (cleaned !== beforeStripping) {
    warnings.push('Stripped hidden control characters / null bytes');
  }

  // Detect input type
  let detectedType: DetectedType = 'unknown';

  if (requestedType && requestedType !== 'auto') {
    detectedType = requestedType;
  } else {
    // Auto-detection logic
    if (EMAIL_REGEX.test(cleaned) || (cleaned.includes('@') && cleaned.includes('.'))) {
      detectedType = 'email';
    } else if (URL_PREFIX_REGEX.test(cleaned) || /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/i.test(cleaned)) {
      detectedType = 'url';
    } else if (PHONE_CHARS_REGEX.test(cleaned) && cleaned.replace(/\D/g, '').length >= 7) {
      detectedType = 'phone';
    } else if (cleaned.includes('.')) {
      detectedType = 'url';
    }
  }

  // Type-specific normalization
  if (detectedType === 'email') {
    const lower = cleaned.toLowerCase();
    if (lower !== cleaned) {
      warnings.push('Normalized email casing to lowercase');
      cleaned = lower;
    }
  } else if (detectedType === 'url') {
    if (!/^https?:\/\//i.test(cleaned)) {
      cleaned = 'https://' + cleaned;
      warnings.push('Prepended default https:// protocol scheme');
    }
  } else if (detectedType === 'phone') {
    // Clean up excessive whitespace
    const normalizedDigits = cleaned.replace(/[^\d+]/g, '');
    if (normalizedDigits.length >= 7) {
      if (!normalizedDigits.startsWith('+')) {
        // Leave as is or format
      }
    }
  }

  return {
    original,
    sanitized: cleaned,
    detectedType,
    wasModified: original !== cleaned,
    warnings,
  };
}
