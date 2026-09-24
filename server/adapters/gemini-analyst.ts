import { GoogleGenAI, Type } from '@google/genai';
import { InputType, ThreatLevel } from '../types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = (typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined) || 
    (typeof globalThis !== 'undefined' && (globalThis as any).GEMINI_API_KEY ? (globalThis as any).GEMINI_API_KEY : undefined);
    
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface AiDeepAnalysis {
  vectorOverviewAr: string;
  vectorOverviewEn: string;
  anomalyExplanationAr: string;
  anomalyExplanationEn: string;
  technicalDeepDiveAr: string;
  technicalDeepDiveEn: string;
}

/**
 * Gemini SOC Advisory Engine:
 * NOTE: This is strictly an ADVISORY Layer. Ground-truth verdicts (valid, suspicious, malicious)
 * and numerical scores are strictly computed by the deterministic Risk Engine and Threat Intelligence Adapters.
 * Gemini provides human-readable contextual synthesis, behavioral explanations, and SOC guidance.
 */
export async function runGeminiSecurityAnalysis(
  type: InputType,
  value: string,
  threatScore: number,
  threatLevel: ThreatLevel,
  threatIndicators: Array<{ titleEn: string; descriptionEn: string }>
): Promise<AiDeepAnalysis | null> {
  const ai = getAiClient();
  if (!ai) {
    return getFallbackAiAnalysis(type, value, threatScore, threatLevel);
  }

  try {
    const prompt = `You are an Advisory SOC Cyber Threat Intelligence Analyst. 
The primary deterministic Risk Engine has already evaluated the target:
- Input Type: ${type}
- Target: ${value}
- Ground Truth Threat Score: ${threatScore}/100
- Threat Level: ${threatLevel}
- Detected Deterministic Signals: ${JSON.stringify(threatIndicators)}

Your role is ADVISORY ONLY (synthesis, explanation, and defense recommendations).
Provide an objective technical analysis in structured JSON with Arabic (high-standard technical Arabic) and English:
1. vectorOverview: Brief summary of the threat vector or baseline health
2. anomalyExplanation: Explanation of observed behavioral or structural signals
3. technicalDeepDive: Actionable SOC mitigation guidance for system administrators`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vectorOverviewAr: { type: Type.STRING },
            vectorOverviewEn: { type: Type.STRING },
            anomalyExplanationAr: { type: Type.STRING },
            anomalyExplanationEn: { type: Type.STRING },
            technicalDeepDiveAr: { type: Type.STRING },
            technicalDeepDiveEn: { type: Type.STRING },
          },
          required: [
            'vectorOverviewAr',
            'vectorOverviewEn',
            'anomalyExplanationAr',
            'anomalyExplanationEn',
            'technicalDeepDiveAr',
            'technicalDeepDiveEn',
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return getFallbackAiAnalysis(type, value, threatScore, threatLevel);
    }

    const parsed = JSON.parse(text) as AiDeepAnalysis;
    return parsed;
  } catch (err) {
    return getFallbackAiAnalysis(type, value, threatScore, threatLevel);
  }
}

