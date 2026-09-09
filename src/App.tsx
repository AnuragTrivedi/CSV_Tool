import { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { TableView } from './components/TableView';
import { DiagnosticsPanel } from './components/DiagnosticsPanel';
import { ConfigModal } from './components/ConfigModal';
import { AddRowModal } from './components/AddRowModal';
import { RawViewModal } from './components/RawViewModal';
import {
  FileItemInput,
  currentChapter,
  exportCsvString,
  generateDiagnostics,
  getDefaultConfig,
  parseCsvString,
  populateCsvRows,
  scanAssetFiles,
} from './services/csvFiller';
import { SAMPLE_ASSET_FILES, SAMPLE_CSV_CONTENT } from './data/sampleData';
import { CsvRow, FillConfig } from './types';

export default function App() {
  const [csvFilename, setCsvFilename] = useState<string>('MathsWiz2026_Class8_Part2.csv');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [missingRequiredCols, setMissingRequiredCols] = useState<string[]>([]);
  const [assetFiles, setAssetFiles] = useState<FileItemInput[]>([]);
  const [config, setConfig] = useState<FillConfig>(getDefaultConfig());

  // Result metrics
  const [lastInsertedCount, setLastInsertedCount] = useState<number | null>(null);
  const [lastSkippedCount, setLastSkippedCount] = useState<number | null>(null);
  const [chaptersTouched, setChaptersTouched] = useState<number[]>([]);

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isRawViewOpen, setIsRawViewOpen] = useState(false);
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [targetChapterForAdd, setTargetChapterForAdd] = useState<number | undefined>(undefined);

  // Load sample data function
  const loadSampleData = useCallback(() => {
    const { headers: parsedHeaders, rows: parsedRows, missingRequiredColumns } =
      parseCsvString(SAMPLE_CSV_CONTENT);

    const initialAssets: FileItemInput[] = SAMPLE_ASSET_FILES.map(name => ({ name }));

    setCsvFilename('MathsWiz2026_Class8_Part2.csv');
    setHeaders(parsedHeaders);
    setRows(parsedRows);
    setMissingRequiredCols(missingRequiredColumns);
    setAssetFiles(initialAssets);
    setLastInsertedCount(null);
    setLastSkippedCount(null);
    setChaptersTouched([]);
  }, []);

  // Initialize with sample data on mount
  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  // Read CSV file from user
  const handleCsvFileLoaded = (csvContent: string, filename: string) => {
    const { headers: parsedHeaders, rows: parsedRows, missingRequiredColumns } =
      parseCsvString(csvContent);

    setCsvFilename(filename);
    setHeaders(parsedHeaders);
    setRows(parsedRows);
    setMissingRequiredCols(missingRequiredColumns);
    setLastInsertedCount(null);
    setLastSkippedCount(null);
    setChaptersTouched([]);
  };

  // Reset all
  const handleReset = () => {
    setCsvFilename('');
    setHeaders([]);
    setRows([]);
    setMissingRequiredCols([]);
    setAssetFiles([]);
    setLastInsertedCount(null);
    setLastSkippedCount(null);
    setChaptersTouched([]);
  };

  // Compute scanned assets
  const scanResult = useMemo(() => {
    return scanAssetFiles(assetFiles, config);
  }, [assetFiles, config]);

  // Compute CSV chapters
  const csvChapters = useMemo(() => {
    const set = new Set<number>();
    for (const r of rows) {
      const ch = currentChapter(r);
      if (ch !== null) {
        set.add(ch);
      }
    }
    return set;
  }, [rows]);

  // Chapters list for modals
  const chaptersList = useMemo(() => {
    const list: Array<{ num: number; name: string }> = [];
    for (const r of rows) {
      const ch = currentChapter(r);
      if (ch !== null) {
        list.push({ num: ch, name: r.name || `Chapter ${ch}` });
      }
    }
    return list;
  }, [rows]);

  // Compute diagnostics
  const diagnostics = useMemo(() => {
    return generateDiagnostics(scanResult, csvChapters, config);
  }, [scanResult, csvChapters, config]);

  // Populate missing rows
  const handleRunPopulate = () => {
    if (rows.length === 0 || assetFiles.length === 0) return;

    const { completedRows, insertedCount, skippedExistingCount, chaptersWithNewAssets } =
      populateCsvRows(rows, headers, scanResult, config);

    setRows(completedRows);
    setLastInsertedCount(insertedCount);
    setLastSkippedCount(skippedExistingCount);
    setChaptersTouched(chaptersWithNewAssets);
  };

  // Row update handlers
  const handleUpdateRow = (rowIndex: number, column: string, value: string) => {
    setRows(prev => {
      const copy = [...prev];
      if (copy[rowIndex]) {
        copy[rowIndex] = { ...copy[rowIndex], [column]: value };
      }
      return copy;
    });
  };

  const handleDeleteRow = (rowIndex: number) => {
    setRows(prev => prev.filter((_, idx) => idx !== rowIndex));
  };

  const handleDuplicateRow = (rowIndex: number) => {
    setRows(prev => {
      const copy = [...prev];
      const target = copy[rowIndex];
      if (target) {
        const dup: CsvRow = { ...target, recordType: 'NEW' };
        copy.splice(rowIndex + 1, 0, dup);
      }
      return copy;
    });
  };

  const handleAddRow = (newRow: CsvRow, chapterNum?: number) => {
    setRows(prev => {
      const copy = [...prev];
      if (chapterNum !== undefined) {
        // Find index of this chapter and insert right after its assets
        let targetInsertIdx = -1;
        let inTargetChapter = false;

        for (let i = 0; i < copy.length; i++) {
          const ch = currentChapter(copy[i]);
          if (ch === chapterNum) {
            inTargetChapter = true;
            targetInsertIdx = i;
          } else if (inTargetChapter && ch !== null) {
            // Next chapter started
            targetInsertIdx = i - 1;
            break;
          } else if (inTargetChapter) {
            targetInsertIdx = i;
          }
        }

        if (targetInsertIdx !== -1) {
          copy.splice(targetInsertIdx + 1, 0, newRow);
          return copy;
        }
      }

      // Default append to end
      copy.push(newRow);
      return copy;
    });
  };

  // Export CSV
  const handleExportCsv = () => {
    if (rows.length === 0) return;
    const csvContent = exportCsvString(rows, headers, true);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const baseName = csvFilename ? csvFilename.replace(/\.csv$/i, '') : 'book_assets';
    a.download = `${baseName}_completed.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const rawCsvContent = useMemo(() => {
    if (rows.length === 0) return '';
    return exportCsvString(rows, headers, false);
  }, [rows, headers]);

  const newRowsCount = useMemo(() => {
    return rows.filter(r => r.recordType === 'NEW').length;
  }, [rows]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <Header
        totalRows={rows.length}
        chapterCount={csvChapters.size}
        newRowsCount={newRowsCount}
        assetFileCount={assetFiles.length}
        onLoadSample={loadSampleData}
        onReset={handleReset}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenRawView={() => setIsRawViewOpen(true)}
        onExportCsv={handleExportCsv}
        hasRows={rows.length > 0}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Upload & Setup Section */}
        <UploadSection
          csvFilename={csvFilename}
          hasCsv={rows.length > 0}
          csvRowCount={rows.length}
          csvChapterCount={csvChapters.size}
          missingRequiredColumns={missingRequiredCols}
          assetFiles={assetFiles}
          onCsvFileLoaded={handleCsvFileLoaded}
          onAssetFilesChanged={setAssetFiles}
          onRunPopulate={handleRunPopulate}
          canPopulate={rows.length > 0 && assetFiles.length > 0}
        />

        {/* Diagnostics & Warnings Banner */}
        <DiagnosticsPanel
          warnings={diagnostics}
          insertedCount={lastInsertedCount}
          skippedExistingCount={lastSkippedCount}
          chaptersTouched={chaptersTouched}
        />

        {/* Interactive Spreadsheet View */}
        {rows.length > 0 ? (
          <TableView
            headers={headers}
            rows={rows}
            onUpdateRow={handleUpdateRow}
            onDeleteRow={handleDeleteRow}
            onDuplicateRow={handleDuplicateRow}
            onAddNewRow={(chNum) => {
              setTargetChapterForAdd(chNum);
              setIsAddRowOpen(true);
            }}
          />
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <h3 className="text-base font-semibold text-slate-800">
              No CSV Loaded Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Upload an existing book asset CSV or click &quot;Sample Data&quot; to test with Class 8 MathsWiz chapters and sample media files.
            </p>
            <button
              onClick={loadSampleData}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Load Sample Book CSV
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 sm:px-6 text-center text-xs text-slate-400">
        Book Asset CSV Entry Filler • Automatically maps chapter patterns like <code className="font-mono text-slate-600">_CH08_VID01</code> to matching CSV chapters
      </footer>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSaveConfig={setConfig}
      />

      {/* Add Row Modal */}
      <AddRowModal
        isOpen={isAddRowOpen}
        onClose={() => setIsAddRowOpen(false)}
        headers={headers}
        chapters={chaptersList}
        defaultChapterNum={targetChapterForAdd}
        config={config}
        onAddRow={handleAddRow}
      />

      {/* Raw CSV Inspector Modal */}
      <RawViewModal
        isOpen={isRawViewOpen}
        onClose={() => setIsRawViewOpen(false)}
        rawCsv={rawCsvContent}
        onDownload={handleExportCsv}
      />
    </div>
  );
}
