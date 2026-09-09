import React from 'react';
import {
  Download,
  Settings2,
  FileCode,
  RotateCcw,
  Sparkles,
  BookOpen,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface HeaderProps {
  totalRows: number;
  chapterCount: number;
  newRowsCount: number;
  assetFileCount: number;
  onLoadSample: () => void;
  onReset: () => void;
  onOpenConfig: () => void;
  onOpenRawView: () => void;
  onExportCsv: () => void;
  hasRows: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  totalRows,
  chapterCount,
  newRowsCount,
  assetFileCount,
  onLoadSample,
  onReset,
  onOpenConfig,
  onOpenRawView,
  onExportCsv,
  hasRows,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm ring-1 ring-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Book Asset CSV Entry Filler
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Populate missing chapter animations, course books, & activities directly into your book CSV
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          {hasRows && (
            <div className="hidden lg:flex items-center space-x-2 text-xs">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>{totalRows} rows</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-200/50">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>{chapterCount} chapters</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 font-medium border border-amber-200/50">
                <span>{assetFileCount} assets loaded</span>
              </div>
              {newRowsCount > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 animate-pulse">
                  <span>+{newRowsCount} NEW rows</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="header-load-sample-btn"
              onClick={onLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
              title="Load the user provided sample book CSV and test files"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Sample Data</span>
            </button>

            <button
              id="header-config-btn"
              onClick={onOpenConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
              title="Configure filename prefixes, sequence ordering, and default column values"
            >
              <Settings2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Rules & Prefixes</span>
            </button>

            {hasRows && (
              <>
                <button
                  id="header-raw-view-btn"
                  onClick={onOpenRawView}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer"
                  title="Inspect raw CSV content or copy to clipboard"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-600" />
                  <span className="hidden sm:inline">Raw CSV</span>
                </button>

                <button
                  id="header-reset-btn"
                  onClick={onReset}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 transition-colors border border-red-200/70 cursor-pointer"
                  title="Clear current data and start fresh"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <button
                  id="header-export-btn"
                  onClick={onExportCsv}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                  title="Download populated CSV with UTF-8 BOM"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
