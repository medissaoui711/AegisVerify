import { VerifyRequestSchema, validateInputLimits } from '../server/validation-schema.js';

export function runValidationTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Valid payload
  const valid = VerifyRequestSchema.safeParse({
    input: 'test@example.com',
    type: 'email',
    bypassCache: false,
    simulateRateLimit: false,
    includeAiAnalysis: true,
  });

  if (!valid.success) {
    results.push({ name: 'Accept valid Zod request payload', passed: false, error: 'Valid payload rejected' });
  } else {
    results.push({ name: 'Accept valid Zod request payload', passed: true });
  }

  // Reject missing input
  const missingInput = VerifyRequestSchema.safeParse({
    type: 'email',
  });

  if (missingInput.success) {
    results.push({ name: 'Reject request with missing input property', passed: false, error: 'Expected validation failure' });
  } else {
    results.push({ name: 'Reject request with missing input property', passed: true });
  }

  // Reject oversized input (>2048 chars)
  const hugeUrl = 'https://example.com/' + 'a'.repeat(3000);
  const oversized = validateInputLimits('url', hugeUrl);
  if (oversized.valid) {
    results.push({ name: 'Enforce maximum byte length boundary (2048 chars)', passed: false, error: 'Oversized payload accepted' });
  } else {
    results.push({ name: 'Enforce maximum byte length boundary (2048 chars)', passed: true });
  }

  // Reject oversized email (>320 chars)
  const hugeEmail = 'user_' + 'a'.repeat(350) + '@example.com';
  const oversizedEmail = validateInputLimits('email', hugeEmail);
  if (oversizedEmail.valid) {
    results.push({ name: 'Enforce maximum RFC email length boundary (320 chars)', passed: false, error: 'Oversized email accepted' });
  } else {
    results.push({ name: 'Enforce maximum RFC email length boundary (320 chars)', passed: true });
  }

  return results;
}
