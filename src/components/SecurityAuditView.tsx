import React, { useState, useEffect } from 'react';
import { Language } from '../i18n.ts';
import { 
  FileCheck, RefreshCw, CheckCircle2, XCircle, Terminal, 
  Copy, Check, AlertTriangle, ShieldCheck, Bug, Zap, Globe, Lock, Cpu, Table, List
} from 'lucide-react';

interface AuditTestItem {
  id: string;
  category: string;
  nameAr: string;
  nameEn: string;
  status: 'passed' | 'failed';
  detailsAr: string;
  detailsEn: string;
  durationMs: number;
}

interface SecurityAuditReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRatePercent: number;
  overallVerdict: string;
  tests: AuditTestItem[];
}

interface SecurityAuditViewProps {
  lang: Language;
}

const ADVERSARIAL_PROBES = [
  {
    name: 'DNS Rebinding (nip.io)',
    category: 'SSRF',
    type: 'url',
    payload: 'http://127.0.0.1.nip.io/admin',
    descEn: 'Exploits wildcard DNS resolving to loopback 127.0.0.1',
    descAr: 'استغلال نطاق DNS ديناميكي يشير للمضيف المحلي 127.0.0.1',
  },
  {
    name: 'Cloud Metadata (IMDS)',
    category: 'SSRF',
    type: 'url',
    payload: 'http://169.254.169.254/computeMetadata/v1/',
    descEn: 'Attempts AWS/GCP instance metadata credential theft',
    descAr: 'محاولة سرقة بيانات اعتماد خوادم السحابة عبر عنوان IMDS',
  },
  {
    name: 'Decimal DWORD IP',
    category: 'SSRF',
    type: 'url',
    payload: 'http://2130706433/',
    descEn: 'Obfuscated integer representation of 127.0.0.1',
    descAr: 'تمثيل رقمي عشري مموه لعنوان 127.0.0.1 لتجاوز الفلاتر',
  },
  {
    name: 'UserInfo Camouflage',
    category: 'SSRF',
    type: 'url',
    payload: 'http://admin:secret@127.0.0.1:8080/dashboard',
    descEn: 'URL Authority with embedded credentials masking host',
    descAr: 'تمويه النطاق ببيانات اعتماد لتجاوز مقارنات السلاسل النصية',
  },
  {
    name: 'IPv6 Loopback & Mapped',
    category: 'SSRF',
    type: 'url',
    payload: 'http://[::ffff:127.0.0.1]:8080/',
    descEn: 'Dual-stack IPv4-mapped IPv6 loopback binding',
    descAr: 'عنوان IPv6 هجين يحمل تمثيل 127.0.0.1 داخله',
  },
  {
    name: 'URL Encoded Bypass',
    category: 'SSRF',
    type: 'url',
    payload: 'http://%31%32%37%2e%30%2e%30%2e%31:8080/',
    descEn: 'Percent-encoded ASCII characters for 127.0.0.1',
    descAr: 'تشفير أحرف 127.0.0.1 بنظام URL Encoding لتجاوز التصفية',
  },
  {
    name: 'Zero-Width & Null-Byte',
    category: 'Sanitization',
    type: 'email',
    payload: 'sec\u0000\u200Bops@phish-bypass.com',
    descEn: 'Non-printable null bytes and zero-width spaces',
    descAr: 'حقن محارف صفرية خفية ومحارف خالية لتفادي الفحص',
  },
  {
    name: 'Disposable Mail Temp',
    category: 'Email Intel',
    type: 'email',
    payload: 'target_victim@mailinator.com',
    descEn: 'High-risk burner disposable email provider',
    descAr: 'بريد مؤقت مجهول المصدر عالي الخطورة',
  },
];

