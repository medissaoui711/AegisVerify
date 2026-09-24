import { calculateDeterministicRiskScore } from '../server/risk-engine.js';
import { ThreatIndicatorInput } from '../server/risk-engine.js';

export function runRiskEngineTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  // Case 1: No indicators -> Score 0, safe, valid
  const emptyResult = calculateDeterministicRiskScore([]);
  if (emptyResult.score !== 0 || emptyResult.level !== 'safe' || emptyResult.status !== 'valid') {
    results.push({
      name: 'Calculate zero score for clean baseline without indicators',
      passed: false,
      error: `Expected 0/safe/valid, got ${emptyResult.score}/${emptyResult.level}/${emptyResult.status}`,
    });
  } else {
    results.push({ name: 'Calculate zero score for clean baseline without indicators', passed: true });
  }

  // Case 2: Critical indicator -> Score capped/calculated >= 80, critical level, malicious
  const criticalIndicators: ThreatIndicatorInput[] = [
    {
      id: 'ind-1',
      category: 'SSRF_BLOCKED',
      severity: 'critical',
      description: 'SSRF Rebinding Attempt',
      confidence: 1.0,
    },
    {
      id: 'ind-2',
      category: 'IMDS_TARGET',
      severity: 'critical',
      description: 'Cloud metadata probe',
      confidence: 1.0,
    },
  ];
  const critResult = calculateDeterministicRiskScore(criticalIndicators);
  if (critResult.score < 80 || critResult.level !== 'critical' || critResult.status !== 'malicious') {
    results.push({
      name: 'Identify critical threat level and malicious status for critical severity indicators',
      passed: false,
      error: `Expected >=80/critical/malicious, got ${critResult.score}/${critResult.level}/${critResult.status}`,
    });
  } else {
    results.push({ name: 'Identify critical threat level and malicious status for critical severity indicators', passed: true });
  }

  // Case 3: Score bounded within [0, 100] even with 10 high/critical indicators
  const manyIndicators: ThreatIndicatorInput[] = Array.from({ length: 10 }).map((_, i) => ({
    id: `ind-${i}`,
    category: 'MALICIOUS_DOMAIN',
    severity: 'critical',
    description: `Threat ${i}`,
    confidence: 1.0,
  }));
  const boundedResult = calculateDeterministicRiskScore(manyIndicators);
  if (boundedResult.score > 100 || boundedResult.score < 0) {
    results.push({
      name: 'Enforce mathematical upper bound [0-100] on risk score calculation',
      passed: false,
      error: `Score was ${boundedResult.score}, exceeding 0-100 bound`,
    });
  } else {
    results.push({ name: 'Enforce mathematical upper bound [0-100] on risk score calculation', passed: true });
  }

  return results;
}
