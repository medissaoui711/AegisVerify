import React, { useState } from 'react';
import { SecurityReport } from '../types.ts';
import { Language, translations } from '../i18n.ts';
import { History, Trash2, Download, Search, ExternalLink, RefreshCw, X, ShieldAlert, CheckCircle, AlertOctagon } from 'lucide-react';

interface HistoryDrawerProps {
  history: SecurityReport[];
  onSelectReport: (report: SecurityReport) => void;
  onClearHistory: () => void;
  lang: Language;
  onClose?: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelectReport,
  onClearHistory,
  lang,
  onClose,
}) => {
  const t = translations[lang];
  const isAr = lang === 'ar';
  const [filterType, setFilterType] = useState<'all' | 'email' | 'phone' | 'url'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = history.filter((item) => {
    const matchesType = filterType === 'all' || item.inputType === filterType;
    const matchesSearch =
      item.rawInput.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.normalizedValue.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis-security-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['Timestamp', 'Type', 'Target', 'Status', 'ThreatLevel', 'Score', 'LatencyMs', 'CacheHit'];
    const rows = history.map((item) => [
      item.timestamp,
      item.inputType,
      `"${item.normalizedValue.replace(/"/g, '""')}"`,
      item.status,
      item.threatLevel,
      item.threatScore,
      item.telemetry.latencyMs,
      item.telemetry.cacheHit ? 'YES' : 'NO',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `aegis-security-scans-${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-cyan-400">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isAr ? 'سجل الفحوصات الأمنية المحفوظ محلياً' : 'Local Verification History'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? `يتم حفظ آخر ${history.length} عمليات فحص في متصفحك (LocalStorage) دون تخزين أي بيانات حساسة على الخادم.`
                : `Stored locally in browser (LocalStorage). Zero sensitive PII logged on server.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {history.length > 0 && (
            <>
              <button
                onClick={exportToJson}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Export as JSON"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.exportJson}</span>
              </button>

              <button
                onClick={exportToCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
                title="Export as CSV"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.exportCsv}</span>
              </button>

              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 rounded-lg border border-rose-800/60 transition-colors"
                title="Clear All"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.clearHistory}</span>
              </button>
            </>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      {history.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 my-4">
          {/* Segmented Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? 'الكل' : 'All'} ({history.length})
            </button>
            <button
              onClick={() => setFilterType('email')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'email' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setFilterType('phone')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'phone' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Phone
            </button>
            <button
              onClick={() => setFilterType('url')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                filterType === 'url' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              URL
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute inset-y-0 start-0 ps-3 flex items-center h-full w-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'بحث في السجل...' : 'Search history...'}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pe-3 ps-9 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      )}

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <History className="h-10 w-10 text-slate-600 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">{t.noHistory}</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[480px] overflow-y-auto pe-1">
          {filtered.map((item) => {
            const isDanger = item.threatLevel === 'critical' || item.threatScore >= 75;
            const isWarning = item.threatLevel === 'high' || item.threatScore >= 45;

            return (
              <div
                key={item.id}
                onClick={() => onSelectReport(item)}
                className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-900 hover:border-slate-700 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    {isDanger ? (
                      <AlertOctagon className="h-5 w-5 text-rose-400" />
                    ) : isWarning ? (
                      <ShieldAlert className="h-5 w-5 text-amber-400" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-mono uppercase font-bold text-cyan-400">
                        {item.inputType}
                      </span>
                      <span className="text-slate-500 text-xs">·</span>
                      <span className="text-xs text-slate-400 font-mono tabular-nums">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                      {item.telemetry.cacheHit && (
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/80 px-1.5 rounded border border-emerald-800">
                          CACHE HIT
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-200 truncate select-all">
                      {item.normalizedValue}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <div className="text-end">
                    <div className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                      {item.threatScore} / 100
                    </div>
                    <div className={`text-[11px] font-semibold ${isDanger ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {t.threatLevels[item.threatLevel]}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 text-slate-400 group-hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title={t.viewDetails}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