const TEST_METADATA_MAP: Record<string, { attackClass: string; expected: string; expectedAr: string; engine: string }> = {
  ssrf_loopback_ipv4: { attackClass: 'SSRF / Loopback', expected: 'BLOCK (RFC 1122)', expectedAr: 'حظر فوري', engine: 'security-policy.ts' },
  ssrf_cloud_metadata_ip: { attackClass: 'Cloud IMDS Scraping', expected: 'BLOCK (169.254.169.254)', expectedAr: 'حظر نقطة السحابة', engine: 'security-policy.ts' },
  ssrf_gcp_metadata_host: { attackClass: 'Metadata FQDN', expected: 'BLOCK (metadata.google.internal)', expectedAr: 'حظر النطاق السحابي', engine: 'security-policy.ts' },
  ssrf_private_subnets: { attackClass: 'RFC 1918 Reconnaissance', expected: 'BLOCK (10.0/8, 172.16/12, 192.168/16)', expectedAr: 'حظر الشبكات الخاصة', engine: 'security-policy.ts' },
  ssrf_ipv6_loopback: { attackClass: 'IPv6 / Dual-Stack', expected: 'BLOCK ([::1], [::ffff:...])', expectedAr: 'حظر IPv6 المحلي', engine: 'security-policy.ts' },
  ssrf_decimal_obfuscated: { attackClass: 'Decimal IP Obfuscation', expected: 'DECODE & BLOCK (2130706433 -> 127.0.0.1)', expectedAr: 'فك التمويه وحظر', engine: 'security-policy.ts' },
  ssrf_dns_rebinding_nip_io: { attackClass: 'DNS Rebinding / Wildcard', expected: 'EXTRACT & BLOCK (*.nip.io)', expectedAr: 'حظر التوجيه الديناميكي', engine: 'security-policy.ts' },
  ssrf_urlencoded_host: { attackClass: 'URL-Encoded Host Bypass', expected: 'DECODE & BLOCK (%31%32%37...)', expectedAr: 'فك التشفير وحظر', engine: 'security-policy.ts' },
  ssrf_userinfo_camouflage: { attackClass: 'UserInfo Host Masking', expected: 'STRIP USERINFO & EVALUATE', expectedAr: 'عزل بيانات الدخول وحظر', engine: 'security-policy.ts' },
  ssrf_non_routable_tlds: { attackClass: 'Internal TLD Probing', expected: 'BLOCK (.internal, .local, .onion)', expectedAr: 'حظر النطاقات الداخلية', engine: 'security-policy.ts' },
  sanitization_null_zero_width: { attackClass: 'Null Byte & Unicode Evasion', expected: 'STRIP \\0 AND \\u200B', expectedAr: 'تجريد المحارف الصفرية', engine: 'sanitizer.ts' },
  zod_schema_boundaries: { attackClass: 'Oversized Payload / Bloat', expected: 'REJECT >2048 CHARS (HTTP 400)', expectedAr: 'رفض تجاوز الطول', engine: 'validation-schema.ts' },
  rate_limit_sliding_window: { attackClass: 'Rate Burst / Scraping Floods', expected: 'HTTP 429 + RETRY-AFTER HEADER', expectedAr: 'رمز 429 مع ترويسة', engine: 'rate-limiter.ts' },
  cache_hit_retrieval: { attackClass: 'Performance / Cache Evasion', expected: 'CACHE HIT (<5ms LATENCY)', expectedAr: 'استرجاع فوري <5ms', engine: 'cache-manager.ts' },
  secrets_and_pii_isolation: { attackClass: 'Secrets & PII Leakage', expected: 'ZERO API KEY IN CLIENT RESPONSE', expectedAr: 'انعدام تسريب المفاتيح', engine: 'proxy-service.ts' },
  provider_resilience_fallback: { attackClass: 'Upstream Provider Crash', expected: 'GRACEFUL DEGRADATION (NO HTTP 500)', expectedAr: 'استمرارية بدون انهيار', engine: 'proxy-service.ts' },
  ai_advisory_isolation: { attackClass: 'Prompt Injection / Hallucination', expected: 'GROUND TRUTH UNTOUCHED BY AI', expectedAr: 'عزل القرار عن الـ AI', engine: 'gemini-analyst.ts' },
  payload_boundary_defense: { attackClass: 'Malformed Payload Injection', expected: 'ZOD TYPE GUARDS ENFORCED', expectedAr: 'فرض حراس الأنواع', engine: 'validation-schema.ts' },
};

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [auditReport, setAuditReport] = useState<SecurityAuditReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'table' | 'cards' | 'sandbox' | 'curl'>('table');

  // Sandbox state
  const [customInput, setCustomInput] = useState<string>('http://127.0.0.1.nip.io/admin');
  const [customType, setCustomType] = useState<'auto' | 'email' | 'phone' | 'url'>('url');
  const [sandboxLoading, setSandboxLoading] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/audit/run');
      const data = await res.json();
      if (data.success && data.audit) {
        setAuditReport(data.audit);
      }
    } catch (e) {
      console.error('Audit run error:', e);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runAudit();
  }, []);

  const handleTestProbe = async (payload: string, type: 'auto' | 'email' | 'phone' | 'url') => {
    setCustomInput(payload);
    setCustomType(type);
    setSandboxLoading(true);
    setSandboxResult(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: payload, type, includeAiAnalysis: false }),
      });
      const data = await res.json();
      setSandboxResult({
        httpStatus: res.status,
        headers: {
          contentType: res.headers.get('content-type'),
          retryAfter: res.headers.get('retry-after'),
        },
        data,
      });
    } catch (err: any) {
      setSandboxResult({ error: err.message });
    } finally {
      setSandboxLoading(false);
    }
  };

  const categories = [
    'all', 
    'SSRF & Boundary', 
    'Rate Limiting', 
    'In-Memory Cache', 
    'Input & Zod Validation', 
    'Secrets & PII', 
    'Provider Resilience', 
    'AI Advisory Isolation'
  ];

  const filteredTests = auditReport?.tests.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.category === selectedCategory;
  });

  const curlTestSnippet = `
# 1. Test SSRF Protection against DNS Rebinding
curl -i -X POST http://localhost:3000/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{"input": "http://127.0.0.1.nip.io/admin", "type": "url"}'

# 2. Test Cloud Metadata Protection
curl -i -X POST http://localhost:3000/api/verify \\
  -H "Content-Type: application/json" \\
  -d '{"input": "http://169.254.169.254/computeMetadata/v1/", "type": "url"}'

# 3. Test Rate Limiter (Fire 16 requests in a burst)
for i in {1..16}; do
  curl -s -o /dev/null -w "Req $i: HTTP %{http_code}\\n" -X POST http://localhost:3000/api/verify \\
    -H "Content-Type: application/json" \\
    -d '{"input": "https://www.google.com", "type": "url"}'
done

# 4. Run Full Automated Audit Suite via API
curl -s http://localhost:3000/api/audit/run | jq .
`.trim();

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlTestSnippet);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-8 py-2">
      {/* Overview Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isAr ? 'مصفوفة الأدلة والتحقق الأمني (Security Evidence Matrix)' : 'Security Evidence & Verification Matrix'}
              </h2>
              <p className="text-xs sm:text-sm text-cyan-300/80 font-sans">
                {isAr
                  ? 'جدول أدلة الاختبارات الـ 18 الموثقة: متجهات الهجوم، النتيجة المتوقعة، النتيجة الفعلية، وملفات الدفاع'
                  : 'Auditable 18-test security evidence matrix: attack classes, expected behavior, actual results, and defense files'}
              </p>
            </div>
          </div>

          <button
            onClick={runAudit}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'إعادة تشغيل الـ 18 اختباراً' : 'Re-Run All 18 Verification Tests'}</span>
          </button>
        </div>

        {/* Audit Metrics Row */}
        {auditReport && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'الحالة العامة للتحصين' : 'Overall Verdict'}</div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400">
                {auditReport.overallVerdict}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'نسبة اجتياز الاختبارات' : 'Pass Rate'}</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {auditReport.successRatePercent}%
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'الاختبارات المجتازة' : 'Passed Tests'}</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {auditReport.passedTests} / {auditReport.totalTests}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <div className="text-xs text-slate-400 mb-1">{isAr ? 'توقيت آخر فحص' : 'Last Execution'}</div>
              <div className="text-xs font-mono text-slate-300 mt-2 truncate">
                {new Date(auditReport.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tabs: Table View vs Cards vs Sandbox vs cURL */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'table'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Table className="h-4 w-4" />
          <span>{isAr ? 'جدول الأدلة الموثق (Evidence Table)' : 'Security Evidence Table'}</span>
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'cards'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <List className="h-4 w-4" />
          <span>{isAr ? 'عرض البطاقات التفصيلية' : 'Detailed Cards'}</span>
        </button>

        <button
          onClick={() => setActiveTab('sandbox')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'sandbox'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="h-4 w-4" />
          <span>{isAr ? 'مختبر الهجمات التفاعلي (Adversarial Sandbox)' : 'Adversarial Attack Sandbox'}</span>
        </button>

        <button
          onClick={() => setActiveTab('curl')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeTab === 'curl'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>{isAr ? 'أوامر سطر الأوامر (External cURL Suite)' : 'External cURL Suite'}</span>
        </button>
      </div>

      {/* TAB 1: EVIDENCE TABLE VIEW */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-3.5 px-4">{isAr ? 'اسم الاختبار الأمني' : 'Test Name'}</th>
                    <th className="py-3.5 px-4">{isAr ? 'فئة الهجوم' : 'Attack Class'}</th>
                    <th className="py-3.5 px-4">{isAr ? 'السلوك المتوقع' : 'Expected Action'}</th>
                    <th className="py-3.5 px-4">{isAr ? 'النتيجة الفعلية' : 'Actual Result'}</th>
                    <th className="py-3.5 px-4">{isAr ? 'الزمن' : 'Latency'}</th>
                    <th className="py-3.5 px-4">{isAr ? 'ملف الدفاع' : 'Defense File'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditReport?.tests.map((test) => {
                    const meta = TEST_METADATA_MAP[test.id] || {
                      attackClass: test.category,
                      expected: 'PASS',
                      expectedAr: 'اجتياز',
                      engine: 'proxy-service.ts',
                    };
                    const isPass = test.status === 'passed';

                    return (
                      <tr key={test.id} className="hover:bg-slate-900/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-200">
                          {isAr ? test.nameAr : test.nameEn}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-cyan-400">
                          <span className="bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                            {meta.attackClass}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {isAr ? meta.expectedAr : meta.expected}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded text-[10px] ${
                            isPass
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {isPass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            <span>{test.status.toUpperCase()}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                          {test.durationMs}ms
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {meta.engine}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED CARDS VIEW */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? (isAr ? 'كافة الاختبارات (18)' : 'All Tests (18)') : cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredTests?.map((test) => {
              const isPass = test.status === 'passed';

              return (
                <div
                  key={test.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isPass
                      ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-900/90'
                      : 'border-rose-800/80 bg-rose-950/30'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isPass ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          {test.category}
                        </span>
                        <h4 className="text-sm font-bold text-slate-100">
                          {isAr ? test.nameAr : test.nameEn}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">
                        {isAr ? test.detailsAr : test.detailsEn}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0 font-mono text-xs">
                    <span className="text-slate-500 tabular-nums">{test.durationMs}ms</span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-bold uppercase text-[11px] ${
                        isPass
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ADVERSARIAL ATTACK SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bug className="h-4 w-4 text-cyan-400" />
                {isAr ? 'مختبر اختبار الهجمات والـ Bypass المباشر' : 'Live Adversarial Exploit Sandbox'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                {isAr
                  ? 'اختر أحد نماذج الهجمات المجهزة أو أدخل حمولتك الخاصة وافحص استجابة الـ API مباشرة في الزمن الفعلي.'
                  : 'Select an adversarial attack vector below or type a custom probe to test live server-side defenses and inspect raw JSON output.'}
              </p>
            </div>

            {/* Quick Probe Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {ADVERSARIAL_PROBES.map((probe, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTestProbe(probe.payload, probe.type as any)}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/50 hover:bg-slate-900 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-400">
                      {probe.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      {probe.category}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate mb-1">
                    {probe.payload}
                  </div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 font-sans">
                    {isAr ? probe.descAr : probe.descEn}
                  </div>
                </button>
              ))}
            </div>

            {/* Interactive Custom Test Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={isAr ? 'أدخل رابط أو بريد مشبوه للاختبار...' : 'Enter probe URL or email...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleTestProbe(customInput, customType)}
                disabled={sandboxLoading}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {sandboxLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                <span>{isAr ? 'تنفيذ الهجوم الفعلي' : 'Execute Probe'}</span>
              </button>
            </div>

            {/* Sandbox Response Viewer */}
            {sandboxResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">Response Status:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      sandboxResult.httpStatus === 200 
                        ? (sandboxResult.data?.report?.status === 'suspicious' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800')
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      HTTP {sandboxResult.httpStatus || 500}
                    </span>
                  </div>

                  {sandboxResult.data?.report?.telemetry && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>Latency: {sandboxResult.data.report.telemetry.latencyMs}ms</span>
                      <span>Cache: {sandboxResult.data.report.telemetry.cacheHit ? 'HIT' : 'MISS'}</span>
                      <span>IP: {sandboxResult.data.report.telemetry.ipHash}</span>
                    </div>
                  )}
                </div>

                <pre className="text-[11px] text-cyan-300/90 overflow-x-auto max-h-80 leading-relaxed font-mono">
                  {JSON.stringify(sandboxResult.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CURL TEST MATRIX */}
      {activeTab === 'curl' && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                {isAr ? 'أوامر سطر الأوامر (External cURL Test Suite)' : 'External cURL Command Matrix'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                {isAr
                  ? 'يمكنك تشغيل هذه الأوامر مباشرة في الطرفية (Terminal) للتحقق من الاستجابة الخارجية وسلوك الـ Rate Limiter'
                  : 'Execute these commands directly in your terminal to verify API security from outside the web UI.'}
              </p>
            </div>

            <button
              onClick={handleCopyCurl}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCurl ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الأوامر' : 'Copy Commands')}</span>
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="leading-relaxed text-cyan-300/90">{curlTestSnippet}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
