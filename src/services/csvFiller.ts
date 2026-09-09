import Papa from 'papaparse';
import {
  AssetScanResult,
  AssetTypeDefinition,
  CsvRow,
  DiagnosticWarning,
  FillConfig,
  ScannedAssetItem,
} from '../types';

export const ASSET_TYPE_DEFINITIONS: AssetTypeDefinition[] = [
  { id: 'Course Book', name: 'Course Book', groupName: 'Course Book', defaultPrefix: 'CB', defaultSequence: 1 },
  { id: 'Animation', name: 'Animation', groupName: 'Animation', defaultPrefix: 'VID', defaultSequence: 2 },
  { id: 'Read Aloud', name: 'Read Aloud', groupName: 'Read aloud', defaultPrefix: 'RA', defaultSequence: 3 },
  { id: 'Audio', name: 'Audio', groupName: 'Audio', defaultPrefix: 'AUD', defaultSequence: 4 },
  { id: 'Listening Text', name: 'Listening Text', groupName: 'Listening Text', defaultPrefix: 'LT', defaultSequence: 5 },
  { id: 'Teacher Manual', name: 'Teacher Manual', groupName: "Teacher's Manual", defaultPrefix: 'TM', defaultSequence: 6, openInMainContent: true },
  { id: 'Worksheet', name: 'Worksheet', groupName: 'Worksheets', defaultPrefix: 'WS', defaultSequence: 7, openInMainContent: true },
  { id: 'Detailed Solution', name: 'Detailed Solution', groupName: 'Solutions', defaultPrefix: 'SOL', defaultSequence: 8 },
  { id: 'Answer Key', name: 'Answer Key', groupName: 'Answer Key', defaultPrefix: 'AK', defaultSequence: 9 },
  { id: 'Interactivities', name: 'Interactivity', groupName: 'Activity', defaultPrefix: 'AC', defaultSequence: 10 },
];

export const DEFAULT_PREFIXES: Record<string, string> = {
  'Course Book': 'CB',
  'Animation': 'VID',
  'Interactivities': 'AC',
  'Teacher Manual': 'TM',
  'Worksheet': 'WS',
  'Audio': 'AUD',
  'Read Aloud': 'RA',
  'Listening Text': 'LT',
  'Detailed Solution': 'SOL',
  'Answer Key': 'AK',
};

export const DEFAULT_ASSET_SEQUENCES: Record<string, number> = {
  'Course Book': 1,
  'Animation': 2,
  'Read Aloud': 3,
  'Audio': 4,
  'Listening Text': 5,
  'Teacher Manual': 6,
  'Worksheet': 7,
  'Detailed Solution': 8,
  'Answer Key': 9,
  'Interactivities': 10,
};

export const DEFAULT_ROW_VALUES: Record<string, string> = {
  actionEnabled: 'VIEW',
  allowTo: 'BOTH',
  isAllowToDemo: 'FALSE',
  'Book Type': 'Coursebook',
  isMainPdf: 'FALSE',
  openInMainContent: 'FALSE',
  isVisibleInPageButton: 'FALSE',
  pageNo: '',
  recordType: 'NEW',
  isConvertToTopic: 'FALSE',
  isRemove: 'FALSE',
};

export const TYPE_SPECIFIC_DEFAULT_COLUMN_VALUES: Record<string, Record<string, string>> = {
  'Teacher Manual': { openInMainContent: 'TRUE' },
  'Worksheet': { openInMainContent: 'TRUE' },
};

export const REQUIRED_COLUMNS = [
  'isbn',
  'rowType',
  'sequence',
  'name',
  'groupName',
  'url',
  'actionEnabled',
  'allowTo',
  'isAllowToDemo',
  'Book Type',
  'isMainPdf',
  'openInMainContent',
  'isVisibleInPageButton',
  'pageNo',
  'recordType',
  'isConvertToTopic',
  'isRemove',
];

export function getDefaultConfig(): FillConfig {
  return {
    prefixes: { ...DEFAULT_PREFIXES },
    assetSequences: { ...DEFAULT_ASSET_SEQUENCES },
    defaultRowValues: { ...DEFAULT_ROW_VALUES },
    typeSpecificDefaultValues: { ...TYPE_SPECIFIC_DEFAULT_COLUMN_VALUES },
    chapterPatternStr: '_CH(\\d{1,4})_(.+)$',
  };
}

export interface FileItemInput {
  name: string;
  size?: number;
}

