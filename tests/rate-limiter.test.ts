import { InMemoryRateLimiter } from '../server/rate-limiter.js';

export function runRateLimiterTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Create isolated rate limiter with 3 requests per 1000ms window
  const limiter = new InMemoryRateLimiter(3, 1000);
  const testIp = '198.51.100.42';

  // Request 1: Should be allowed
  const r1 = limiter.check(testIp);
  if (!r1.allowed || r1.remaining !== 2) {
    results.push({ name: 'Allow 1st request in window', passed: false, error: `Allowed: ${r1.allowed}, remaining: ${r1.remaining}` });
  } else {
    results.push({ name: 'Allow 1st request in window', passed: true });
  }

  // Request 2: Should be allowed
  const r2 = limiter.check(testIp);
  if (!r2.allowed || r2.remaining !== 1) {
    results.push({ name: 'Allow 2nd request in window', passed: false, error: `Allowed: ${r2.allowed}, remaining: ${r2.remaining}` });
  } else {
    results.push({ name: 'Allow 2nd request in window', passed: true });
  }

  // Request 3: Should be allowed (limit reached)
  const r3 = limiter.check(testIp);
  if (!r3.allowed || r3.remaining !== 0) {
    results.push({ name: 'Allow 3rd request (max capacity)', passed: false, error: `Allowed: ${r3.allowed}, remaining: ${r3.remaining}` });
  } else {
    results.push({ name: 'Allow 3rd request (max capacity)', passed: true });
  }

  // Request 4: Must be blocked (429 Rate Limit Exceeded)
  const r4 = limiter.check(testIp);
  if (r4.allowed) {
    results.push({ name: 'Block 4th request (429 Rate limit)', passed: false, error: 'Expected request 4 to be rejected' });
  } else if (!r4.retryAfterSec || r4.retryAfterSec <= 0) {
    results.push({ name: 'Provide valid Retry-After duration', passed: false, error: `Invalid retryAfter: ${r4.retryAfterSec}` });
  } else {
    results.push({ name: 'Block 4th request (429 Rate limit)', passed: true });
    results.push({ name: 'Provide valid Retry-After duration', passed: true });
  }

  // Different IP should still be allowed
  const otherIp = '198.51.100.99';
  const rOther = limiter.check(otherIp);
  if (!rOther.allowed) {
    results.push({ name: 'Isolate rate limiting by distinct IP', passed: false, error: 'Independent IP was blocked unexpectedly' });
  } else {
    results.push({ name: 'Isolate rate limiting by distinct IP', passed: true });
  }

  return results;
}
