import React, { useMemo, useState } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Copy,
  Plus,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Eye,
  FileCheck2,
  Table as TableIcon,
  Layers,
  Sparkles,
} from 'lucide-react';
import { CsvRow } from '../types';
import { currentChapter } from '../services/csvFiller';

interface TableViewProps {
  headers: string[];
  rows: CsvRow[];
  onUpdateRow: (rowIndex: number, column: string, value: string) => void;
  onDeleteRow: (rowIndex: number) => void;
  onDuplicateRow: (rowIndex: number) => void;
  onAddNewRow: (chapterNumber?: number) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  headers,
  rows,
  onUpdateRow,
  onDeleteRow,
  onDuplicateRow,
  onAddNewRow,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowTypeFilter, setRowTypeFilter] = useState<string>('ALL');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [collapsedChapters, setCollapsedChapters] = useState<Record<number, boolean>>({});
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>('ALL');
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; column: string } | null>(null);
  const [tempCellValue, setTempCellValue] = useState('');

  // Identify all chapters and structure rows
  const { chapterSections, chaptersList } = useMemo(() => {
    const sections: Array<{
      chapterNum: number | null;
      chapterRow: CsvRow | null;
      chapterRowIndex: number | null;
      chapterName: string;
      items: Array<{ row: CsvRow; originalIndex: number }>;
    }> = [];

    const chapters: Array<{ num: number; name: string }> = [];
    let currentSection: (typeof sections)[0] = {
      chapterNum: null,
      chapterRow: null,
      chapterRowIndex: null,
      chapterName: 'General / Book Assets',
      items: [],
    };

    rows.forEach((row, idx) => {
      const chNum = currentChapter(row);
      if (chNum !== null) {
        if (currentSection.items.length > 0 || currentSection.chapterRow) {
          sections.push(currentSection);
        }
        const chName = row.name || `Chapter ${chNum}`;
        chapters.push({ num: chNum, name: chName });
        currentSection = {
          chapterNum: chNum,
          chapterRow: row,
          chapterRowIndex: idx,
          chapterName: chName,
          items: [],
        };
      } else {
        currentSection.items.push({ row, originalIndex: idx });
      }
    });

    if (currentSection.items.length > 0 || currentSection.chapterRow) {
      sections.push(currentSection);
    }

    return { chapterSections: sections, chaptersList: chapters };
  }, [rows]);

  // Filter logic
  const filteredRowsWithIndices = useMemo(() => {
    return rows
      .map((row, idx) => ({ row, originalIndex: idx }))
      .filter(({ row }) => {
        // Row Type filter
        if (rowTypeFilter !== 'ALL' && row.rowType !== rowTypeFilter) {
          return false;
        }
        // Record Type filter
        if (recordTypeFilter !== 'ALL' && row.recordType !== recordTypeFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            (row.name && row.name.toLowerCase().includes(q)) ||
            (row.url && row.url.toLowerCase().includes(q)) ||
            (row.groupName && row.groupName.toLowerCase().includes(q)) ||
            (row.sequence && row.sequence.toLowerCase().includes(q)) ||
            (row.rowType && row.rowType.toLowerCase().includes(q)) ||
            (row.isbn && row.isbn.toLowerCase().includes(q));
          if (!match) return false;
        }
        return true;
      });
  }, [rows, rowTypeFilter, recordTypeFilter, searchQuery]);

  const toggleChapterCollapse = (chNum: number) => {
    setCollapsedChapters(prev => ({ ...prev, [chNum]: !prev[chNum] }));
  };

  const handleCellClick = (rowIndex: number, column: string, currentValue: string) => {
    setEditingCell({ rowIndex, column });
    setTempCellValue(currentValue || '');
  };

  const handleCellBlur = () => {
    if (editingCell) {
      onUpdateRow(editingCell.rowIndex, editingCell.column, tempCellValue);
      setEditingCell(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Primary columns to display
  const primaryDisplayColumns = [
    'rowType',
    'sequence',
    'name',
    'groupName',
    'url',
    'recordType',
    'actionEnabled',
    'allowTo',
    'openInMainContent',
    'pageNo',
    'Book Type',
  ];

  const otherHeaders = headers.filter(h => !primaryDisplayColumns.includes(h));
  const activeHeaders = [...primaryDisplayColumns.filter(c => headers.includes(c)), ...otherHeaders];

  const getRowTypeBadge = (type: string) => {
    if (type === 'chapter') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          chapter
        </span>
      );
    }
    if (type === 'chapter_assets') {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
          chapter_assets
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {type || 'asset'}
      </span>
    );
  };

  const getRecordTypeBadge = (recordType: string) => {
    if (recordType === 'NEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <Sparkles className="w-2.5 h-2.5" />
          NEW
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
        OLD
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filename, asset title, sequence..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filters & View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Row Type filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={rowTypeFilter}
              onChange={(e) => setRowTypeFilter(e.target.value)}
              className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Row Types</option>
              <option value="chapter">Chapters</option>
              <option value="chapter_assets">Chapter Assets</option>
              <option value="book_assets">Book Assets</option>
            </select>
          </div>

          {/* Record Type filter */}
          <select
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-700 text-xs focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Records</option>
            <option value="NEW">✨ Only NEW</option>
            <option value="OLD">Existing (OLD)</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grouped'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>By Chapter</span>
            </button>
            <button
              onClick={() => setViewMode('flat')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'flat'
                  ? 'bg-white font-semibold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Flat Table</span>
            </button>
          </div>

          {/* Add custom row */}
          <button
            onClick={() => onAddNewRow()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      {/* Chapter jump pills (when in grouped view) */}
      {viewMode === 'grouped' && chaptersList.length > 0 && (
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-medium uppercase tracking-wider shrink-0 mr-1">
            Jump to:
          </span>
          <button
            onClick={() => setSelectedChapterFilter('ALL')}
            className={`px-2 py-0.5 rounded-full text-xs shrink-0 cursor-pointer ${
              selectedChapterFilter === 'ALL'
                ? 'bg-slate-800 text-white font-medium'
                : 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All Chapters ({chaptersList.length})
          </button>
          {chaptersList.map((ch) => (
            <button
              key={ch.num}
              onClick={() => setSelectedChapterFilter(String(ch.num))}
              className={`px-2 py-0.5 rounded-full text-xs shrink-0 cursor-pointer ${
                selectedChapterFilter === String(ch.num)
                  ? 'bg-purple-700 text-white font-medium'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              CH {ch.num}
            </button>
          ))}
        </div>
      )}

      {/* TABLE CONTENT */}
      {viewMode === 'grouped' ? (
        // GROUPED VIEW BY CHAPTER
        <div className="divide-y divide-slate-200">
          {chapterSections
            .filter((section) => {
              if (selectedChapterFilter === 'ALL') return true;
              return String(section.chapterNum) === selectedChapterFilter;
            })
            .map((section, sectionIdx) => {
              const isCollapsed = section.chapterNum !== null && !!collapsedChapters[section.chapterNum];
              const newItemsCount = section.items.filter(i => i.row.recordType === 'NEW').length;
              const totalItemsCount = section.items.length;

              return (
                <div key={sectionIdx} className="bg-white">
                  {/* Section / Chapter Header */}
                  <div className="bg-slate-100/90 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                      {section.chapterNum !== null ? (
                        <button
                          onClick={() => toggleChapterCollapse(section.chapterNum!)}
                          className="text-slate-500 hover:text-slate-900 cursor-pointer"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      ) : (
                        <BookOpen className="w-4 h-4 text-slate-500" />
                      )}

                      <div className="flex items-center gap-2">
                        {section.chapterNum !== null && (
                          <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-xs font-bold shadow-xs">
                            CH {section.chapterNum}
                          </span>
                        )}
                        <span className="text-sm font-bold text-slate-900">
                          {section.chapterName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2 text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                          {totalItemsCount} assets
                        </span>
                        {newItemsCount > 0 && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                            +{newItemsCount} NEW
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {section.chapterNum !== null && (
                        <button
                          onClick={() => onAddNewRow(section.chapterNum!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer"
                          title="Add new asset entry specifically into this chapter"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Asset to CH {section.chapterNum}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chapter's Assets Table */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                            <th className="py-2 px-3 font-semibold w-12 text-center">#</th>
                            {activeHeaders.map((col) => (
                              <th key={col} className="py-2 px-3 font-semibold whitespace-nowrap">
                                {col}
                              </th>
                            ))}
                            <th className="py-2 px-3 font-semibold text-right w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {/* First display chapter row itself if it exists */}
                          {section.chapterRow && section.chapterRowIndex !== null && (
                            <tr className="bg-purple-50/40 hover:bg-purple-50/70 transition-colors font-medium">
                              <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                                {section.chapterRowIndex + 1}
                              </td>
                              {activeHeaders.map((col) => (
                                <td key={col} className="py-2 px-3 whitespace-nowrap">
                                  {col === 'rowType' ? (
                                    getRowTypeBadge(section.chapterRow!.rowType)
                                  ) : col === 'recordType' ? (
                                    getRecordTypeBadge(section.chapterRow!.recordType)
                                  ) : (
                                    <span className="text-slate-800">
                                      {section.chapterRow![col] || '-'}
                                    </span>
                                  )}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-right">
                                <span className="text-[11px] text-purple-700 font-semibold uppercase">
                                  Chapter
                                </span>
                              </td>
                            </tr>
                          )}

                          {/* Then display all child asset rows */}
                          {section.items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={activeHeaders.length + 2}
                                className="py-4 px-3 text-center text-slate-400 italic text-xs"
                              >
                                No assets in this chapter yet. Upload asset files or click &quot;Add Asset&quot;.
                              </td>
                            </tr>
                          ) : (
                            section.items.map(({ row, originalIndex }) => {
                              const isNew = row.recordType === 'NEW';
                              return (
                                <tr
                                  key={originalIndex}
                                  className={`transition-colors hover:bg-slate-50 ${
                                    isNew
                                      ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500 font-medium'
                                      : ''
                                  }`}
                                >
                                  <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                                    {originalIndex + 1}
                                  </td>
                                  {activeHeaders.map((col) => {
                                    const val = row[col] || '';
                                    const isEditing =
                                      editingCell?.rowIndex === originalIndex &&
                                      editingCell?.column === col;

                                    return (
                                      <td
                                        key={col}
                                        onDoubleClick={() => handleCellClick(originalIndex, col, val)}
                                        className={`py-2 px-3 whitespace-nowrap cursor-text ${
                                          col === 'name' ? 'font-semibold text-slate-900' : 'text-slate-700'
                                        }`}
                                      >
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            autoFocus
                                            value={tempCellValue}
                                            onChange={(e) => setTempCellValue(e.target.value)}
                                            onBlur={handleCellBlur}
                                            onKeyDown={handleKeyDown}
                                            className="px-1.5 py-0.5 text-xs bg-white border border-emerald-500 rounded focus:outline-hidden"
                                          />
                                        ) : col === 'rowType' ? (
                                          getRowTypeBadge(val)
                                        ) : col === 'recordType' ? (
                                          getRecordTypeBadge(val)
                                        ) : col === 'url' ? (
                                          <span
                                            className="font-mono text-[11px] text-slate-600 max-w-xs truncate inline-block"
                                            title={val}
                                          >
                                            {val || '-'}
                                          </span>
                                        ) : (
                                          <span>{val || '-'}</span>
                                        )}
                                      </td>
                                    );
                                  })}
                                  <td className="py-2 px-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        onClick={() => onDuplicateRow(originalIndex)}
                                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                                        title="Duplicate row"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => onDeleteRow(originalIndex)}
                                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                        title="Delete row"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        // FLAT TABLE VIEW
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                {activeHeaders.map((col) => (
                  <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                    {col}
                  </th>
                ))}
                <th className="py-2.5 px-3 font-semibold text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRowsWithIndices.length === 0 ? (
                <tr>
                  <td
                    colSpan={activeHeaders.length + 2}
                    className="py-8 text-center text-slate-400 italic text-sm"
                  >
                    No matching rows found.
                  </td>
                </tr>
              ) : (
                filteredRowsWithIndices.map(({ row, originalIndex }) => {
                  const isChapter = row.rowType === 'chapter';
                  const isNew = row.recordType === 'NEW';

                  return (
                    <tr
                      key={originalIndex}
                      className={`transition-colors hover:bg-slate-50 ${
                        isChapter
                          ? 'bg-purple-50/40 font-semibold'
                          : isNew
                          ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500'
                          : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-400 text-[11px]">
                        {originalIndex + 1}
                      </td>
                      {activeHeaders.map((col) => {
                        const val = row[col] || '';
                        const isEditing =
                          editingCell?.rowIndex === originalIndex &&
                          editingCell?.column === col;

                        return (
                          <td
                            key={col}
                            onDoubleClick={() => handleCellClick(originalIndex, col, val)}
                            className={`py-2 px-3 whitespace-nowrap cursor-text ${
                              col === 'name' ? 'font-semibold text-slate-900' : 'text-slate-700'
                            }`}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                autoFocus
                                value={tempCellValue}
                                onChange={(e) => setTempCellValue(e.target.value)}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyDown}
                                className="px-1.5 py-0.5 text-xs bg-white border border-emerald-500 rounded focus:outline-hidden"
                              />
                            ) : col === 'rowType' ? (
                              getRowTypeBadge(val)
                            ) : col === 'recordType' ? (
                              getRecordTypeBadge(val)
                            ) : col === 'url' ? (
                              <span
                                className="font-mono text-[11px] text-slate-600 max-w-xs truncate inline-block"
                                title={val}
                              >
                                {val || '-'}
                              </span>
                            ) : (
                              <span>{val || '-'}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onDuplicateRow(originalIndex)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                            title="Duplicate row"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRow(originalIndex)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-3">
          <span>
            Showing {filteredRowsWithIndices.length} of {rows.length} rows
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>Double click any cell to edit</span>
          </span>
        </div>
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Green = Newly populated asset
          </span>
          <span className="inline-flex items-center gap-1 text-purple-700 ml-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Purple = Chapter header
          </span>
        </div>
      </div>
    </div>
  );
};