export function scanAssetFiles(
  files: FileItemInput[],
  config: FillConfig
): AssetScanResult {
  const result: AssetScanResult = {
    assets: {},
    unmatchedPattern: [],
    unrecognizedPrefix: [],
    totalFiles: files.length,
  };

  let chapterRegex: RegExp;
  try {
    chapterRegex = new RegExp(config.chapterPatternStr, 'i');
  } catch {
    chapterRegex = /_CH(\d{1,4})_(.+)$/i;
  }

  for (const file of files) {
    const filename = file.name.trim();
    if (!filename) continue;

    const match = filename.match(chapterRegex);
    if (!match || match.length < 3) {
      result.unmatchedPattern.push(filename);
      continue;
    }

    const chapter = parseInt(match[1], 10);
    const remainder = match[2];
    let matchedType = false;

    for (const typeDef of ASSET_TYPE_DEFINITIONS) {
      const prefix = (config.prefixes[typeDef.id] || '').trim();
      if (prefix && remainder.toLowerCase().startsWith(prefix.toLowerCase())) {
        const suffix = remainder.slice(prefix.length);
        const numberMatch = suffix.match(/\d+/);
        const sortKey: number | string = numberMatch
          ? parseInt(numberMatch[0], 10)
          : suffix.toUpperCase();

        if (!result.assets[chapter]) {
          result.assets[chapter] = [];
        }

        result.assets[chapter].push({
          assetType: typeDef.id,
          filename,
          sortKey,
          chapter,
          size: file.size,
        });

        matchedType = true;
        break;
      }
    }

    if (!matchedType) {
      result.unrecognizedPrefix.push({ filename, chapter, remainder });
    }
  }

  // Sort assets within each chapter
  for (const chapter of Object.keys(result.assets)) {
    const chNum = Number(chapter);
    result.assets[chNum].sort((a, b) => {
      const seqA = config.assetSequences[a.assetType] ?? 999;
      const seqB = config.assetSequences[b.assetType] ?? 999;
      if (seqA !== seqB) return seqA - seqB;

      const typeIndexA = ASSET_TYPE_DEFINITIONS.findIndex(d => d.id === a.assetType);
      const typeIndexB = ASSET_TYPE_DEFINITIONS.findIndex(d => d.id === b.assetType);
      if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;

      const isNumA = typeof a.sortKey === 'number';
      const isNumB = typeof b.sortKey === 'number';
      if (isNumA && !isNumB) return -1;
      if (!isNumA && isNumB) return 1;
      if (isNumA && isNumB) return (a.sortKey as number) - (b.sortKey as number);
      return String(a.sortKey).localeCompare(String(b.sortKey));
    });
  }

  return result;
}

export function currentChapter(row: CsvRow): number | null {
  if (row.rowType?.trim() !== 'chapter') {
    return null;
  }
  const seq = row.sequence?.trim();
  if (!seq) return null;
  const num = parseInt(seq, 10);
  return isNaN(num) ? null : num;
}

