import React, { useState, useEffect } from 'react';
import { InputType } from '../types.ts';
import { Language, translations } from '../i18n.ts';
import { 
  Search, Sparkles, Mail, Phone, Globe, Zap, AlertTriangle, 
  Cpu, RefreshCw, ShieldAlert, CheckCircle2, ShieldCheck, Play 
} from 'lucide-react';

interface SmartInputBarProps {
  lang: Language;
  onVerify: (input: string, type: InputType | 'auto', options: { bypassCache: boolean; simulateRateLimit: boolean; includeAi: boolean }) => void;
  isLoading: boolean;
  initialValue?: string;
}

export const SmartInputBar: React.FC<SmartInputBarProps> = ({
  lang,
  onVerify,
  isLoading,
  initialValue = '',
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';
  const [inputValue, setInputValue] = useState(initialValue);
  const [selectedMode, setSelectedMode] = useState<InputType | 'auto'>('auto');
  const [detectedType, setDetectedType] = useState<string>('auto');
  const [bypassCache, setBypassCache] = useState(false);
  const [simulateRateLimit, setSimulateRateLimit] = useState(false);
  const [includeAi, setIncludeAi] = useState(true);

  useEffect(() => {
    if (initialValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    const clean = inputValue.trim();
    if (!clean) {
      setDetectedType('empty');
      return;
    }
    if (clean.includes('@') && clean.includes('.')) {
      setDetectedType('email');
    } else if (/^(https?:\/\/|www\.)/i.test(clean) || /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}/.test(clean)) {
      setDetectedType('url');
    } else if (/^[\s\d\+\-\(\)\.]{7,}$/.test(clean) && clean.replace(/\D/g, '').length >= 7) {
      setDetectedType('phone');
    } else if (clean.includes('.')) {
      setDetectedType('url');
    } else {
      setDetectedType('unknown');
    }
  }, [inputValue]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onVerify(inputValue.trim(), selectedMode, {
      bypassCache,
      simulateRateLimit,
      includeAi,
    });
  };

  const handleApplySample = (sample: string, type: InputType | 'auto') => {
    setInputValue(sample);
    setSelectedMode(type);
    onVerify(sample, type, {
      bypassCache,
      simulateRateLimit,
      includeAi,
    });
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 sm:p-7 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl space-y-5">
      {/* Mode Selector Segmented Controls & Live Detection */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-slate-950/90 border border-slate-800/80 rounded-xl shadow-inner">
          <button
            type="button"
            onClick={() => setSelectedMode('auto')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedMode === 'auto'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.modeAuto}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('email')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedMode === 'email'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.modeEmail}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('phone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedMode === 'phone'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Phone className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.modePhone}</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMode('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedMode === 'url'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-amber-400" />
            <span>{t.modeUrl}</span>
          </button>
        </div>

        {/* Live Detection Badge */}
        {selectedMode === 'auto' && detectedType !== 'empty' && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">{isAr ? 'النوع المكتشف:' : 'Detected:'}</span>
            <span className="font-semibold text-cyan-300 uppercase px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/50">
              {detectedType}
            </span>
          </div>
        )}
      </div>

      {/* Main Input Form with Integrated Button */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-4 text-slate-500">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t.inputPlaceholder}
            dir="auto"
            maxLength={2048}
            className="w-full h-12 rounded-xl border border-slate-700/80 bg-slate-950/90 pe-4 ps-12 text-sm sm:text-base text-slate-100 placeholder-slate-500 shadow-inner outline-none transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 font-sans"
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="h-12 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin text-white" />
              <span>{t.btnVerifying}</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 text-cyan-200 fill-cyan-200" />
              <span>{t.btnVerify}</span>
            </>
          )}
        </button>
      </form>

      {/* Advanced Proxy Options Toggles */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-y-2.5 gap-x-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
            bypassCache 
              ? 'border-cyan-500/50 bg-cyan-950/30 text-cyan-300' 
              : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-300'
          }`}>
            <input
              type="checkbox"
              checked={bypassCache}
              onChange={(e) => setBypassCache(e.target.checked)}
              className="hidden"
            />
            <Zap className={`h-3.5 w-3.5 ${bypassCache ? 'text-cyan-400' : 'text-slate-500'}`} />
            <span>{t.optBypassCache}</span>
          </label>

          <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
            simulateRateLimit 
              ? 'border-amber-500/50 bg-amber-950/30 text-amber-300' 
              : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-300'
          }`}>
            <input
              type="checkbox"
              checked={simulateRateLimit}
              onChange={(e) => setSimulateRateLimit(e.target.checked)}
              className="hidden"
            />
            <AlertTriangle className={`h-3.5 w-3.5 ${simulateRateLimit ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>{t.optSimulateRateLimit}</span>
          </label>

          <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
            includeAi 
              ? 'border-purple-500/50 bg-purple-950/30 text-purple-300' 
              : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:text-slate-300'
          }`}>
            <input
              type="checkbox"
              checked={includeAi}
              onChange={(e) => setIncludeAi(e.target.checked)}
              className="hidden"
            />
            <Cpu className={`h-3.5 w-3.5 ${includeAi ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>{t.optAiAnalysis}</span>
          </label>
        </div>
      </div>

      {/* Demo Scenarios Section (Harmonious cyber chips) */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Play className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.demoScenariosTitle}</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {t.demoScenariosBadge}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleApplySample('https://www.google.com', 'url')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{t.sampleSafeDomain}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplySample('http://secure-login-apple-id.update-auth.top/account/verify?token=evil', 'url')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-rose-500/50 hover:bg-rose-950/20 hover:text-rose-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>{t.samplePhishing}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplySample('http://127.0.0.1.nip.io/admin', 'url')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-300 bg-red-950/30 border border-red-800/80 hover:bg-red-900/50 rounded-xl transition-all font-mono font-bold cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{t.sampleSsrf}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplySample('burner_user_99@mailinator.com', 'email')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-amber-950/20 hover:text-amber-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>{t.sampleDisposable}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplySample('+1 (555) 902-1204', 'phone')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:text-cyan-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>{t.sampleVoip}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplySample('support@github.com', 'email')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{t.sampleCleanEmail}</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplySample('+966 50 123 4567', 'phone')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 hover:text-emerald-300 rounded-xl transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{t.sampleSaudiMobile}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
