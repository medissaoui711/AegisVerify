import React from 'react';
import { SecurityReport } from '../types.ts';
import { Language } from '../i18n.ts';
import { Mail, Phone, Globe, CheckCircle, XCircle, AlertTriangle, Shield, Server, Lock, ExternalLink } from 'lucide-react';

interface TechnicalDetailsTabProps {
  report: SecurityReport;
  lang: Language;
}

export const TechnicalDetailsTab: React.FC<TechnicalDetailsTabProps> = ({ report, lang }) => {
  const isAr = lang === 'ar';
  const { inputType, details } = report;

  return (
    <div className="space-y-6">
      {/* Email Technical Details */}
      {inputType === 'email' && details.email && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Format Validity */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'صحة صياغة RFC' : 'RFC Format Syntax'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.email.formatValid ? (isAr ? 'صالح ومطابق للمعايير' : 'Valid RFC 5322') : (isAr ? 'غير مطابق' : 'Invalid Syntax')}
                </div>
              </div>
              {details.email.formatValid ? (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400" />
              )}
            </div>

            {/* Disposable Mail Flag */}
            <div className={`p-3.5 rounded-xl border ${details.email.isDisposable ? 'border-rose-800/80 bg-rose-950/20' : 'border-slate-800 bg-slate-900/50'} flex items-start justify-between`}>
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'كشف البريد المؤقت' : 'Disposable Burner Check'}</div>
                <div className={`text-sm font-semibold ${details.email.isDisposable ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {details.email.isDisposable ? (isAr ? 'بريد مؤقت (مرفوض)' : 'Disposable (Blocked)') : (isAr ? 'بريد دائم ومستقر' : 'Permanent Mailbox')}
                </div>
              </div>
              {details.email.isDisposable ? (
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )}
            </div>

            {/* MX Records State */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'سجلات MX للبريد' : 'DNS MX Records'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.email.mxFound ? (isAr ? 'سجلات MX نشطة' : 'Active MX Published') : (isAr ? 'مفقودة (تعذر التسليم)' : 'No MX Found')}
                </div>
              </div>
              {details.email.mxFound ? (
                <Server className="h-5 w-5 text-cyan-400" />
              ) : (
                <XCircle className="h-5 w-5 text-rose-400" />
              )}
            </div>

            {/* Free Mail Provider */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'نوع المزود' : 'Mail Provider Type'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.email.isFreeMail ? (isAr ? 'مزود مجاني عام (Gmail/Outlook)' : 'Free Webmail') : (isAr ? 'نطاق خاص / مؤسسي' : 'Custom Corporate Domain')}
                </div>
              </div>
              <Mail className="h-5 w-5 text-blue-400" />
            </div>

            {/* Role Account */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'حساب وظيفي عام' : 'Role-Based Inbox'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.email.isRoleAccount ? (isAr ? 'نعم (مثل admin/support)' : 'Yes (Shared Role)') : (isAr ? 'حساب شخصي فردي' : 'Individual Inbox')}
                </div>
              </div>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>

            {/* Spam Risk Index */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'مؤشر احتمالية السبام' : 'Spam Probability'}</div>
                <div className="text-sm font-semibold font-mono text-cyan-400 tabular-nums">
                  {details.email.spamScore} / 100
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                %{details.email.spamScore}
              </div>
            </div>
          </div>

          {/* MX Records List */}
          {details.email.mxRecords && details.email.mxRecords.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
              <h4 className="text-xs font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider">
                {isAr ? 'سجلات توجيه البريد المسجلة (MX Records):' : 'Resolved Mail Exchange (MX) DNS Records:'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {details.email.mxRecords.map((mx, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 rounded-md flex items-center gap-1.5"
                  >
                    <Server className="h-3 w-3 text-cyan-400" />
                    {mx}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Typo Suggestion Alert */}
          {details.email.didYouMean && (
            <div className="p-4 rounded-xl border border-amber-800/80 bg-amber-950/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-amber-300">
                    {isAr ? 'اقتراح تصحيح النطاق (Did You Mean)' : 'Domain Correction Suggestion'}
                  </div>
                  <div className="text-sm text-slate-300">
                    {isAr ? 'يبدو أنك تقصد العنوان التالي:' : 'Target domain looks like a typo for:'}{' '}
                    <span className="font-mono text-amber-300 font-semibold">{details.email.didYouMean}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Phone Technical Details */}
      {inputType === 'phone' && details.phone && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* International E.164 */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'الصيغة الدولية E.164' : 'E.164 Canonical'}</div>
                <div className="text-sm font-semibold font-mono text-cyan-300">
                  {details.phone.internationalFormat}
                </div>
              </div>
              <Phone className="h-5 w-5 text-cyan-400" />
            </div>

            {/* Country & Location */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'الدولة ورمز ISO' : 'Country & ISO Code'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.phone.countryName} ({details.phone.countryIso})
                </div>
              </div>
              <Globe className="h-5 w-5 text-emerald-400" />
            </div>

            {/* Carrier Network */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'شبكة المشغل (Carrier)' : 'Telecom Carrier'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.phone.carrier}
                </div>
              </div>
              <Server className="h-5 w-5 text-blue-400" />
            </div>

            {/* Line Type */}
            <div className={`p-3.5 rounded-xl border ${details.phone.isVoipRisk ? 'border-amber-800/80 bg-amber-950/20' : 'border-slate-800 bg-slate-900/50'} flex items-start justify-between`}>
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'نوع خط الاتصال' : 'Line Classification'}</div>
                <div className={`text-sm font-semibold capitalize ${details.phone.isVoipRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {details.phone.lineType === 'voip'
                    ? (isAr ? 'خط افتراضي سحابي (VoIP)' : 'Virtual VoIP Line')
                    : details.phone.lineType === 'mobile'
                    ? (isAr ? 'هاتف خلوي (SIM Mobile)' : 'Mobile Cellular')
                    : details.phone.lineType}
                </div>
              </div>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>

            {/* VoIP Burner Risk */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'مخاطر الأرقام الوهمية' : 'VoIP Burner Risk'}</div>
                <div className={`text-sm font-semibold ${details.phone.isVoipRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {details.phone.isVoipRisk ? (isAr ? 'مخاطر مرتفعة (خط افتراضي)' : 'High Burner Risk') : (isAr ? 'منخفضة (خط SIM حقيقي)' : 'Low Risk SIM')}
                </div>
              </div>
              {details.phone.isVoipRisk ? (
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )}
            </div>

            {/* Fraud Risk Score */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'مؤشر مخاطر الاحتيال' : 'Telecom Fraud Score'}</div>
                <div className="text-sm font-semibold font-mono text-cyan-400 tabular-nums">
                  {details.phone.fraudRiskScore} / 100
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-300">
                %{details.phone.fraudRiskScore}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* URL Technical Details */}
      {inputType === 'url' && details.url && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Protocol & SSL */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'بروتوكول التشفير' : 'Protocol & SSL/TLS'}</div>
                <div className={`text-sm font-semibold font-mono ${details.url.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {details.url.protocol.toUpperCase()} {details.url.isHttps ? '· TLS Encrypted' : '· Plaintext HTTP'}
                </div>
              </div>
              {details.url.isHttps ? (
                <Lock className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              )}
            </div>

            {/* TLD & Extension Risk */}
            <div className={`p-3.5 rounded-xl border ${details.url.tldRisk === 'high' ? 'border-rose-800/80 bg-rose-950/20' : 'border-slate-800 bg-slate-900/50'} flex items-start justify-between`}>
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'امتداد النطاق (TLD)' : 'Top-Level Domain (TLD)'}</div>
                <div className="text-sm font-semibold font-mono text-slate-200">
                  .{details.url.tld} ({details.url.tldRisk.toUpperCase()} RISK)
                </div>
              </div>
              <Globe className="h-5 w-5 text-cyan-400" />
            </div>

            {/* Brand Impersonation */}
            <div className={`p-3.5 rounded-xl border ${details.url.brandImpersonationRisk ? 'border-rose-800/80 bg-rose-950/20' : 'border-slate-800 bg-slate-900/50'} flex items-start justify-between`}>
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'اشتباه انتحال علامة' : 'Brand Spoofing Flag'}</div>
                <div className={`text-sm font-semibold ${details.url.brandImpersonationRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {details.url.brandImpersonationRisk
                    ? `${isAr ? 'انتحال مرصود:' : 'Target:'} ${details.url.detectedBrand}`
                    : (isAr ? 'لا يوجد انتحال' : 'Clean / Legitimate')}
                </div>
              </div>
              {details.url.brandImpersonationRisk ? (
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              )}
            </div>

            {/* Shortened URL */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'خدمة تقصير روابط' : 'URL Shortener Cloak'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.url.isShortened ? (isAr ? 'رابط مختصر (مخفي الوجهة)' : 'Shortened Redirect') : (isAr ? 'رابط كامل مباشر' : 'Direct Full URI')}
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-blue-400" />
            </div>

            {/* Raw IP Host */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'استضافة بعنوان IP مباشر' : 'Raw IP Host Header'}</div>
                <div className="text-sm font-semibold text-slate-200">
                  {details.url.ipHost ? (isAr ? 'نعم (تخطي DNS مشبوه)' : 'Yes (Direct IP)') : (isAr ? 'اسم نطاق معتمد (FQDN)' : 'Resolved FQDN Domain')}
                </div>
              </div>
              <Server className="h-5 w-5 text-purple-400" />
            </div>

            {/* Multi-Engine Detection Ratio */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 flex items-start justify-between">
              <div>
                <div className="text-xs text-slate-400 mb-1">{isAr ? 'نسبة رصد محركات الأمان' : 'Engine Detections'}</div>
                <div className="text-sm font-semibold font-mono text-cyan-400 tabular-nums">
                  {details.url.securityEngines.malicious + details.url.securityEngines.suspicious} / {details.url.securityEngines.totalEngines} engines
                </div>
              </div>
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
          </div>

          {/* Security Engines Grid */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70">
            <h4 className="text-xs font-semibold text-slate-400 mb-3 font-mono uppercase tracking-wider">
              {isAr ? 'نتائج مسح محركات الأمان والفهارس الدولية:' : 'Multi-Engine Threat Intelligence Scanners:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {details.url.securityEngines.engines.map((eng, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/40 text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">{eng.name}</span>
                    <span className="text-[10px] text-slate-500">{eng.category}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase ${
                      eng.result === 'clean'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                        : eng.result === 'unrated'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-rose-950/60 text-rose-300 border border-rose-800'
                    }`}
                  >
                    {eng.result}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
