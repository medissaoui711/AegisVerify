import React from 'react';
import { SecurityReport } from '../types.ts';
import { Language, translations } from '../i18n.ts';
import { ShieldCheck, ShieldAlert, AlertOctagon, CheckCircle2, Zap, Clock, Server, Hash } from 'lucide-react';

interface SecurityScorecardProps {
  report: SecurityReport;
  lang: Language;
}

export const SecurityScorecard: React.FC<SecurityScorecardProps> = ({ report, lang }) => {
  const t = translations[lang];

  // Threat colors
  const getThreatColor = (score: number, level: string) => {
    if (level === 'critical' || score >= 75) {
      return {
        bg: 'bg-rose-950/40',
        border: 'border-rose-800/80',
        text: 'text-rose-400',
        stroke: '#f43f5e',
        badge: 'bg-rose-900/60 text-rose-200 border-rose-700',
        glow: 'shadow-rose-900/20',
        icon: AlertOctagon,
      };
    }
    if (level === 'high' || score >= 45) {
      return {
        bg: 'bg-amber-950/40',
        border: 'border-amber-800/80',
        text: 'text-amber-400',
        stroke: '#f59e0b',
        badge: 'bg-amber-900/60 text-amber-200 border-amber-700',
        glow: 'shadow-amber-900/20',
        icon: ShieldAlert,
      };
    }
    if (level === 'medium' || score >= 20) {
      return {
        bg: 'bg-yellow-950/30',
        border: 'border-yellow-800/60',
        text: 'text-yellow-400',
        stroke: '#eab308',
        badge: 'bg-yellow-900/50 text-yellow-200 border-yellow-700',
        glow: 'shadow-yellow-900/20',
        icon: ShieldAlert,
      };
    }
    return {
      bg: 'bg-emerald-950/30',
      border: 'border-emerald-800/70',
      text: 'text-emerald-400',
      stroke: '#10b981',
      badge: 'bg-emerald-900/50 text-emerald-200 border-emerald-700',
      glow: 'shadow-emerald-900/20',
      icon: CheckCircle2,
    };
  };

  const threatStyle = getThreatColor(report.threatScore, report.threatLevel);
  const StatusIcon = threatStyle.icon;

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (report.threatScore / 100) * circumference;

  return (
    <div className={`w-full rounded-2xl border ${threatStyle.border} ${threatStyle.bg} p-6 shadow-xl backdrop-blur-xl transition-all`}>
      {/* Upper Grid: Score Gauge + Threat Status + Sanitized Value */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left/Start: Summary, Type & Normalized Value */}
        <div className="flex-1 text-center md:text-start">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-900 text-slate-300 uppercase tracking-wider font-mono">
              {report.inputType}
            </span>

            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${threatStyle.badge}`}>
              {t.threatLevels[report.threatLevel]}
            </span>

            <span className="text-xs text-slate-400 font-mono">
              {t.statuses[report.status]}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-sans mb-2">
            {lang === 'ar' ? report.summary.ar : report.summary.en}
          </h2>

          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 max-w-2xl overflow-x-auto">
            <span className="text-slate-500 shrink-0">{t.cardNormalizedTarget}:</span>
            <span className="text-cyan-300 font-semibold truncate select-all">
              {report.normalizedValue}
            </span>
            {report.telemetry.sanitized && (
              <span className="text-amber-400 text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800 shrink-0">
                sanitized
              </span>
            )}
          </div>
        </div>

        {/* Right/End: Circular Threat Gauge */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative flex items-center justify-center w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-800/80"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={threatStyle.stroke}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-black font-mono tracking-tighter ${threatStyle.text} tabular-nums`}>
                {report.threatScore}
              </span>
              <span className="text-[10px] text-slate-400 font-mono -mt-1">/ 100 RISK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Strip: Latency, Cache Hit/Miss, Adapter, IP Mask */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="h-4 w-4 text-cyan-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">{t.cardExecutionLatency}</span>
            <span className="font-mono font-semibold text-slate-200 tabular-nums">
              {report.telemetry.latencyMs} ms
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Zap className={`h-4 w-4 shrink-0 ${report.telemetry.cacheHit ? 'text-emerald-400' : 'text-blue-400'}`} />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">{t.cardCacheStatus}</span>
            <span className={`font-mono font-semibold text-xs ${report.telemetry.cacheHit ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {report.telemetry.cacheHit ? t.cacheHitBadge : t.cacheMissBadge}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Server className="h-4 w-4 text-purple-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">{t.cardAdapter}</span>
            <span className="font-mono text-slate-300 truncate" title={report.telemetry.adapterUsed}>
              {report.telemetry.adapterUsed}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300">
          <Hash className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500">Rate Limit Quota</span>
            <span className="font-mono font-semibold text-slate-300 tabular-nums">
              {report.telemetry.rateLimitRemaining} req left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