export function generateDiagnostics(
  scan: AssetScanResult,
  csvChapters: Set<number>,
  config: FillConfig
): DiagnosticWarning[] {
  const warnings: DiagnosticWarning[] = [];

  if (scan.totalFiles === 0) {
    warnings.push({
      type: 'info',
      title: 'No Asset Files Provided',
      message: 'No asset files have been uploaded or entered yet. Add files to populate chapter rows.',
    });
    return warnings;
  }

  if (scan.unmatchedPattern.length > 0) {
    const count = scan.unmatchedPattern.length;
    const sample = scan.unmatchedPattern.slice(0, 5);
    warnings.push({
      type: 'warning',
      title: `${count} File(s) Do Not Match Chapter Pattern`,
      message: `Files must contain '_CHnn_' (e.g., '_CH08_') to identify the target chapter. These ${count} files were ignored:`,
      items: sample.concat(count > 5 ? [`(+${count - 5} more)`] : []),
    });
  }

  if (scan.unrecognizedPrefix.length > 0) {
    const count = scan.unrecognizedPrefix.length;
    const sample = scan.unrecognizedPrefix.slice(0, 5).map(u => `${u.filename} (CH ${u.chapter}, '${u.remainder}')`);
    const known = Object.entries(config.prefixes)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}="${v}"`)
      .join(', ');

    warnings.push({
      type: 'warning',
      title: `${count} File(s) With Unrecognized Prefix`,
      message: `Matched a chapter number, but the prefix was not recognized. Active prefixes: ${known}. If these files are valid, add their prefix in Settings.`,
      items: sample.concat(count > 5 ? [`(+${count - 5} more)`] : []),
    });
  }

  const folderChapters = new Set(Object.keys(scan.assets).map(Number));
  const onlyInFolder = Array.from(folderChapters).filter(c => !csvChapters.has(c)).sort((a, b) => a - b);
  const onlyInCsv = Array.from(csvChapters).filter(c => !folderChapters.has(c)).sort((a, b) => a - b);

  if (folderChapters.size > 0 && csvChapters.size > 0 && Array.from(folderChapters).every(c => !csvChapters.has(c))) {
    warnings.push({
      type: 'error',
      title: 'Complete Chapter Number Mismatch',
      message: `Asset files contain chapter(s) [${Array.from(folderChapters).join(', ')}] but the CSV chapters are [${Array.from(csvChapters).join(', ')}]. None overlap! Check chapter numbering in filenames vs CSV sequences.`,
    });
  } else if (onlyInFolder.length > 0) {
    warnings.push({
      type: 'warning',
      title: 'Assets Found for Non-Existent Chapters',
      message: `Asset files found for chapter(s) [${onlyInFolder.join(', ')}], but the CSV has no matching chapter rows. These files will not be inserted.`,
    });
  }

  if (onlyInCsv.length > 0 && folderChapters.size > 0) {
    warnings.push({
      type: 'info',
      title: 'Chapters Without New Assets',
      message: `Chapters [${onlyInCsv.join(', ')}] have no corresponding files in the asset list.`,
    });
  }

  return warnings;
}

export function populateCsvRows(
  rows: CsvRow[],
  headers: string[],
  scan: AssetScanResult,
  config: FillConfig
): {
  completedRows: CsvRow[];
  insertedCount: number;
  skippedExistingCount: number;
  chaptersWithNewAssets: number[];
} {
  if (!rows || rows.length === 0) {
    return { completedRows: [], insertedCount: 0, skippedExistingCount: 0, chaptersWithNewAssets: [] };
  }

  const baseRowTemplate: CsvRow = {};
  for (const col of headers) {
    baseRowTemplate[col] = '';
  }

  const result: CsvRow[] = [];
  let activeChapter: number | null = null;
  let existingUrls = new Set<string>();
  let existingSequences: number[] = [];
  let insertedCount = 0;
  let skippedExistingCount = 0;
  const chaptersWithNewAssetsSet = new Set<number>();

  const appendMissingAssets = (chapter: number | null) => {
    if (chapter === null) return;
    let nextSeq = existingSequences.length > 0 ? Math.max(...existingSequences) + 1 : 1;
    const chapterAssets = scan.assets[chapter] || [];

    // Count occurrences per assetType to format name as "Animation" or "Animation - 1"
    const assetCounts: Record<string, number> = {};
    for (const item of chapterAssets) {
      assetCounts[item.assetType] = (assetCounts[item.assetType] || 0) + 1;
    }

    const itemNumbers: Record<string, number> = {};

    for (const item of chapterAssets) {
      itemNumbers[item.assetType] = (itemNumbers[item.assetType] || 0) + 1;
      const lowerFilename = item.filename.toLowerCase();

      if (existingUrls.has(lowerFilename)) {
        skippedExistingCount++;
        continue;
      }

      const typeDef = ASSET_TYPE_DEFINITIONS.find(d => d.id === item.assetType);
      const groupName = typeDef ? typeDef.groupName : item.assetType;
      const displayName = item.assetType === 'Interactivities' ? 'Interactivity' : item.assetType;
      const countForType = assetCounts[item.assetType] || 1;
      const rowName = countForType === 1 ? displayName : `${displayName} - ${itemNumbers[item.assetType]}`;

      const fixedSequence = config.assetSequences[item.assetType];
      const sequenceValue = fixedSequence !== undefined ? String(fixedSequence) : String(nextSeq);

      const typeOverrides = config.typeSpecificDefaultValues[item.assetType] || {};
      const newRow: CsvRow = {
        ...baseRowTemplate,
        ...config.defaultRowValues,
        ...typeOverrides,
        isbn: '',
        rowType: 'chapter_assets',
        sequence: sequenceValue,
        name: rowName,
        groupName: groupName,
        url: item.filename,
        recordType: 'NEW',
      };

      result.push(newRow);
      insertedCount++;
      chaptersWithNewAssetsSet.add(chapter);

      if (fixedSequence === undefined) {
        nextSeq++;
      }
    }
  };

  for (const row of rows) {
    const ch = currentChapter(row);
    if (ch !== null) {
      appendMissingAssets(activeChapter);
      activeChapter = ch;
      existingUrls = new Set<string>();
      existingSequences = [];
    }

    if (activeChapter !== null && row.rowType?.trim() === 'chapter_assets') {
      if (row.url) {
        // Also extract filename from url if url is a path like uploads/xyz/filename.pdf
        const urlClean = row.url.trim().toLowerCase();
        existingUrls.add(urlClean);
        const parts = urlClean.split('/');
        const justName = parts[parts.length - 1];
        if (justName) {
          existingUrls.add(justName);
        }
      }
      const seqStr = row.sequence?.trim();
      if (seqStr) {
        const parsedSeq = parseInt(seqStr, 10);
        if (!isNaN(parsedSeq)) {
          existingSequences.push(parsedSeq);
        }
      }
    }

    result.push(row);
  }

  appendMissingAssets(activeChapter);

  return {
    completedRows: result,
    insertedCount,
    skippedExistingCount,
    chaptersWithNewAssets: Array.from(chaptersWithNewAssetsSet).sort((a, b) => a - b),
  };
}

export function parseCsvString(csvText: string): {
  headers: string[];
  rows: CsvRow[];
  missingRequiredColumns: string[];
} {
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
  });

  const headers = parsed.meta.fields || [];
  const rows: CsvRow[] = (parsed.data || []).filter(row => {
    // Keep rows that have at least one non-empty value
    return Object.values(row).some(v => v !== undefined && String(v).trim() !== '');
  });

  const missing = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

  return {
    headers,
    rows,
    missingRequiredColumns: missing,
  };
}

export function exportCsvString(
  rows: CsvRow[],
  headers: string[],
  includeUtf8Bom = true
): string {
  const csv = Papa.unparse({
    fields: headers,
    data: rows,
  });

  return includeUtf8Bom ? '\uFEFF' + csv : csv;
}
