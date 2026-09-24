import { runSsrfPolicyTests } from './ssrf-policy.test.js';
import { runSanitizerTests } from './sanitizer.test.js';
import { runRateLimiterTests } from './rate-limiter.test.js';
import { runRiskEngineTests } from './risk-engine.test.js';
import { runValidationTests } from './validation.test.js';
import { runCompleteSecurityAudit } from '../server/audit-suite.js';

async function main() {
  console.log('\n======================================================');
  console.log('🛡️  AegisVerify Security & Unit Test Harness v1.0.0');
  console.log('======================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function printSuiteResults(suiteName: string, results: { name: string; passed: boolean; error?: string }[]) {
    console.log(`\n📦 Suite: ${suiteName} (${results.length} tests)`);
    for (const r of results) {
      totalTests++;
      if (r.passed) {
        passedTests++;
        console.log(`  ✅ PASS: ${r.name}`);
      } else {
        failedTests++;
        console.log(`  ❌ FAIL: ${r.name}`);
        if (r.error) console.log(`     └─ Error: ${r.error}`);
      }
    }
  }

  // 1. SSRF Policy Suite
  const ssrfResults = runSsrfPolicyTests();
  printSuiteResults('SSRF & Network Boundary Protection', ssrfResults);

  // 2. Sanitizer Suite
  const sanitizerResults = runSanitizerTests();
  printSuiteResults('Sanitization & Zero-Byte Strip', sanitizerResults);

  // 3. Rate Limiter Suite
  const rateLimiterResults = runRateLimiterTests();
  printSuiteResults('Sliding-Window Rate Limiting', rateLimiterResults);

  // 4. Deterministic Risk Engine Suite
  const riskEngineResults = runRiskEngineTests();
  printSuiteResults('Deterministic Risk Scoring Engine', riskEngineResults);

  // 5. Validation Schema Suite
  const validationResults = runValidationTests();
  printSuiteResults('Zod Payload Schema & Length Guards', validationResults);

  // 6. Integrated 18-Check Security Audit Suite
  console.log('\n📦 Suite: 18-Test Integrated Security Audit Matrix');
  try {
    const audit = await runCompleteSecurityAudit();
    for (const test of audit.tests) {
      totalTests++;
      if (test.status === 'passed') {
        passedTests++;
        console.log(`  ✅ PASS [${test.category}]: ${test.nameEn} (${test.durationMs}ms)`);
      } else {
        failedTests++;
        console.log(`  ❌ FAIL [${test.category}]: ${test.nameEn}`);
      }
    }
  } catch (err: any) {
    console.error('Failed to run audit suite:', err.message);
  }

  console.log('\n======================================================');
  console.log(`🎯 Test Summary: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  if (failedTests === 0) {
    console.log('✨ All Security, Unit & Integration Tests Passed Successfully!');
    console.log('======================================================\n');
    process.exit(0);
  } else {
    console.log(`⚠️  ${failedTests} tests failed.`);
    console.log('======================================================\n');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});
