import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText } from 'lucide-react';

interface RawViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawCsv: string;
  onDownload: () => void;
}

export const RawViewModal: React.FC<RawViewModalProps> = ({
  isOpen,
  onClose,
  rawCsv,
  onDownload,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawCsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lineCount = rawCsv.split('\n').filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Raw CSV Export Inspector</h2>
              <p className="text-xs text-slate-500">
                {lineCount} lines • RFC 4180 compliant CSV formatting with exact header fields
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-auto bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs leading-relaxed selection:bg-emerald-500 selection:text-white">
            <pre className="whitespace-pre">{rawCsv}</pre>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Full CSV</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onDownload();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .csv</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
