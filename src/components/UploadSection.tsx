import React, { useRef, useState } from 'react';
import {
  Upload,
  FolderUp,
  FileText,
  ListPlus,
  CheckCircle2,
  AlertTriangle,
  Play,
  Trash2,
  Info,
} from 'lucide-react';
import { FileItemInput } from '../services/csvFiller';

interface UploadSectionProps {
  csvFilename: string;
  hasCsv: boolean;
  csvRowCount: number;
  csvChapterCount: number;
  missingRequiredColumns: string[];
  assetFiles: FileItemInput[];
  onCsvFileLoaded: (content: string, filename: string) => void;
  onAssetFilesChanged: (files: FileItemInput[]) => void;
  onRunPopulate: () => void;
  canPopulate: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  csvFilename,
  hasCsv,
  csvRowCount,
  csvChapterCount,
  missingRequiredColumns,
  assetFiles,
  onCsvFileLoaded,
  onAssetFilesChanged,
  onRunPopulate,
  canPopulate,
}) => {
  const [csvInputMode, setCsvInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedCsv, setPastedCsv] = useState('');
  const [assetInputMode, setAssetInputMode] = useState<'folder' | 'files' | 'paste'>('files');
  const [pastedAssetNames, setPastedAssetNames] = useState('');
  const [isCsvDragging, setIsCsvDragging] = useState(false);
  const [isAssetsDragging, setIsAssetsDragging] = useState(false);

  const csvFileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const filesInputRef = useRef<HTMLInputElement | null>(null);

  // Handle CSV file read
  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      onCsvFileLoaded(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleCsvPasteSubmit = () => {
    if (!pastedCsv.trim()) return;
    onCsvFileLoaded(pastedCsv, 'pasted_data.csv');
  };

  // Handle files
  const handleFilesAdded = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const newItems: FileItemInput[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      newItems.push({ name: f.name, size: f.size });
    }
    // Merge without duplicates by name
    const existingNames = new Set(assetFiles.map(a => a.name.toLowerCase()));
    const filtered = newItems.filter(item => !existingNames.has(item.name.toLowerCase()));
    onAssetFilesChanged([...assetFiles, ...filtered]);
  };

  const handlePastedAssetSubmit = () => {
    if (!pastedAssetNames.trim()) return;
    const lines = pastedAssetNames
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const existingNames = new Set(assetFiles.map(a => a.name.toLowerCase()));
    const newItems: FileItemInput[] = [];

    for (const line of lines) {
      // Clean quotes or paths if user pasted full path like "C:/assets/Maths_CH08_VID01.mp4"
      const cleaned = line.replace(/^[\\/"]+|[\\/"]+$/g, '').split(/[/\\]/).pop() || line;
      if (cleaned && !existingNames.has(cleaned.toLowerCase())) {
        newItems.push({ name: cleaned });
        existingNames.add(cleaned.toLowerCase());
      }
    }

    onAssetFilesChanged([...assetFiles, ...newItems]);
    setPastedAssetNames('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: SOURCE CSV */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                1
              </span>
              <h2 className="text-sm font-semibold text-slate-900">
                Source Book CSV File
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                id="csv-mode-upload-tab"
                onClick={() => setCsvInputMode('upload')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  csvInputMode === 'upload'
                    ? 'bg-slate-100 font-semibold text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Upload File
              </button>
              <button
                id="csv-mode-paste-tab"
                onClick={() => setCsvInputMode('paste')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  csvInputMode === 'paste'
                    ? 'bg-slate-100 font-semibold text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Paste CSV
              </button>
            </div>
          </div>

          {/* CSV Input Area */}
          {csvInputMode === 'upload' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsCsvDragging(true);
              }}
              onDragLeave={() => setIsCsvDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsCsvDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleCsvFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => csvFileInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isCsvDragging
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : hasCsv
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={csvFileInputRef}
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCsvFile(e.target.files[0]);
                  }
                }}
              />
              <Upload className={`w-8 h-8 mb-2 ${hasCsv ? 'text-emerald-600' : 'text-slate-400'}`} />
              {hasCsv ? (
                <div>
                  <p className="text-sm font-semibold text-slate-900 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{csvFilename}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {csvRowCount} rows • {csvChapterCount} chapters recognized
                  </p>
                  <p className="text-xs text-emerald-700 font-medium mt-2 underline">
                    Click to replace file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Click or drag & drop CSV file
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Accepts existing book asset CSV (must contain chapter rows)
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <textarea
                value={pastedCsv}
                onChange={(e) => setPastedCsv(e.target.value)}
                placeholder="Paste CSV contents with header row..."
                className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
              />
              <button
                onClick={handleCsvPasteSubmit}
                disabled={!pastedCsv.trim()}
                className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Load Pasted CSV
              </button>
            </div>
          )}

          {/* Missing columns warning */}
          {missingRequiredColumns.length > 0 && (
            <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Missing standard column headers:</span>{' '}
                {missingRequiredColumns.join(', ')}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ASSET FILES */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold">
                2
              </span>
              <h2 className="text-sm font-semibold text-slate-900">
                Chapter Asset Files
              </h2>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <button
                id="asset-mode-folder-tab"
                onClick={() => setAssetInputMode('folder')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  assetInputMode === 'folder'
                    ? 'bg-slate-100 font-semibold text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Select a local asset directory"
              >
                Folder
              </button>
              <button
                id="asset-mode-files-tab"
                onClick={() => setAssetInputMode('files')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  assetInputMode === 'files'
                    ? 'bg-slate-100 font-semibold text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Files
              </button>
              <button
                id="asset-mode-paste-tab"
                onClick={() => setAssetInputMode('paste')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  assetInputMode === 'paste'
                    ? 'bg-slate-100 font-semibold text-slate-800'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Paste List
              </button>
            </div>
          </div>

          {/* Folder input */}
          {assetInputMode === 'folder' && (
            <div
              onClick={() => folderInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-50/50 transition-all"
            >
              <input
                type="file"
                ref={folderInputRef}
                {...{ webkitdirectory: '', directory: '' }}
                multiple
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
              <FolderUp className="w-8 h-8 mb-2 text-indigo-500" />
              <p className="text-sm font-medium text-slate-800">
                Choose Asset Directory
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Reads all asset files matching `_CHnn_` inside the selected folder
              </p>
            </div>
          )}

          {/* Files select / drag and drop */}
          {assetInputMode === 'files' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsAssetsDragging(true);
              }}
              onDragLeave={() => setIsAssetsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsAssetsDragging(false);
                handleFilesAdded(e.dataTransfer.files);
              }}
              onClick={() => filesInputRef.current?.click()}
              className={`flex-1 border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isAssetsDragging
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={filesInputRef}
                multiple
                className="hidden"
                onChange={(e) => handleFilesAdded(e.target.files)}
              />
              <FileText className="w-8 h-8 mb-2 text-indigo-500" />
              <p className="text-sm font-medium text-slate-800">
                Select or drop multiple asset files
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Select animations, PDFs, workbooks, solutions, or ZIP files
              </p>
            </div>
          )}

          {/* Paste filenames */}
          {assetInputMode === 'paste' && (
            <div className="flex-1 flex flex-col">
              <textarea
                value={pastedAssetNames}
                onChange={(e) => setPastedAssetNames(e.target.value)}
                placeholder="Paste filenames (one per line):&#10;Math_Class8_CH08_VID04.mp4&#10;Math_Class8_CH09_CB_01.pdf&#10;Math_Class8_CH09_TM_01.pdf"
                className="w-full h-32 p-3 text-xs font-mono border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden resize-none"
              />
              <button
                onClick={handlePastedAssetSubmit}
                disabled={!pastedAssetNames.trim()}
                className="mt-2 w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Add Pasted Filenames
              </button>
            </div>
          )}

          {/* Asset count & clear badge */}
          {assetFiles.length > 0 && (
            <div className="mt-3 flex items-center justify-between px-3 py-2 bg-slate-100/80 rounded-lg text-xs">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ListPlus className="w-4 h-4 text-indigo-600" />
                <span>{assetFiles.length} asset files queued</span>
              </div>
              <button
                onClick={() => onAssetFilesChanged([])}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                title="Clear all queued files"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* POPULATE ACTION BAR */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            {hasCsv && assetFiles.length > 0
              ? `Ready: ${assetFiles.length} files will be matched against ${csvChapterCount} chapters in ${csvFilename}.`
              : 'Upload a book CSV and provide asset files to populate missing chapter rows.'}
          </span>
        </div>

        <button
          id="run-populate-btn"
          disabled={!canPopulate}
          onClick={onRunPopulate}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Fill Missing Chapter Entries</span>
        </button>
      </div>
    </div>
  );
};
