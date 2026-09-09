import React, { useState } from 'react';
import { X, Plus, Sparkles } from 'lucide-react';
import { CsvRow, FillConfig } from '../types';
import { ASSET_TYPE_DEFINITIONS } from '../services/csvFiller';

interface AddRowModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  chapters: Array<{ num: number; name: string }>;
  defaultChapterNum?: number;
  config: FillConfig;
  onAddRow: (row: CsvRow, targetChapterNum?: number) => void;
}

export const AddRowModal: React.FC<AddRowModalProps> = ({
  isOpen,
  onClose,
  headers,
  chapters,
  defaultChapterNum,
  config,
  onAddRow,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number | ''>(
    defaultChapterNum !== undefined ? defaultChapterNum : chapters[0]?.num ?? ''
  );
  const [rowType, setRowType] = useState('chapter_assets');
  const [selectedAssetType, setSelectedAssetType] = useState('Animation');
  const [customName, setCustomName] = useState('');
  const [sequence, setSequence] = useState('2');
  const [url, setUrl] = useState('');
  const [pageNo, setPageNo] = useState('');
  const [openInMainContent, setOpenInMainContent] = useState('FALSE');

  if (!isOpen) return null;

  const handleAssetTypeChange = (typeName: string) => {
    setSelectedAssetType(typeName);
    const def = ASSET_TYPE_DEFINITIONS.find(d => d.id === typeName);
    if (def) {
      setCustomName(def.name);
      setSequence(String(config.assetSequences[def.id] ?? 2));
      setOpenInMainContent(def.openInMainContent ? 'TRUE' : 'FALSE');
    }
  };

  const handleSave = () => {
    const typeDef = ASSET_TYPE_DEFINITIONS.find(d => d.id === selectedAssetType);
    const groupName = typeDef ? typeDef.groupName : selectedAssetType;
    const finalName = customName.trim() || selectedAssetType;

    const baseRow: CsvRow = {};
    for (const h of headers) {
      baseRow[h] = '';
    }

    const newRow: CsvRow = {
      ...baseRow,
      ...config.defaultRowValues,
      rowType: rowType,
      sequence: sequence.trim(),
      name: finalName,
      groupName: groupName,
      url: url.trim(),
      pageNo: pageNo.trim(),
      openInMainContent: openInMainContent,
      recordType: 'NEW',
    };

    onAddRow(newRow, selectedChapter !== '' ? Number(selectedChapter) : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-900 text-white">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Add New CSV Asset Entry
              </h2>
              <p className="text-xs text-slate-500">
                Manually insert a chapter asset with preset standard metadata
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

        <div className="p-4 sm:p-6 space-y-3.5 text-xs">
          {/* Target Chapter */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Target Chapter
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {chapters.map((ch) => (
                <option key={ch.num} value={ch.num}>
                  Chapter {ch.num}: {ch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Asset Type preset */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              Asset Category Preset
            </label>
            <select
              value={selectedAssetType}
              onChange={(e) => handleAssetTypeChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {ASSET_TYPE_DEFINITIONS.map((def) => (
                <option key={def.id} value={def.id}>
                  {def.name} ({def.groupName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Display Name */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Asset Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Animation - 1"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Sequence */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Sequence Order
              </label>
              <input
                type="number"
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* URL / Filename */}
          <div>
            <label className="font-semibold text-slate-800 block mb-1">
              File URL / Filename
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. MathsWiz2026_Class8_CH09_VID01.mp4"
              className="w-full font-mono px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Page No */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Page No (Optional)
              </label>
              <input
                type="text"
                value={pageNo}
                onChange={(e) => setPageNo(e.target.value)}
                placeholder="e.g. 1,2 or 45"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Open In Main Content */}
            <div>
              <label className="font-semibold text-slate-800 block mb-1">
                Open In Main Content
              </label>
              <select
                value={openInMainContent}
                onChange={(e) => setOpenInMainContent(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="FALSE">FALSE</option>
                <option value="TRUE">TRUE</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end gap-2">
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Insert Row</span>
          </button>
        </div>
      </div>
    </div>
  );
};
