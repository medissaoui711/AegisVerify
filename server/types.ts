export type InputType = 'email' | 'phone' | 'url';
export type DetectedType = InputType | 'unknown';

export type ThreatLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical';
export type VerificationStatus = 'valid' | 'suspicious' | 'invalid' | 'malicious';

export interface ThreatIndicator {
  id: string;
  severity: 'info' | 'warning' | 'danger';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface SecurityRecommendation {
  id: string;
  actionAr: string;
  actionEn: string;
  category: 'immediate' | 'preventative' | 'technical';
}

export interface EmailDetails {
  domain: string;
  user: string;
  formatValid: boolean;
  mxFound: boolean;
  mxRecords: string[];
  isDisposable: boolean;
  isFreeMail: boolean;
  isRoleAccount: boolean;
  smtpCheck: boolean;
  didYouMean?: string | null;
  spamScore: number; // 0-100
  domainAgeEstimatedYears?: number;
}

export interface PhoneDetails {
  internationalFormat: string;
  nationalFormat: string;
  countryCode: string;
  countryName: string;
  countryIso: string;
  location: string;
  carrier: string;
  lineType: 'mobile' | 'landline' | 'voip' | 'toll_free' | 'premium_rate' | 'virtual' | 'unknown';
  isValid: boolean;
  isVoipRisk: boolean;
  fraudRiskScore: number; // 0-100
}

export interface UrlDetails {
  protocol: string;
  domain: string;
  path: string;
  query: string;
  tld: string;
  tldRisk: 'safe' | 'elevated' | 'high';
  isHttps: boolean;
  hasSsl: boolean;
  isShortened: boolean;
  ipHost: boolean;
  punycodeDomain?: string | null;
  brandImpersonationRisk: boolean;
  detectedBrand?: string | null;
  securityEngines: {
    totalEngines: number;
    malicious: number;
    suspicious: number;
    clean: number;
    engines: Array<{
      name: string;
      category: string;
      result: 'clean' | 'malicious' | 'phishing' | 'malware' | 'unrated';
    }>;
  };
}

export interface SecurityReport {
  id: string;
  timestamp: string;
  inputType: InputType;
  rawInput: string;
  normalizedValue: string;
  status: VerificationStatus;
  threatLevel: ThreatLevel;
  threatScore: number; // 0-100
  summary: {
    ar: string;
    en: string;
  };
  details: {
    email?: EmailDetails;
    phone?: PhoneDetails;
    url?: UrlDetails;
  };
  threatIndicators: ThreatIndicator[];
  recommendations: SecurityRecommendation[];
  aiAnalysis?: {
    vectorOverviewAr: string;
    vectorOverviewEn: string;
    anomalyExplanationAr: string;
    anomalyExplanationEn: string;
    technicalDeepDiveAr: string;
    technicalDeepDiveEn: string;
  };
  telemetry: {
    latencyMs: number;
    cacheHit: boolean;
    cachedAt?: string;
    adapterUsed: string;
    sanitized: boolean;
    rateLimitRemaining: number;
    ipHash: string;
  };
}

export interface VerifyRequest {
  input: string;
  type?: InputType | 'auto';
  bypassCache?: boolean;
  simulateRateLimit?: boolean;
  includeAiAnalysis?: boolean;
}

export interface CacheStats {
  totalKeys: number;
  hitCount: number;
  missCount: number;
  hitRatePercent: number;
  estimatedBandwidthSavedKb: number;
  quotaSavedCalls: number;
}
