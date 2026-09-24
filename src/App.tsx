import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { SmartInputBar } from './components/SmartInputBar.tsx';
import { SecurityScorecard } from './components/SecurityScorecard.tsx';
import { TechnicalDetailsTab } from './components/TechnicalDetailsTab.tsx';
import { ThreatRadarIndicators } from './components/ThreatRadarIndicators.tsx';
import { ActionableRecommendations } from './components/ActionableRecommendations.tsx';
import { AiDeepAnalystCard } from './components/AiDeepAnalystCard.tsx';
import { HistoryDrawer } from './components/HistoryDrawer.tsx';
import { ArchitectureCaseStudy } from './components/ArchitectureCaseStudy.tsx';
import { CacheTelemetryModal } from './components/CacheTelemetryModal.tsx';
import { SecurityAuditView } from './components/SecurityAuditView.tsx';
import { CacheStats, InputType, SecurityReport } from './types.ts';
import { Language, translations } from './i18n.ts';
import { 
  AlertTriangle, Copy, Check, ShieldCheck, Layers, 
  ArrowRight, ArrowLeft, Info, ShieldAlert, Sparkles, Terminal 
} from 'lucide-react';

const STORAGE_KEY = 'aegis_verify_history_v1';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [activeTab, setActiveTab] = useState<'verifier' | 'architecture' | 'audit' | 'telemetry' | 'history'>('verifier');
  const [activeReportTab, setActiveReportTab] = useState<'details' | 'indicators' | 'recommendations' | 'ai' | 'json'>('details');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<SecurityReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ title: string; desc: string; retryAfter?: number } | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);

  const inputSectionRef = useRef<HTMLDivElement>(null);

  const [history, setHistory] = useState<SecurityReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to persist history in localStorage:', e);
    }
  }, [history]);

  useEffect(() => {
    if (retryCountdown === null || retryCountdown <= 0) return;
    const interval = setInterval(() => {
      setRetryCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setErrorMessage(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [retryCountdown]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const handleVerify = async (
    input: string,
    type: InputType | 'auto',
    options: { bypassCache: boolean; simulateRateLimit: boolean; includeAi: boolean }
  ) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          type,
          bypassCache: options.bypassCache,
          simulateRateLimit: options.simulateRateLimit,
          includeAiAnalysis: options.includeAi,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const isRateLimit = res.status === 429;
        const retryAfter = data.retryAfter || 45;
        if (isRateLimit) {
          setRetryCountdown(retryAfter);
        }

        setErrorMessage({
          title: lang === 'ar' ? (isRateLimit ? 'تم تجاوز حد الطلبات (429 Rate Limit)' : 'خطأ في معالجة الفحص') : (isRateLimit ? '429 Rate Limit Exceeded' : 'Verification Error'),
          desc: lang === 'ar' ? (data.errorAr || data.error || 'حدث خطأ غير متوقع') : (data.error || 'Unexpected verification failure'),
          retryAfter: isRateLimit ? retryAfter : undefined,
        });
        setIsLoading(false);
        return;
      }

      const report: SecurityReport = data.report;
      setCurrentReport(report);
      setActiveTab('verifier');

      setHistory((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== report.id && item.normalizedValue !== report.normalizedValue);
        return [report, ...withoutDuplicate].slice(0, 20);
      });
    } catch (err: any) {
      setErrorMessage({
        title: lang === 'ar' ? 'خطأ في الاتصال بالخادم الوسيط' : 'Proxy Connection Error',
        desc: lang === 'ar' ? 'تعذر الوصول إلى نقطة النهاية /api/verify. يرجى التحقق من تشغيل الخادم.' : 'Unable to connect to the backend /api/verify proxy route.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (report: SecurityReport) => {
    setCurrentReport(report);
    setActiveTab('verifier');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const handleFetchCacheStats = async (): Promise<CacheStats | null> => {
    try {
      const res = await fetch('/api/cache/stats');
      const data = await res.json();
      return data.stats;
    } catch {
      return null;
    }
  };

  const handleClearCache = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/cache/clear', { method: 'POST' });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  };

  const copyJsonPayload = () => {
    if (!currentReport) return;
    navigator.clipboard.writeText(JSON.stringify(currentReport, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const scrollToInput = () => {
    inputSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const t = translations[lang];
  const isAr = lang === 'ar';
  const cacheHitsTotal = history.filter((h) => h.telemetry.cacheHit).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      {/* Top Bar Navigation */}
      <Header
        lang={lang}
        onToggleLang={toggleLanguage}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        historyCount={history.length}
        cacheHitCount={cacheHitsTotal}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Error / Rate Limit Alert Banner */}
        {errorMessage && (
          <div className="rounded-2xl border border-rose-800/80 bg-rose-950/40 p-4 sm:p-5 flex items-start gap-3 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-rose-200">{errorMessage.title}</h4>
              <p className="text-xs sm:text-sm text-rose-300/90 mt-0.5 leading-relaxed font-sans">
                {errorMessage.desc}
              </p>
              {retryCountdown !== null && (
                <div className="mt-2 text-xs font-mono font-bold text-amber-300">
                  {isAr ? `إعادة المحاولة متاحة خلال: ${retryCountdown} ثانية` : `Retry allowed in: ${retryCountdown}s`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View 1: Live Verifier */}
        {activeTab === 'verifier' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-mono shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>{isAr ? 'خادم وسيط محصن ضد SSRF ومعزول المفاتيح' : 'Hardened SSRF-Shielded Security API Proxy'}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-sans text-balance">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  AegisVerify
                </span>
                <span className="mx-2 text-slate-500 font-light">—</span>
                <span>{t.heroTitle}</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans text-balance max-w-2xl mx-auto">
                {t.heroSubtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={scrollToInput}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>{t.ctaTry}</span>
                </button>

                <button
                  onClick={() => setActiveTab('architecture')}
                  className="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-700/80 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <span>{t.ctaArch}</span>
                </button>
              </div>
            </div>

            {/* Security Disclaimer Banner */}
            <div className="rounded-2xl border border-cyan-900/30 bg-gradient-to-r from-cyan-950/20 via-slate-950/40 to-slate-950/20 p-4 flex items-start gap-3 backdrop-blur-xl">
              <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed font-sans">
                <span className="font-bold text-slate-200 me-1">{t.disclaimerTitle}</span>
                <span>{t.disclaimerText}</span>
              </div>
            </div>

            {/* Smart Input & Demo Sandbox */}
            <div ref={inputSectionRef}>
              <SmartInputBar
                lang={lang}
                onVerify={handleVerify}
                isLoading={isLoading}
                initialValue={currentReport ? currentReport.rawInput : ''}
              />
            </div>

            {/* Results Section */}
            {currentReport && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <SecurityScorecard report={currentReport} lang={lang} />

                {/* Sub-Tabs */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6 backdrop-blur-xl space-y-6">
                  <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
                    <button
                      onClick={() => setActiveReportTab('details')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeReportTab === 'details'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.tabTechnicalDetails}
                    </button>

                    <button
                      onClick={() => setActiveReportTab('indicators')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeReportTab === 'indicators'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.tabThreatIndicators} ({currentReport.threatIndicators.length})
                    </button>

                    <button
                      onClick={() => setActiveReportTab('recommendations')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeReportTab === 'recommendations'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.tabRecommendations} ({currentReport.recommendations.length})
                    </button>

                    <button
                      onClick={() => setActiveReportTab('ai')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeReportTab === 'ai'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.tabAiDeepDive}
                    </button>

                    <button
                      onClick={() => setActiveReportTab('json')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                        activeReportTab === 'json'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.tabRawJson}
                    </button>
                  </div>

                  {activeReportTab === 'details' && (
                    <TechnicalDetailsTab report={currentReport} lang={lang} />
                  )}

                  {activeReportTab === 'indicators' && (
                    <ThreatRadarIndicators indicators={currentReport.threatIndicators} lang={lang} />
                  )}

                  {activeReportTab === 'recommendations' && (
                    <ActionableRecommendations recommendations={currentReport.recommendations} lang={lang} />
                  )}

                  {activeReportTab === 'ai' && (
                    <AiDeepAnalystCard analysis={currentReport.aiAnalysis} lang={lang} />
                  )}

                  {activeReportTab === 'json' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400">
                          {isAr ? 'هيكل استجابة JSON المعياري الموحد للمحول الوسيط:' : 'Normalized Canonical JSON Schema:'}
                        </span>
                        <button
                          onClick={copyJsonPayload}
                          className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-md border border-slate-700 cursor-pointer"
                        >
                          {copiedJson ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>{copiedJson ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ الاستجابة' : 'Copy JSON')}</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono overflow-x-auto max-h-96 selection:bg-cyan-500/30">
                        {JSON.stringify(currentReport, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* View 2: Security Audit & Hardening Matrix */}
        {activeTab === 'audit' && <SecurityAuditView lang={lang} />}

        {/* View 3: Architecture & Case Study */}
        {activeTab === 'architecture' && <ArchitectureCaseStudy lang={lang} />}

        {/* View 4: Telemetry & In-Memory Cache */}
        {activeTab === 'telemetry' && (
          <CacheTelemetryModal
            lang={lang}
            onRefreshStats={handleFetchCacheStats}
            onClearCache={handleClearCache}
          />
        )}

        {/* View 5: Local History */}
        {activeTab === 'history' && (
          <HistoryDrawer
            history={history}
            onSelectReport={handleSelectFromHistory}
            onClearHistory={handleClearHistory}
            lang={lang}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">{t.brandName}</span>
            <span className="text-slate-600">·</span>
            <span>{t.brandTagline}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-slate-400">
            <a
              href="https://aegisverify.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <span>🌐 Live Demo</span>
            </a>
            <a
              href="https://github.com/medissaoui711/AegisVerify"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-200 transition-colors"
            >
              GitHub
            </a>
            <button
              onClick={() => setActiveTab('audit')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {t.navAuditMatrix}
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {t.navArchitecture}
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {t.navProxyInspector}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {t.navHistory}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
