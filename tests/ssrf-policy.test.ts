import { validateSsrfAndAbuse } from '../server/security-policy.js';

export function runSsrfPolicyTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const testCases = [
    {
      name: 'Block standard localhost loopback (127.0.0.1)',
      target: 'http://127.0.0.1/admin',
      shouldBlock: true,
    },
    {
      name: 'Block localhost string alias',
      target: 'http://localhost:8080/secrets',
      shouldBlock: true,
    },
    {
      name: 'Block AWS / GCP Cloud Metadata IMDS (169.254.169.254)',
      target: 'http://169.254.169.254/latest/meta-data/',
      shouldBlock: true,
    },
    {
      name: 'Block RFC 1918 Class A (10.0.0.1)',
      target: 'http://10.0.0.1:9000/internal',
      shouldBlock: true,
    },
    {
      name: 'Block RFC 1918 Class B (172.16.0.5)',
      target: 'http://172.16.0.5/api',
      shouldBlock: true,
    },
    {
      name: 'Block RFC 1918 Class C (192.168.1.1 router)',
      target: 'http://192.168.1.1/setup',
      shouldBlock: true,
    },
    {
      name: 'Block Wildcard DNS Rebinding Reflector (*.nip.io)',
      target: 'http://127.0.0.1.nip.io/admin',
      shouldBlock: true,
    },
    {
      name: 'Block Wildcard DNS Rebinding Reflector (*.sslip.io)',
      target: 'http://192.168.1.1.sslip.io/login',
      shouldBlock: true,
    },
    {
      name: 'Block Decimal DWORD IP Obfuscation (http://2130706433)',
      target: 'http://2130706433/etc/passwd',
      shouldBlock: true,
    },
    {
      name: 'Block IPv6 Loopback ([::1])',
      target: 'http://[::1]:3000/metrics',
      shouldBlock: true,
    },
    {
      name: 'Allow legitimate public domain (google.com)',
      target: 'https://www.google.com/search?q=security',
      shouldBlock: false,
    },
    {
      name: 'Allow legitimate public domain (github.com)',
      target: 'https://github.com/medissaoui711/AegisVerify',
      shouldBlock: false,
    },
  ];

  for (const tc of testCases) {
    const verdict = validateSsrfAndAbuse(tc.target);
    if (tc.shouldBlock) {
      if (!verdict.isBlocked) {
        results.push({ name: tc.name, passed: false, error: `Expected target to be blocked, but was allowed.` });
      } else {
        results.push({ name: tc.name, passed: true });
      }
    } else {
      if (verdict.isBlocked) {
        results.push({ name: tc.name, passed: false, error: `Expected target to be allowed, but was blocked: ${verdict.reason}` });
      } else {
        results.push({ name: tc.name, passed: true });
      }
    }
  }

  return results;
}
