import { ThreatLevel, VerificationStatus } from './types.js';

export interface ThreatIndicatorInput {
  id: string;
  category: string;
  severity: 'info' | 'warning' | 'danger' | 'critical' | 'low' | 'medium' | 'high';
  description?: string;
  confidence?: number;
}

export interface CalculatedRisk {
  score: number;
  level: ThreatLevel;
  status: VerificationStatus;
}

/**
 * Deterministic Risk Engine:
 * Computes a mathematically bounded threat score (0-100) based on weighted severity indicators.
 */
export function calculateDeterministicRiskScore(indicators: ThreatIndicatorInput[]): CalculatedRisk {
  if (!indicators || indicators.length === 0) {
    return {
      score: 0,
      level: 'safe',
      status: 'valid',
    };
  }

  let baseScore = 0;
  let hasCritical = false;
  let hasDanger = false;
  let hasWarning = false;

  for (const ind of indicators) {
    const sev = ind.severity.toLowerCase();
    if (sev === 'critical' || sev === 'danger') {
      baseScore += 50;
      hasCritical = true;
    } else if (sev === 'high' || sev === 'warning') {
      baseScore += 30;
      hasDanger = true;
    } else if (sev === 'medium') {
      baseScore += 15;
      hasWarning = true;
    } else {
      baseScore += 5;
    }
  }

  // Bound score strictly between 0 and 100
  const score = Math.min(100, Math.max(0, baseScore));

  let level: ThreatLevel = 'safe';
  let status: VerificationStatus = 'valid';

  if (score >= 80 || hasCritical) {
    level = 'critical';
    status = 'malicious';
  } else if (score >= 60 || hasDanger) {
    level = 'high';
    status = 'suspicious';
  } else if (score >= 30 || hasWarning) {
    level = 'medium';
    status = 'suspicious';
  } else if (score > 0) {
    level = 'low';
    status = 'valid';
  }

  return {
    score,
    level,
    status,
  };
}
