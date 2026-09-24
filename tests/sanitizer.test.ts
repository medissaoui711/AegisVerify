import { sanitizeAndDetect } from '../server/sanitizer.js';

export function runSanitizerTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const testCases = [
    {
      name: 'Strip null bytes (\\0) from malicious target input',
      input: 'admin@company.com\0.attacker.com',
      requestedType: 'auto' as const,
      expectedClean: 'admin@company.com.attacker.com',
      expectedType: 'email',
    },
    {
      name: 'Strip zero-width characters (\\u200B) from spoofed URLs',
      input: 'https://pay\u200Bpal.com/login',
      requestedType: 'url' as const,
      expectedClean: 'https://paypal.com/login',
      expectedType: 'url',
    },
    {
      name: 'Auto-detect email identifier correctly',
      input: 'security-lead@defense.gov.sa',
      requestedType: 'auto' as const,
      expectedType: 'email',
    },
    {
      name: 'Auto-detect international phone number correctly',
      input: '+966 50 123 4567',
      requestedType: 'auto' as const,
      expectedType: 'phone',
    },
    {
      name: 'Auto-detect web URL with protocol',
      input: 'https://example.com/path?param=1',
      requestedType: 'auto' as const,
      expectedType: 'url',
    },
    {
      name: 'Auto-detect bare domain name without protocol',
      input: 'cloudflare.com',
      requestedType: 'auto' as const,
      expectedType: 'url',
    },
  ];

  for (const tc of testCases) {
    const res = sanitizeAndDetect(tc.input, tc.requestedType);
    if (tc.expectedClean && res.sanitized !== tc.expectedClean) {
      results.push({
        name: tc.name,
        passed: false,
        error: `Expected sanitized value "${tc.expectedClean}", got "${res.sanitized}"`,
      });
    } else if (tc.expectedType && res.detectedType !== tc.expectedType) {
      results.push({
        name: tc.name,
        passed: false,
        error: `Expected detected type "${tc.expectedType}", got "${res.detectedType}"`,
      });
    } else {
      results.push({ name: tc.name, passed: true });
    }
  }

  return results;
}
