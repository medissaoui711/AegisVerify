import React, { useState } from 'react';
import { Language, translations } from '../i18n.ts';
import { 
  Shield, Server, Database, Lock, Cpu, CheckCircle2, ArrowRight, ArrowLeft, 
  Copy, Check, Terminal, Layers, FileCode, Flame, ShieldAlert, Sparkles, 
  FileCheck, HelpCircle, AlertOctagon, Info, AlertTriangle, ChevronRight
} from 'lucide-react';

interface ArchitectureCaseStudyProps {
  lang: Language;
}

export const ArchitectureCaseStudy: React.FC<ArchitectureCaseStudyProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'explorer' | 'star' | 'decisions' | 'limitations'>('explorer');
  const [copiedCurl, setCopiedCurl] = useState(false);

  const pipelineLayers = [
    {
      id: 'input',
      titleAr: '1. استلام المدخل الخام (Raw User Input)',
      titleEn: '1. Raw User Input & Client Layer',
      shortAr: 'المدخل الرقمي',
      shortEn: 'User Input',
      sourceFile: '/src/components/SmartInputBar.tsx',
      whatDoesItDoAr: 'يستقبل المدخل الرقمي (بريد إلكتروني، رقم هاتف، أو رابط ويب) عبر واجهة SPA تفاعلية مع التعرف التلقائي الذكي على الصيغة.',
      whatDoesItDoEn: 'Receives the raw digital entity (email, phone, or URL) via an interactive SPA with automated heuristic format detection.',
      whyExistsAr: 'تقديم تجربة استخدام سلسة وموحدة تتيح للزائر فحص أي معرف رقمي دون الحاجة للتنقل بين أدوات منفصلة.',
      whyExistsEn: 'Provides a unified interface allowing users to inspect any digital identifier without switching between disjointed tools.',
      threatPreventedAr: 'يمنع تخزين المفاتيح الحساسة أو بيانات الاعتماد في المتصفح أو Client Bundle.',
      threatPreventedEn: 'Prevents third-party API credentials and provider secrets from leaking into client-side JS bundles.',
      testExample: 'input: "http://secure-login-apple-id.update-auth.top/verify"',
    },
    {
      id: 'validation',
      titleAr: '2. فحص الهيكل الصارم (Zod Schema & Length Guard)',
      titleEn: '2. Strict Zod Schema & Length Guard',
      shortAr: 'التحقق الهيكلي',
      shortEn: 'Zod Validation',
      sourceFile: '/server/validation-schema.ts',
      whatDoesItDoAr: 'يتحقق من بنية كائن الطلب، سلامة الحقول الممررة، وفرض قيود الطول الصارمة (أقصى طول 2048 للرابط، 320 للبريد، 20 للهاتف).',
      whatDoesItDoEn: 'Validates JSON request payload structure, field types, and strict length bounds (max 2048 chars for URLs, 320 for emails).',
      whyExistsAr: 'حماية خادم Express من استهلاك الذاكرة بالحمولات المشوهة والمدخلات الضخمة (Memory Exhaustion).',
      whyExistsEn: 'Protects the Node.js event loop and backend memory from malformed payloads and oversized JSON buffer bloat.',
      threatPreventedAr: 'هجمات حجب الخدمة عبر الحمولات العملاقة (Oversized Payload DoS / Memory Bombs) والحقول غير المتوقعة.',
      threatPreventedEn: 'Malformed JSON injection, unexpected field pollution, and memory starvation DoS vectors.',
      testExample: 'VerifyRequestSchema.safeParse({ input: "a".repeat(3000) }) -> REJECTED 400',
    },
    {
      id: 'sanitization',
      titleAr: '3. التنقية وتوحيد المعايير (Sanitization & Normalization)',
      titleEn: '3. Sanitization & Canonicalization',
      shortAr: 'التنقية والتطهير',
      shortEn: 'Sanitization',
      sourceFile: '/server/sanitizer.ts',
      whatDoesItDoAr: 'يجرد المحارف الصفرية (Null Bytes \\0)، محارف الـ Zero-Width الخفية، ويوحد الـ URI والبريد إلى صيغ قياسية (Canonical Forms).',
      whatDoesItDoEn: 'Strips null bytes (\\0), zero-width characters (\\u200B), non-printable ASCII, and canonicalizes URLs/emails.',
      whyExistsAr: 'ضمان أن الفحص الأمني يتم على القيمة الحقيقية المطابقة وتفادي تجاوزات التشفير والـ Homoglyphs.',
      whyExistsEn: 'Ensures security evaluation runs on true canonical bytes and prevents encoding bypasses and homoglyph masking.',
      threatPreventedAr: 'هجمات تجاوز الفلاتر عبر Null Bytes والرموز غير المرئية وتفاوت المسافات والـ Casing.',
      threatPreventedEn: 'Filter evasion via null byte injection, hidden Unicode zero-width sequences, and casing discrepancies.',
      testExample: 'sanitizeAndDetect("sec\\u0000\\u200Bops@phish.com") -> "secops@phish.com"',
    },
    {
      id: 'ssrf',
      titleAr: '4. حارس الأمان الداخلي ومنع SSRF (SSRF & Abuse Shield)',
      titleEn: '4. SSRF & Abuse Gatekeeper',
      shortAr: 'حظر SSRF',
      shortEn: 'SSRF Policy',
      sourceFile: '/server/security-policy.ts',
      whatDoesItDoAr: 'يحظر استهداف عناوين Loopback (127.0.0.1, [::1])، شبكات RFC 1918 الخاصة، بيانات السحابة (169.254.169.254, metadata.google.internal)، وخدمات DNS Rebinding مثل nip.io.',
      whatDoesItDoEn: 'Blocks loopback, private RFC 1918 subnets, cloud IMDS metadata (169.254.169.254, metadata.google.internal), and wildcard DNS rebinding.',
      whyExistsAr: 'منع استخدام الخادم الوسيط كـ Open Proxy أو Egress Probe لاختراق البنية التحتية الداخلية وسرقة بيانات اعتماد السحابة.',
      whyExistsEn: 'Prevents AegisVerify from becoming an open proxy or an internal network reconnaissance vector for IMDS credential theft.',
      threatPreventedAr: 'ثغرات Server-Side Request Forgery (SSRF)، سرقة مفاتيح AWS/GCP Metadata، استكشاف الشبكة الداخلية، ومناورة DNS Rebinding.',
      threatPreventedEn: 'Server-Side Request Forgery (SSRF), cloud instance credential scraping, local port scanning, and wildcard DNS evasion.',
      testExample: 'validateSsrfAndAbuse("http://127.0.0.1.nip.io/admin") -> isBlocked: true (Reason: DNS Rebinding)',
    },
    {
      id: 'ratelimit',
      titleAr: '5. مُحكم معدل الطلبات (Sliding-Window Rate Limiter)',
      titleEn: '5. Sliding-Window Rate Limiter',
      shortAr: 'التحكم بالتدفق',
      shortEn: 'Rate Limiter',
      sourceFile: '/server/rate-limiter.ts',
      whatDoesItDoAr: 'يفرض سقفاً قدره 15 طلباً لكل دقيقة لكل عنوان IP مجزأ، ويرجع رمز HTTP 429 مع ترويسة Retry-After دقيقة عند التجاوز.',
      whatDoesItDoEn: 'Enforces a sliding-window ceiling of 15 requests per 60s per client IP, returning HTTP 429 and Retry-After headers.',
      whyExistsAr: 'حماية كوتا الـ APIs الخارجية من الاستنزاف العشوائي ومنع هجمات الإغراق (Brute Force / Scraping).',
      whyExistsEn: 'Protects upstream API quotas from rapid exhaustion and shields the proxy against burst floods and scraping bots.',
      threatPreventedAr: 'هجمات حجب الخدمة واستهلاك الموارد (DoS / Resource Depletion) واستنزاف ميزانية الخدمات الخارجية.',
      threatPreventedEn: 'Denial of Service (DoS), API quota bankruptcy, and automated credential stuffing runs.',
      testExample: '16 requests in a burst -> 15 passed, Request #16 returns HTTP 429 with Retry-After: 48',
    },
    {
      id: 'cache',
      titleAr: '6. ذاكرة التخزين المؤقت الذكية (24h In-Memory LRU Cache)',
      titleEn: '6. In-Memory 24-Hour LRU Cache',
      shortAr: 'الكاش الفوري',
      shortEn: 'LRU Cache',
      sourceFile: '/server/cache-manager.ts',
      whatDoesItDoAr: 'يخزن التقارير المكتملة في الذاكرة لمدة 24 ساعة بمفتاح SHA-256، ويقدم استجابات فورية في أقل من 5 مللي ثانية عند تكرار الفحص.',
      whatDoesItDoEn: 'Caches evaluated reports in-memory for 24 hours using SHA-256 keys, delivering sub-5ms instant responses on duplicate queries.',
      whyExistsAr: 'تسريع الأداء بدرجة هائلة وتوفير أكثر من 90% من استدعاءات الشبكة الخارجية للعناصر الشائعة.',
      whyExistsEn: 'Dramatically improves response latency and preserves over 90% of outbound API network calls on popular entities.',
      threatPreventedAr: 'إرهاق الشبكة الخارجية بالطلبات المتكررة، وتأخير وقت الاستجابة للمستخدم.',
      threatPreventedEn: 'External provider rate-limit triggers and latency degradation under repetitive queries.',
      testExample: '1st Request: Latency ~180ms (MISS) -> 2nd Request: Latency 2ms (HIT)',
    },
    {
      id: 'adapters',
      titleAr: '7. موصلات استخبارات التهديدات (Threat Intelligence Adapters)',
      titleEn: '7. Multi-Provider Threat Adapters',
      shortAr: 'محولات التهديد',
      shortEn: 'Threat Adapters',
      sourceFile: '/server/adapters/',
      whatDoesItDoAr: 'تجري فحوصات موازية: سجلات MX والبريد المؤقت (Mailinator/TempMail)، معايير ITU E.164، وفهارس التصيد وانتحال النطاقات (Typosquatting/VirusTotal taxonomy).',
      whatDoesItDoEn: 'Executes isolated inspections: MX DNS & burner mail lists, ITU-T E.164 carriers, and typosquatting/sandbox taxonomies.',
      whyExistsAr: 'استخراج إشارات أمنية متعددة المصادر وتغطية كافة المتجهات للبريد والهاتف والروابط دون الاعتماد على مزود واحد.',
      whyExistsEn: 'Extracts multi-vector threat signals across email, telephony, and web without single-vendor vulnerability.',
      threatPreventedAr: 'روابط التصيد الاحتيالي، الحسابات المزيفة ببريد مؤقت، والتضليل عبر أرقام VoIP غير القابلة للتتبع.',
      threatPreventedEn: 'Brand impersonation, disposable fraud accounts, and VoIP toll fraud vectors.',
      testExample: 'checkEmail("temp@mailinator.com") -> isDisposable: true, riskScore: 85',
    },
    {
      id: 'normalization',
      titleAr: '8. توحيد الاستجابة المعيارية (Response Normalization)',
      titleEn: '8. Response Normalization Layer',
      shortAr: 'توحيد الاستجابة',
      shortEn: 'Normalization',
      sourceFile: '/server/proxy-service.ts',
      whatDoesItDoAr: 'يحول مخرجات المزودين المختلفة إلى كائن JSON معياري واحد يشمل: الحالة، مؤشرات التهديد، والتوصيات وبيانات التتبع.',
      whatDoesItDoEn: 'Normalizes diverse vendor schemas into a single canonical SecurityReport JSON contract with indicators and telemetry.',
      whyExistsAr: 'عزل الواجهة الأمامية والأنظمة المستهلكة عن التغييرات أو التناقضات في هياكل استجابات المزودين الخارجيين.',
      whyExistsEn: 'Shields frontend components and downstream consumers from vendor-specific response drift and contract breakage.',
      threatPreventedAr: 'انهيار التطبيق نتيجة تغيير صيغ استجابات الـ APIs الخارجية (Vendor Lock-in & Schema Drift).',
      threatPreventedEn: 'Downstream client crashes caused by unexpected third-party API breaking schema modifications.',
      testExample: 'Output format strictly matches SecurityReport TypeScript interface across all entity types.',
    },
    {
      id: 'riskengine',
      titleAr: '9. محرك المخاطر القطعي (Deterministic Risk Engine)',
      titleEn: '9. Deterministic Risk Engine',
      shortAr: 'محرك المخاطر القطعي',
      shortEn: 'Risk Engine',
      sourceFile: '/server/proxy-service.ts',
      whatDoesItDoAr: 'يحسب درجة التهديد (0-100) والحالة الأسبوعية رياضياً وقطعياً بالاعتماد الحصري على الإشارات الموثقة، دون أي اعتماد على الذكاء الاصطناعي كحكم.',
      whatDoesItDoEn: 'Computes deterministic 0-100 threat scores mathematically and auditably, never relying on LLMs for core safety verdicts.',
      whyExistsAr: 'ضمان التوافق وقابلية التتبع بنسبة 100%؛ نفس المدخل سينتج دائماً نفس درجة التهديد القطعية.',
      whyExistsEn: 'Guarantees 100% auditable, reproducible security decisions without non-deterministic LLM hallucinations.',
      threatPreventedAr: 'أخطاء الهلوسة وقرارات الأمان غير المتوقعة (LLM Hallucinations & Non-Deterministic Security Flaws).',
      threatPreventedEn: 'Security misclassifications, prompt injection hijacking, and non-deterministic LLM false negatives.',
      testExample: 'Math.min(100, mxMissing(40) + disposable(45) + typo(20)) = 100 (Critical)',
    },
    {
      id: 'gemini',
      titleAr: '10. الاستشارة الإرشادية لـ AI SOC (Advisory Gemini SOC)',
      titleEn: '10. Advisory AI SOC Synthesis',
      shortAr: 'الاستشارة الإرشادية',
      shortEn: 'Gemini Advisory',
      sourceFile: '/server/adapters/gemini-analyst.ts',
      whatDoesItDoAr: 'يصيغ شروحات سياقية وتوصيات استجابة للحوادث بأسلوب محلل أمني (SOC Analyst) كطبقة إرشادية فقط دون تغيير النتيجة القطعية.',
      whatDoesItDoEn: 'Synthesizes contextual SOC threat summaries and incident response steps strictly as an advisory overlay.',
      whyExistsAr: 'مساعدة مسؤولي الأمن بفهم السياق الإنساني للتهديد بسرعة وتوضيح خطوات المعالجة بأسلوب احترافي.',
      whyExistsEn: 'Enables security operators to quickly digest the human context of threats and actionable containment actions.',
      threatPreventedAr: 'فشل خدمة الـ AI لا يؤثر إطلاقاً على قرار الأمان الأساسي، مع منع هجمات Prompt Injection من تزييف النتيجة.',
      threatPreventedEn: 'Prompt injection containment: AI cannot modify the deterministic status or threat score fields.',
      testExample: 'Gemini synthesizes: "Impersonates Apple Support login portal to capture iCloud 2FA credentials."',
    },
  ];

  const currentLayer = pipelineLayers[selectedLayerIndex];

  const curlExample = `curl -i -X POST http://localhost:3000/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{
    "input": "http://secure-login-apple-id.update-auth.top/account/verify",
    "type": "auto",
    "includeAiAnalysis": true
  }'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {isAr ? 'المعمارية الهندسية ودراسة الحالة (Architecture & Portfolio Case Study)' : 'System Architecture & Portfolio Case Study'}
            </h2>
            <p className="text-xs sm:text-sm text-cyan-300/80 font-sans">
              {isAr
                ? 'استعراض تفاعلي لخط الدفاع الأمني (10 طبقات)، دراسة الحالة بصيغة STAR، والقرارات الهندسية والمحددات'
                : 'Interactive 10-tier defense pipeline, STAR engineering case study, design decision rationale, and documented trade-offs'}
            </p>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'explorer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>{isAr ? 'مستكشف المعمارية التفاعلي (10 طبقات)' : 'Architecture Explorer (10 Layers)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('star')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'star'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>{isAr ? 'دراسة الحالة (STAR Case Study)' : 'STAR Case Study'}</span>
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'decisions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>{isAr ? 'القرارات الأمنية والتبرير الهندسي' : 'Security Design Decisions'}</span>
          </button>

          <button
            onClick={() => setActiveTab('limitations')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'limitations'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
            <span>{isAr ? 'المحددات والبدائل (Known Limitations)' : 'Known Limitations'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ARCHITECTURE EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-6">
          {/* Interactive Pipeline Navigation Bar */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl">
            <div className="text-xs font-bold text-slate-400 mb-3 flex items-center justify-between">
              <span>{isAr ? 'مسار معالجة الطلب (اضغط على أي طبقة لاستعراض التفاصيل البرمجية والأمنية):' : 'Request Processing Pipeline (Click any layer to inspect security mechanics):'}</span>
              <span className="text-cyan-400 font-mono text-[11px]">Layer {selectedLayerIndex + 1} of 10</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {pipelineLayers.map((layer, idx) => (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayerIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedLayerIndex === idx
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] font-mono text-cyan-400 mb-1">0{idx + 1}</div>
                  <div className="text-xs font-bold truncate">
                    {isAr ? layer.shortAr : layer.shortEn}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Layer Inspection Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-wider">
                  Tier {selectedLayerIndex + 1} Architecture Inspector
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  {isAr ? currentLayer.titleAr : currentLayer.titleEn}
                </h3>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono text-cyan-300">
                <FileCode className="h-3.5 w-3.5" />
                <span>{currentLayer.sourceFile}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: What Does It Do? */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <Info className="h-4 w-4" />
                  <span>{isAr ? 'ماذا تفعل هذه الطبقة؟ (What does it do?)' : 'What does it do?'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {isAr ? currentLayer.whatDoesItDoAr : currentLayer.whatDoesItDoEn}
                </p>
              </div>

              {/* Box 2: Why Does It Exist? */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
                  <HelpCircle className="h-4 w-4" />
                  <span>{isAr ? 'لماذا توجد في المعمارية؟ (Why does it exist?)' : 'Why does it exist?'}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  {isAr ? currentLayer.whyExistsAr : currentLayer.whyExistsEn}
                </p>
              </div>

              {/* Box 3: Threat Prevented */}
              <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                  <AlertOctagon className="h-4 w-4" />
                  <span>{isAr ? 'ما التهديد الذي تمنعه؟ (Threat Prevented)' : 'What threat does it prevent?'}</span>
                </div>
                <p className="text-xs sm:text-sm text-rose-200 leading-relaxed font-sans">
                  {isAr ? currentLayer.threatPreventedAr : currentLayer.threatPreventedEn}
                </p>
              </div>

              {/* Box 4: Test Example */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2 font-mono">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Terminal className="h-4 w-4" />
                  <span>{isAr ? 'مثال الاختبار البرمجي (Test Example / Payload)' : 'Test Example / Verification'}</span>
                </div>
                <pre className="text-xs text-amber-300/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {currentLayer.testExample}
                </pre>
              </div>
            </div>

            {/* Step navigation buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <button
                onClick={() => setSelectedLayerIndex(Math.max(0, selectedLayerIndex - 1))}
                disabled={selectedLayerIndex === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAr ? <ArrowRight className="h-3.5 w-3.5" /> : <ArrowLeft className="h-3.5 w-3.5" />}
                <span>{isAr ? 'الطبقة السابقة' : 'Previous Layer'}</span>
              </button>

              <button
                onClick={() => setSelectedLayerIndex(Math.min(pipelineLayers.length - 1, selectedLayerIndex + 1))}
                disabled={selectedLayerIndex === pipelineLayers.length - 1}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{isAr ? 'الطبقة التالية' : 'Next Layer'}</span>
                {isAr ? <ArrowLeft className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAR CASE STUDY */}
      {activeTab === 'star' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            {isAr ? 'دراسة الحالة الهندسية وفق منهجية STAR (Situation, Task, Action, Result)' : 'STAR Method Engineering Case Study'}
          </h3>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wide">
                1. Situation & Problem (المشكلة والتحدي)
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'تواجه تطبيقات الويب الحديثة مدخلات مجهولة المصدر (روابط تصيد، بريد مؤقت، وأرقام وهمية). الاستدعاء المباشر للمزودين من المتصفح يسرب مفاتيح الـ API الخاصة، يتعرض لقيود CORS، ويستهلك كوتا باهظة دون حماية من هجمات الإغراق أو هجمات SSRF.'
                  : 'Modern web applications process untrusted digital identifiers (phishing links, burner disposable emails, VoIP fraud numbers). Direct client-side calls leak private API keys, suffer CORS failures, risk quota exhaustion, and expose upstream infrastructure to SSRF.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <span className="text-xs font-bold font-mono text-blue-400 uppercase tracking-wide">
                2. Task & Engineering Goal (الهدف الهندسي)
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'هندسة وبناء خادم فحص وسيط آمن (Stateless Security API Proxy) يقوم بتنقية المدخلات، حظر كافة محاولات SSRF و DNS Rebinding، تطبيق معدل طلبات sliding-window، تخزين النتائج مؤقتاً في الذاكرة (LRU <5ms)، وتوحيد استجابات المزودين في هيكل معياري قطعي.'
                  : 'Design and implement a hardened, stateless Security API Proxy to sanitize inputs, enforce bulletproof SSRF & DNS rebinding immunity, apply sliding-window rate limiting, provide sub-5ms in-memory caching, and normalize disparate risk telemetry into a deterministic canonical schema.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wide">
                3. Action & Technical Architecture (الإجراءات والمعمارية)
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'بناء خط دفاع أمني متكامل من 10 طبقات؛ التحقق من حدود Zod (أقصى طول 2048)، تجريد المحارف الصفرية (\\0)، بناء محرك مطابقة شبكات RFC 1918 ومطابقة نطاقات DNS Rebinding في /server/security-policy.ts، عزل ذكاء Gemini الاصطناعي كطبقة إرشادية فقط، وتوفير مصفوفة تدقيق واختبار آلي من 18 فحصاً.'
                  : 'Engineered a 10-tier defense-in-depth pipeline; enforced strict Zod length boundaries, stripped null bytes, authored an RFC 1918 / IMDS / DNS rebinding policy engine in /server/security-policy.ts, decoupled the Gemini AI SOC layer as advisory-only, and constructed an 18-test automated verification matrix.'}
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/80 space-y-2">
              <span className="text-xs font-bold font-mono text-purple-400 uppercase tracking-wide">
                4. Result & Evidence (النتائج والأدلة)
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'اجتياز 18/18 اختبار أمني آلي بنسبة نجاح 100%، استرجاع الكاش الفوري في أقل من 5ms، حظر 100% من محاولات الـ SSRF والتجاوز الرقمي، استمرارية الخدمة عند تعطل المزودين (Graceful Degradation)، وانعدام تام لتسريب المفاتيح أو عناوين IP الكاملة للمستخدمين.'
                  : '100% pass rate across 18 automated security tests, sub-5ms cache hits, total mitigation of SSRF/decimal obfuscation/rebinding attacks, graceful provider failure fallback without HTTP 500 crashes, and zero API key or raw IP leakage.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY DESIGN DECISIONS */}
      {activeTab === 'decisions' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            {isAr ? 'القرارات المعمارية والأمنية وتبريرها (Security Design Decisions)' : 'Security Design Decisions & Rationale'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 font-mono">1. Why Server-Side API Proxy?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'عزل مفاتيح الـ API الحساسة بالكامل على الخادم ومنع تسريبها في حزم الـ JavaScript للعميل، وتوحيد التهديدات وحمايتها بـ Rate Limiting.'
                  : 'Completely isolates vendor API keys on the backend, preventing credential leaks in client bundles while enabling unified rate limiting.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 font-mono">2. Why Not Rely on CORS as a Security Boundary?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'CORS آلية متصفح فقط ولا تحمي الـ API من هجمات سطر الأوامر (cURL) أو هجمات الخوادم. الحماية الحقيقية تتم داخل الخادم عبر التحقق والتنقية.'
                  : 'CORS is a browser-only policy easily bypassed via cURL or backend scripts. True boundary defense requires server-side Zod and SSRF guards.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 font-mono">3. Why Deterministic Threat Scoring?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'حساب درجة التهديد رياضياً من إشارات موثقة يضمن القابلية للتدقيق والمطابقة الدائمة (Reproducibility) دون هلوسات غير متوقعة.'
                  : 'Mathematical calculation from verified threat signals ensures 100% deterministic reproducibility without unexpected hallucinations.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 font-mono">4. Why Gemini AI is Strictly Advisory?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'النماذج اللغوية عرضة لهجمات Prompt Injection ولن تكون نقطة فشل أو حكماً أمنياً نهائياً، بل تقدم تفسيراً بشرياً إرشادياً فقط.'
                  : 'LLMs are susceptible to prompt injection and non-determinism. Decoupling AI ensures core safety decisions remain invulnerable.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 font-mono">5. Why Block Private IP Ranges & Cloud IMDS?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'حماية خوادم السحابة والشبكات الداخلية من استكشاف المنافذ وسرقة بيانات اعتماد 169.254.169.254 ومنع استغلال الـ Proxy كـ Open Relay.'
                  : 'Prevents internal network reconnaissance, container metadata scraping (169.254.169.254), and open proxy abuse.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 space-y-2">
              <h4 className="text-xs font-bold text-cyan-300 font-mono">6. Why Avoid Absolute "100% Safe" Claims?</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {isAr
                  ? 'الأمن السيبراني احتمالي ويعتمد على التهديدات المعروفة؛ لا يوجد نظام يضمن الحماية من تهديدات Zero-Day أو النطاقات المسجلة حديثاً.'
                  : 'Security is probabilistic. Clean reputation only proves no known flags exist, not absolute immunity against zero-day exploits.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: KNOWN LIMITATIONS */}
      {activeTab === 'limitations' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {isAr ? 'المحددات والبدائل الهندسية (Documented Known Limitations)' : 'Documented Known Limitations & Trade-Offs'}
            </h3>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-300 font-mono">1. Instance-Local Rate Limiting (In-Memory Sliding Window):</span>
              <p className="font-sans leading-relaxed">
                {isAr
                  ? 'محددات الـ Rate Limit تعمل حالياً في ذاكرة الـ Node.js Instance المحلية. في بيئات الإنتاج الموزعة متعددة الخوادم (Multi-Instance Serverless)، يتطلب الأمر مخزناً مركزياً موزعاً مثل Redis أو Upstash.'
                  : 'The sliding-window limiter is local to the active Node.js instance. In a distributed multi-instance serverless deployment, a shared store (Redis / Upstash) would be required for global rate enforcement.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-300 font-mono">2. Instance-Local LRU Cache:</span>
              <p className="font-sans leading-relaxed">
                {isAr
                  ? 'الذاكرة المؤقتة (24h TTL) محلية لكل عملية خادم. يتم تفريغها عند إعادة تشغيل الخادم ولا تشارك بين الـ Pods المختلفة.'
                  : 'The 24h LRU cache is process-local. It purges on server restart and is not shared across horizontal scale-out replicas.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-300 font-mono">3. Browser-Local History (LocalStorage):</span>
              <p className="font-sans leading-relaxed">
                {isAr
                  ? 'سجل الفحوصات يتم تخزينه في LocalStorage لمتصفح المستخدم لتجنب الحاجة لقاعدة بيانات وحسابات مستخدمين، وهو غير مشفر بخزنة أمان (Non-Vault).'
                  : 'Verification history is stored strictly in the client browser LocalStorage to maintain a stateless backend; it is not an encrypted vault.'}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-300 font-mono">4. Zero-Day Phishing & Fresh Domains:</span>
              <p className="font-sans leading-relaxed">
                {isAr
                  ? 'تعتمد دقة الفحص على فهارس التهديدات الحالية؛ النطاقات الاحتيالية المنشأة خلال الدقائق القليلة الماضية قد تظهر كـ Clean مؤقتاً قبل إدراجها.'
                  : 'Newly registered malicious domains created within minutes of inspection may lack historical reputation telemetry prior to feed ingestion.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
