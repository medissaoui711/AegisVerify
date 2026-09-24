import React from 'react';
import { Language } from '../i18n.ts';
import { Cpu, Terminal, Shield, Sparkles } from 'lucide-react';

interface AiDeepAnalystCardProps {
  analysis?: {
    vectorOverviewAr: string;
    vectorOverviewEn: string;
    anomalyExplanationAr: string;
    anomalyExplanationEn: string;
    technicalDeepDiveAr: string;
    technicalDeepDiveEn: string;
  };
  lang: Language;
}

export const AiDeepAnalystCard: React.FC<AiDeepAnalystCardProps> = ({ analysis, lang }) => {
  const isAr = lang === 'ar';

  if (!analysis) {
    return (
      <div className="p-8 text-center text-slate-400 rounded-xl border border-slate-800 bg-slate-900/30">
        <Cpu className="h-8 w-8 text-purple-400 mx-auto mb-2 opacity-60" />
        <p className="text-sm font-medium">
          {isAr ? 'لم يتم تضمين تحليل الذكاء الاصطناعي في هذا الفحص.' : 'AI analysis was not requested or is unavailable.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-purple-900/60 bg-purple-950/20 p-5 sm:p-6 backdrop-blur-xl">
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/40">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isAr ? 'التحليل الأمني الذكي لمتجهات التهديد (Gemini SOC Engine)' : 'AI Threat Vector Intelligence (Gemini SOC Engine)'}
            </h3>
            <p className="text-xs text-purple-300/80">
              {isAr ? 'تحليل معماري وسلوكي متقدم مدعوم بنموذج gemini-3.8-flash' : 'Advanced behavioral & architectural threat modeling powered by gemini-3.8-flash'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid of 3 Analytical Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Vector Overview */}
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 mb-2 font-mono uppercase">
            <Shield className="h-3.5 w-3.5" />
            <span>{isAr ? 'متجه التهديد الرئيسي' : 'Threat Vector'}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {isAr ? analysis.vectorOverviewAr : analysis.vectorOverviewEn}
          </p>
        </div>

        {/* Pillar 2: Anomaly Explanation */}
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-2 font-mono uppercase">
            <Cpu className="h-3.5 w-3.5" />
            <span>{isAr ? 'تفسير الشذوذ السلوكي' : 'Behavioral Anomaly'}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {isAr ? analysis.anomalyExplanationAr : analysis.anomalyExplanationEn}
          </p>
        </div>

        {/* Pillar 3: Technical SOC Insights */}
        <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-2 font-mono uppercase">
            <Terminal className="h-3.5 w-3.5" />
            <span>{isAr ? 'إرشادات مهندسي SOC' : 'SOC Cyber-Defense'}</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
            {isAr ? analysis.technicalDeepDiveAr : analysis.technicalDeepDiveEn}
          </p>
        </div>
      </div>
    </div>
  );
};