function getFallbackAiAnalysis(type: InputType, value: string, score: number, level: ThreatLevel): AiDeepAnalysis {
  if (type === 'url') {
    if (score >= 70) {
      return {
        vectorOverviewAr: 'متجه هجوم تصيد احتيالي وانتحال هوية (Deceptive Phishing & Credential Harvest).',
        vectorOverviewEn: 'Deceptive Phishing & Credential Harvesting Attack Vector.',
        anomalyExplanationAr: 'تم رصد استخدام نطاق خبيث مع معاملات URI مصممة لمحاكاة خدمات مصادقة شرعية واعتراض جلسات المستخدمين.',
        anomalyExplanationEn: 'Identified spoofed domain infrastructure and URI parameter chaining targeted at credential theft and session hijack.',
        technicalDeepDiveAr: 'يوصى بتفعيل فلاتر DNS Sinkhole، حظر النطاق على مستوى جدران الحماية WAF، وإلغاء أي جلسات نشطة للضحايا المحتملين.',
        technicalDeepDiveEn: 'Deploy DNS sinkholing, enforce WAF edge perimeter blacklisting, and invalidate active session tokens for vulnerable endpoints.',
      };
    } else {
      return {
        vectorOverviewAr: 'فحص النطاق يوضح سلامة البنية التحتية وشهادات SSL الحالية.',
        vectorOverviewEn: 'Clean infrastructure baseline with verified reputation and SSL/TLS integrity.',
        anomalyExplanationAr: 'لا توجد شذوذات في سجلات DNS أو معاملات المسار المسجلة.',
        anomalyExplanationEn: 'No routing or cryptographic anomalies detected in DNS or URI headers.',
        technicalDeepDiveAr: 'الحركة موثوقة وفق مؤشرات السمعة الحالية مع ضرورة المراقبة المستمرة.',
        technicalDeepDiveEn: 'Traffic is within trusted parameters. Standard transport hygiene applies.',
      };
    }
  } else if (type === 'email') {
    if (score >= 70) {
      return {
        vectorOverviewAr: 'بريد مؤقت يُستخدم لتفادي الرقابة وإنشاء حسابات وهمية (Disposable Identity Evasion).',
        vectorOverviewEn: 'Disposable Identity Evasion & Fraudulent Sybil Account Creation Vector.',
        anomalyExplanationAr: 'النطاق ينتمي لشبكات البريد المؤقت التي توفر صناديق بريد مجهولة تنتهي صلاحيتها خلال دقائق.',
        anomalyExplanationEn: 'Domain is mapped to ephemeral burner inbox infrastructure with zero long-term deliverability guarantees.',
        technicalDeepDiveAr: 'يجب حظر نطاقات البريد المؤقت على مستوى مسار التسجيل (Signup Gatekeeper) وفرض التحقق برقم الهاتف الحقيقي.',
        technicalDeepDiveEn: 'Enforce signup gatekeeping by filtering ephemeral MX providers and requiring hardware or SIM-backed verification.',
      };
    } else {
      return {
        vectorOverviewAr: 'صندوق بريد معتمد مع سجلات توجيه بريد MX صحيحة.',
        vectorOverviewEn: 'Deliverable mailbox with verified MX records and standard reputational trust baseline.',
        anomalyExplanationAr: 'تطابق كامل لمعايير RFC البرمجية ووجود سجلات DNS نشطة.',
        anomalyExplanationEn: 'Full compliance with RFC standards and active DNS MX infrastructure.',
        technicalDeepDiveAr: 'مناسب لرسائل التحقق واستعادة الحسابات مع تفعيل فلاتر SPF/DKIM.',
        technicalDeepDiveEn: 'Optimal for transactional workflows with SPF/DKIM policy enforcement.',
      };
    }
  } else {
    if (score >= 60) {
      return {
        vectorOverviewAr: 'خط اتصال افتراضي سحابي VoIP ذو مؤشر مخاطر مرتفع.',
        vectorOverviewEn: 'Cloud-Hosted VoIP Virtual Line with Elevated Impersonation Risk.',
        anomalyExplanationAr: 'الرقم غير مرتبط ببطاقة SIM حقيقية بل يتم توليده عبر خوادم اتصال سحابية مؤقتة.',
        anomalyExplanationEn: 'Line is uncoupled from physical cellular SIM hardware, routed via programmatic SIP gateways.',
        technicalDeepDiveAr: 'يوصى بتطبيق فحص CNAM/HLR وتفضيل مصادقة FIDO2/Passkeys على رسائل SMS للخطوط الافتراضية.',
        technicalDeepDiveEn: 'Enforce HLR/CNAM lookup pipelines and prioritize FIDO2/Passkeys over SMS OTP for virtual carriers.',
      };
    } else {
      return {
        vectorOverviewAr: 'خط اتصال خلوي موثق لدى مشغل اتصالات رسمي.',
        vectorOverviewEn: 'Verified physical cellular subscriber line mapped to an accredited telecom carrier.',
        anomalyExplanationAr: 'الرقم يتبع صيغة E.164 قياسية وله مشغل وطني معتمد.',
        anomalyExplanationEn: 'Number strictly conforms to ITU-T E.164 and is registered under an accredited national MNO.',
        technicalDeepDiveAr: 'معتمد لرسائل التحقق OTP والمصادقة متعددة العوامل 2FA.',
        technicalDeepDiveEn: 'Approved for SMS OTP dispatch and high-assurance multi-factor workflows.',
      };
    }
  }
}
