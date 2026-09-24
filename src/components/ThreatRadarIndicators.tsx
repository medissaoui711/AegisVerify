import React from 'react';
import { ThreatIndicator } from '../types.ts';
import { Language } from '../i18n.ts';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

interface ThreatRadarIndicatorsProps {
  indicators: ThreatIndicator[];
  lang: Language;
}

export const ThreatRadarIndicators: React.FC<ThreatRadarIndicatorsProps> = ({ indicators, lang }) => {
  const isAr = lang === 'ar';

  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 rounded-xl border border-slate-800 bg-slate-900/30">
        <Info className="h-8 w-8 text-cyan-400 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-medium">
          {isAr ? 'لم يتم رصد أي مؤشرات تهديد أمني في هذا الفحص.' : 'No threat indicators detected for this target.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {indicators.map((ind) => {
        const isDanger = ind.severity === 'danger';
        const isWarning = ind.severity === 'warning';

        return (
          <div
            key={ind.id}
            className={`p-4 rounded-xl border transition-all ${
              isDanger
                ? 'border-rose-800/80 bg-rose-950/20 text-rose-200'
                : isWarning
                ? 'border-amber-800/80 bg-amber-950/20 text-amber-200'
                : 'border-slate-800 bg-slate-900/50 text-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {isDanger ? (
                  <AlertCircle className="h-5 w-5 text-rose-400" />
                ) : isWarning ? (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                ) : (
                  <Info className="h-5 w-5 text-cyan-400" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <h4 className="text-sm font-bold tracking-tight">
                    {isAr ? ind.titleAr : ind.titleEn}
                  </h4>
                  <span
                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                      isDanger
                        ? 'bg-rose-900/60 text-rose-200 border border-rose-700'
                        : isWarning
                        ? 'bg-amber-900/60 text-amber-200 border border-amber-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {ind.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {isAr ? ind.descriptionAr : ind.descriptionEn}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
