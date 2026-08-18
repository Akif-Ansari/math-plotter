'use client';

import React from 'react';
import { MathExpression, Viewport } from '@/types/math';
import { compileExpression } from '@/lib/math-engine/parser';
import Dropdown, { DropdownOption } from './Dropdown';
import { X, Download, Copy, Check, Table as TableIcon } from 'lucide-react';

interface TableModalProps {
  expressions: MathExpression[];
  initialExpressionId?: string | null;
  viewport: Viewport;
  onClose: () => void;
  isDarkTheme?: boolean;
}

const STEP_OPTIONS: DropdownOption<number>[] = [
  { value: 0.1, label: '0.1' },
  { value: 0.25, label: '0.25' },
  { value: 0.5, label: '0.5' },
  { value: 1.0, label: '1.0' },
  { value: 2.0, label: '2.0' },
];

export default function TableModal({
  expressions,
  initialExpressionId,
  viewport,
  onClose,
  isDarkTheme = true,
}: TableModalProps) {
  const visibleExprs = React.useMemo(
    () => expressions.filter((e) => e.visible && e.type === 'cartesian'),
    [expressions]
  );

  const [selectedExprId, setSelectedExprId] = React.useState<string>(
    initialExpressionId && visibleExprs.some((e) => e.id === initialExpressionId)
      ? initialExpressionId
      : 'all'
  );

  const [xMinVal, setXMinVal] = React.useState<number>(
    Math.round(viewport.xMin)
  );
  const [xMaxVal, setXMaxVal] = React.useState<number>(
    Math.round(viewport.xMax)
  );
  const [stepVal, setStepVal] = React.useState<number>(0.5);

  const [copied, setCopied] = React.useState(false);

  // Target expressions to include in table
  const targetExpressions = React.useMemo(() => {
    if (selectedExprId === 'all') {
      return visibleExprs;
    }
    return visibleExprs.filter((e) => e.id === selectedExprId);
  }, [visibleExprs, selectedExprId]);

  const functionOptions: DropdownOption<string>[] = React.useMemo(() => [
    { value: 'all', label: 'All Visible Cartesian Functions' },
    ...visibleExprs.map((expr) => ({
      value: expr.id,
      label: expr.label ? `${expr.label} (${expr.rawText})` : `f(x) = ${expr.rawText}`,
      icon: (
        <span
          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: expr.color }}
        />
      ),
    })),
  ], [visibleExprs]);

  // Generate compiled evaluation functions
  const compiledFns = React.useMemo(() => {
    return targetExpressions.map((expr) => ({
      expr,
      ...compileExpression(expr.rawText, 'x'),
    }));
  }, [targetExpressions]);

  // Generate table row data
  const tableData = React.useMemo(() => {
    const rows: { x: number; values: Record<string, number | null> }[] = [];
    const min = Math.min(xMinVal, xMaxVal);
    const max = Math.max(xMinVal, xMaxVal);
    const step = Math.max(0.01, stepVal);

    const count = Math.min(500, Math.floor((max - min) / step) + 1);

    for (let i = 0; i < count; i++) {
      const x = Number((min + i * step).toFixed(4));
      const rowValues: Record<string, number | null> = {};

      compiledFns.forEach(({ expr, evalFn }) => {
        if (evalFn) {
          const val = evalFn(x);
          rowValues[expr.id] = Number.isFinite(val) && !isNaN(val) ? Number(val.toFixed(4)) : null;
        } else {
          rowValues[expr.id] = null;
        }
      });

      rows.push({ x, values: rowValues });
    }

    return rows;
  }, [xMinVal, xMaxVal, stepVal, compiledFns]);

  // Copy to Clipboard (TSV)
  const handleCopyTSV = () => {
    if (tableData.length === 0) return;
    const headers = ['x', ...targetExpressions.map((e) => e.latex || e.rawText)];
    const lines = [headers.join('\t')];

    tableData.forEach((row) => {
      const line = [
        row.x,
        ...targetExpressions.map((e) => (row.values[e.id] !== null ? row.values[e.id] : 'Undefined')),
      ];
      lines.push(line.join('\t'));
    });

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export to CSV file
  const handleExportCSV = () => {
    if (tableData.length === 0) return;
    const headers = ['x', ...targetExpressions.map((e) => `"${e.latex || e.rawText}"`)];
    const lines = [headers.join(',')];

    tableData.forEach((row) => {
      const line = [
        row.x,
        ...targetExpressions.map((e) => (row.values[e.id] !== null ? row.values[e.id] : 'Undefined')),
      ];
      lines.push(line.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'mathplotter_table_of_values.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-colors duration-200 ${
        isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Modal Header */}
        <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between ${
          isDarkTheme ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#006241]/20 border border-[#1DB954]/30 text-[#1DB954] flex-shrink-0">
              <TableIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base sm:text-lg font-bold truncate ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}>
                Table of Values
              </h2>
              <p className={`text-[11px] sm:text-xs truncate ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Numerical data table for Cartesian expressions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-lg transition flex-shrink-0 ${
              isDarkTheme ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls */}
        <div className={`p-3.5 sm:p-6 border-b flex flex-wrap gap-2.5 sm:gap-4 items-center justify-between ${
          isDarkTheme ? 'bg-zinc-900 border-zinc-800/80' : 'bg-zinc-50/70 border-zinc-200'
        }`}>
          <div className="flex flex-wrap gap-4 items-center">
            {/* Function Select */}
            <div className="flex flex-col gap-1 w-52 sm:w-64">
              <label className={`text-[11px] font-medium uppercase tracking-wider ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Function
              </label>
              <Dropdown<string>
                value={selectedExprId}
                onChange={(val) => setSelectedExprId(val)}
                options={functionOptions}
                isDarkTheme={isDarkTheme}
                size="sm"
                fullWidth
              />
            </div>

            {/* Start X */}
            <div className="flex flex-col gap-1 w-24">
              <label className={`text-[11px] font-medium uppercase tracking-wider ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Start (xMin)
              </label>
              <input
                type="number"
                value={xMinVal}
                onChange={(e) => setXMinVal(parseFloat(e.target.value) || -10)}
                className={`border text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#1DB954] ${
                  isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* End X */}
            <div className="flex flex-col gap-1 w-24">
              <label className={`text-[11px] font-medium uppercase tracking-wider ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                End (xMax)
              </label>
              <input
                type="number"
                value={xMaxVal}
                onChange={(e) => setXMaxVal(parseFloat(e.target.value) || 10)}
                className={`border text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-[#1DB954] ${
                  isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-900'
                }`}
              />
            </div>

            {/* Step Size */}
            <div className="flex flex-col gap-1 w-28">
              <label className={`text-[11px] font-medium uppercase tracking-wider ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Step (Δx)
              </label>
              <Dropdown<number>
                value={stepVal}
                onChange={(val) => setStepVal(val)}
                options={STEP_OPTIONS}
                isDarkTheme={isDarkTheme}
                size="sm"
                fullWidth
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTSV}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition cursor-pointer ${
                isDarkTheme
                  ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-200'
                  : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-300 text-zinc-800'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1DB954]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Table'}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1DB954] hover:bg-[#18a349] text-black text-xs font-semibold transition cursor-pointer shadow-md shadow-[#1DB954]/20"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          {targetExpressions.length === 0 ? (
            <div className={`text-center py-12 text-sm ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
              No visible Cartesian functions available to generate table.
            </div>
          ) : (
            <div className={`border rounded-xl overflow-hidden ${
              isDarkTheme ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200 shadow-sm'
            }`}>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b font-mono ${
                    isDarkTheme ? 'bg-zinc-900/90 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                  }`}>
                    <th className={`py-3 px-4 w-28 border-r ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'}`}>x</th>
                    {targetExpressions.map((expr) => (
                      <th
                        key={expr.id}
                        className="py-3 px-4 font-semibold"
                        style={{ color: expr.color }}
                      >
                        f(x) = {expr.rawText}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y font-mono ${
                  isDarkTheme ? 'divide-zinc-800/60 text-zinc-300' : 'divide-zinc-200 text-zinc-700'
                }`}>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className={`transition ${
                      isDarkTheme ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-50'
                    }`}>
                      <td className={`py-2.5 px-4 font-bold border-r ${
                        isDarkTheme ? 'text-zinc-200 border-zinc-800 bg-zinc-900/30' : 'text-zinc-900 border-zinc-200 bg-zinc-50'
                      }`}>
                        {row.x}
                      </td>
                      {targetExpressions.map((expr) => {
                        const val = row.values[expr.id];
                        const isRoot = val === 0;
                        return (
                          <td key={expr.id} className="py-2.5 px-4">
                            {val !== null ? (
                              <span className="flex items-center gap-2">
                                <span>{val}</span>
                                {isRoot && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-sans font-semibold rounded bg-[#006241]/20 text-[#1DB954] border border-[#1DB954]/30">
                                    Root
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className={isDarkTheme ? 'text-zinc-600 italic' : 'text-zinc-400 italic'}>
                                Undefined
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
