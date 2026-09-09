import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  Save,
  Sliders,
  FileSpreadsheet,
  Tag,
  ListOrdered,
  HelpCircle,
} from 'lucide-react';
import { FillConfig } from '../types';
import {
  ASSET_TYPE_DEFINITIONS,
  getDefaultConfig,
} from '../services/csvFiller';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FillConfig;
  onSaveConfig: (newConfig: FillConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'prefixes' | 'sequences' | 'defaults' | 'regex'>('prefixes');
  const [localConfig, setLocalConfig] = useState<FillConfig>(config);

  if (!isOpen) return null;

  const handlePrefixChange = (typeId: string, val: string) => {
    setLocalConfig(prev => ({
      ...prev,
      prefixes: { ...prev.prefixes, [typeId]: val },
    }));
  };

  const handleSequenceChange = (typeId: string, val: string) => {
    const num = parseInt(val, 10);
    setLocalConfig(prev => ({
      ...prev,
      assetSequences: { ...prev.assetSequences, [typeId]: isNaN(num) ? 99 : num },
    }));
  };

  const handleDefaultValueChange = (key: string, val: string) => {
    setLocalConfig(prev => ({
      ...prev,
      defaultRowValues: { ...prev.defaultRowValues, [key]: val },
    }));
  };

  const handleResetDefaults = () => {
    setLocalConfig(getDefaultConfig());
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Rules & Fill Configuration
              </h2>
              <p className="text-xs text-slate-500">
                Customize asset filename prefixes, sequence numbers, and row defaults
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

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('prefixes')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'prefixes'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Filename Prefixes</span>
          </button>
          <button
            onClick={() => setActiveTab('sequences')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sequences'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Sequences (1-9)</span>
          </button>
          <button
            onClick={() => setActiveTab('defaults')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'defaults'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Row Column Defaults</span>
          </button>
          <button
            onClick={() => setActiveTab('regex')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'regex'
                ? 'border-emerald-600 text-emerald-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Regex Pattern</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto text-xs">
          {/* TAB 1: PREFIXES */}
          {activeTab === 'prefixes' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Asset files matching <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">_CHnn_PREFIX...</code> will be classified into corresponding asset groups and display names.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ASSET_TYPE_DEFINITIONS.map((def) => {
                  const prefixVal = localConfig.prefixes[def.id] || '';
                  return (
                    <div
                      key={def.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {def.name}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Group: {def.groupName}
                        </span>
                      </div>
                      <div className="w-24">
                        <input
                          type="text"
                          value={prefixVal}
                          onChange={(e) => handlePrefixChange(def.id, e.target.value)}
                          placeholder="e.g. VID"
                          className="w-full text-center uppercase font-mono font-bold px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SEQUENCES */}
          {activeTab === 'sequences' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Fixed sequence numbers assigned to each asset type within a chapter (standard: Course Book = 1, Animation = 2, etc.):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ASSET_TYPE_DEFINITIONS.map((def) => {
                  const seqVal = localConfig.assetSequences[def.id] ?? '';
                  return (
                    <div
                      key={def.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">
                        {def.name}
                      </span>
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={seqVal}
                          onChange={(e) => handleSequenceChange(def.id, e.target.value)}
                          className="w-full text-center font-bold px-2 py-1 bg-white border border-slate-300 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DEFAULTS */}
          {activeTab === 'defaults' && (
            <div className="space-y-4">
              <p className="text-slate-600">
                Default column values populated for newly inserted chapter asset rows:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(localConfig.defaultRowValues).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <label className="font-medium text-slate-700 block text-[11px]">
                      {key}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleDefaultValueChange(key, e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: REGEX PATTERN */}
          {activeTab === 'regex' && (
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">
                  Chapter Match Regular Expression
                </label>
                <input
                  type="text"
                  value={localConfig.chapterPatternStr}
                  onChange={(e) =>
                    setLocalConfig(prev => ({ ...prev, chapterPatternStr: e.target.value }))
                  }
                  className="w-full font-mono px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 space-y-1 text-xs">
                <p className="font-semibold text-slate-800">How the expression works:</p>
                <p>
                  Default: <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">_CH(\d&#123;1,4&#125;)_(.+)$</code>
                </p>
                <p>
                  Group 1 captures the chapter number (e.g., <code className="font-mono">08</code> from <code className="font-mono">..._CH08_...</code>).
                </p>
                <p>
                  Group 2 captures the remainder of the filename containing the prefix and ordinal.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <button
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
