export interface CsvRow {
  [key: string]: string;
}

export interface AssetTypeDefinition {
  id: string;
  name: string;
  groupName: string;
  defaultPrefix: string;
  defaultSequence: number;
  openInMainContent?: boolean;
}

export interface ScannedAssetItem {
  assetType: string;
  filename: string;
  sortKey: number | string;
  chapter: number;
  size?: number;
}

export interface AssetScanResult {
  assets: Record<number, ScannedAssetItem[]>;
  unmatchedPattern: string[];
  unrecognizedPrefix: Array<{ filename: string; chapter: number; remainder: string }>;
  totalFiles: number;
}

export interface DiagnosticWarning {
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  items?: string[];
}

export interface FillConfig {
  prefixes: Record<string, string>;
  assetSequences: Record<string, number>;
  defaultRowValues: Record<string, string>;
  typeSpecificDefaultValues: Record<string, Record<string, string>>;
  chapterPatternStr: string;
}

export interface FillHistoryStep {
  rows: CsvRow[];
  timestamp: number;
  description: string;
}
