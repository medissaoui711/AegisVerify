import React from 'react';
import { Language, translations } from '../i18n.ts';
import { ShieldCheck, BookOpen, Activity, History, Globe, FileCheck, Layers } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab: 'verifier' | 'architecture' | 'audit' | 'telemetry' | 'history';
  onSelectTab: (tab: 'verifier' | 'architecture' | 'audit' | 'telemetry' | 'history') => void;
  historyCount: number;
  cacheHitCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  historyCount,
  cacheHitCount,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        {/* Zone 1: Wordmark & Branding */}
        <button
          onClick={() => onSelectTab('verifier')}
          className="flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg group shrink-0 cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight text-white font-sans">
              {t.brandName}
            </span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
              v1.0
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Tabs (Single clean segmented bar) */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800/80 rounded-xl">
          <button
            onClick={() => onSelectTab('verifier')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'verifier'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>{t.navLiveVerifier}</span>
          </button>

          <button
            onClick={() => onSelectTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.navAuditMatrix}</span>
          </button>

          <button
            onClick={() => onSelectTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'architecture'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-blue-400" />
            <span>{t.navArchitecture}</span>
          </button>

          <button
            onClick={() => onSelectTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'telemetry'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-amber-400" />
            <span>{t.navProxyInspector}</span>
            {cacheHitCount > 0 && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                {cacheHitCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="h-3.5 w-3.5 text-purple-400" />
            <span>{t.navHistory}</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Language Toggle (Clean & Single action) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900/90 border border-slate-700/80 rounded-xl hover:bg-slate-800 hover:text-white transition-all cursor-pointer shadow-sm"
            title="Toggle Language / تبديل اللغة"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-400" />
            <span>{lang === 'ar' ? 'English (LTR)' : 'العربية (RTL)'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center gap-1 px-4 py-2 bg-slate-950 border-t border-slate-850 overflow-x-auto no-scrollbar">
        <button
          onClick={() => onSelectTab('verifier')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'verifier' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <ShieldCheck className="h-3 w-3" />
          <span>{t.navLiveVerifier}</span>
        </button>

        <button
          onClick={() => onSelectTab('audit')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <FileCheck className="h-3 w-3" />
          <span>{t.navAuditMatrix}</span>
        </button>

        <button
          onClick={() => onSelectTab('architecture')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'architecture' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <Layers className="h-3 w-3" />
          <span>{t.navArchitecture}</span>
        </button>

        <button
          onClick={() => onSelectTab('telemetry')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'telemetry' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <Activity className="h-3 w-3" />
          <span>{t.navProxyInspector}</span>
        </button>

        <button
          onClick={() => onSelectTab('history')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeTab === 'history' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400'
          }`}
        >
          <History className="h-3 w-3" />
          <span>{t.navHistory}</span>
          {historyCount > 0 && <span className="text-[10px]">({historyCount})</span>}
        </button>
      </div>
    </header>
  );
};
