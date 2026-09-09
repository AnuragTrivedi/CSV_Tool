import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import { DiagnosticWarning } from '../types';

interface DiagnosticsPanelProps {
  warnings: DiagnosticWarning[];
  insertedCount: number | null;
  skippedExistingCount: number | null;
  chaptersTouched: number[];
  onQuickAddPrefix?: (prefix: string) => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  warnings,
  insertedCount,
  skippedExistingCount,
  chaptersTouched,
}) => {
  const hasInserted = insertedCount !== null && insertedCount > 0;
  const hasSkipped = skippedExistingCount !== null && skippedExistingCount > 0;
  const hasZeroInsertedWarning = insertedCount !== null && insertedCount === 0;

  if (warnings.length === 0 && !hasInserted && !hasSkipped && !hasZeroInsertedWarning) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Insertion Success Banner */}
      {hasInserted && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 shadow-xs flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-emerald-900">
              Successfully Populated {insertedCount} Chapter Asset Entries!
            </h3>
            <p className="text-xs text-emerald-700 mt-1">
              New rows inserted with tag <code className="font-semibold bg-emerald-100 px-1 py-0.5 rounded text-emerald-800">recordType: NEW</code> for Chapter(s): {chaptersTouched.join(', ')}.
              {hasSkipped && ` (${skippedExistingCount} already present asset(s) were safely skipped to prevent duplicates)`}
            </p>
          </div>
        </div>
      )}

      {/* Zero inserted warning */}
      {hasZeroInsertedWarning && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-amber-900">
              0 New Rows Were Inserted
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              None of the scanned files met the insertion criteria. Check the diagnostics below to see if filenames matched existing rows or if prefixes/chapter numbers differed.
            </p>
          </div>
        </div>
      )}

      {/* Warnings & Diagnostics */}
      {warnings.map((warn, idx) => {
        const isError = warn.type === 'error';
        const isWarn = warn.type === 'warning';
        const bgClass = isError
          ? 'bg-red-50 border-red-200 text-red-900'
          : isWarn
          ? 'bg-amber-50 border-amber-200/90 text-amber-900'
          : 'bg-blue-50 border-blue-200 text-blue-900';
        const iconColor = isError
          ? 'text-red-600'
          : isWarn
          ? 'text-amber-600'
          : 'text-blue-600';

        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${bgClass} shadow-xs flex items-start gap-3`}
          >
            {isError ? (
              <AlertCircle className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
            ) : isWarn ? (
              <AlertTriangle className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
            ) : (
              <Info className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} />
            )}

            <div className="flex-1 text-xs">
              <h4 className="font-bold text-sm tracking-tight">{warn.title}</h4>
              <p className="mt-0.5 leading-relaxed">{warn.message}</p>
              {warn.items && warn.items.length > 0 && (
                <ul className="mt-2 pl-4 list-disc space-y-0.5 font-mono text-[11px] opacity-90">
                  {warn.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
