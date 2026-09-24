import React from 'react';
import { SecurityRecommendation } from '../types.ts';
import { Language } from '../i18n.ts';
import { ShieldCheck, ShieldAlert, Cpu, ArrowRight, ArrowLeft } from 'lucide-react';

interface ActionableRecommendationsProps {
  recommendations: SecurityRecommendation[];
  lang: Language;
}

export const ActionableRecommendations: React.FC<ActionableRecommendationsProps> = ({
  recommendations,
  lang,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 rounded-xl border border-slate-800 bg-slate-900/30">
        <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-medium">
          {isAr ? 'المدخل نظيف وآمن تماماً، ولا توجد توصيات إضافية مطلوبة.' : 'Target is clean. Standard security hygiene applies.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recommendations.map((rec) => {
        const isImmediate = rec.category === 'immediate';
        const isTechnical = rec.category === 'technical';

        return (
          <div
            key={rec.id}
            className="flex items-start gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 transition-colors"
          >
            <div className="mt-0.5 shrink-0">
              {isImmediate ? (
                <ShieldAlert className="h-5 w-5 text-rose-400" />
              ) : isTechnical ? (
                <Cpu className="h-5 w-5 text-purple-400" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded font-semibold ${
                    isImmediate
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                      : isTechnical
                      ? 'bg-purple-950/80 text-purple-300 border border-purple-800'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                  }`}
                >
                  {rec.category}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 leading-relaxed">
                {isAr ? rec.actionAr : rec.actionEn}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
