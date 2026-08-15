'use client';

import React from 'react';
import { MathExpression, Viewport } from '@/types/math';
import { compileExpression } from '@/lib/math-engine/parser';
import { X, Download, Copy, Check, Table as TableIcon } from 'lucide-react';

interface TableModalProps {
  expressions: MathExpression[];
  initialExpressionId?: string | null;
  viewport: Viewport;
  onClose: () => void;
}

export default function TableModal({
  expressions,
  initialExpressionId,
  viewport,
  onClose,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <TableIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Table of Values</h2>
              <p className="text-xs text-zinc-400">Numerical data table for Cartesian expressions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-900 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Function Select */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Function
              </label>
              <select
                value={selectedExprId}
                onChange={(e) => setSelectedExprId(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All Visible Cartesian Functions</option>
                {visibleExprs.map((expr) => (
                  <option key={expr.id} value={expr.id}>
                    {expr.label ? `${expr.label} (${expr.rawText})` : expr.rawText}
                  </option>
                ))}
              </select>
            </div>

            {/* Start X */}
            <div className="flex flex-col gap-1 w-24">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Start (xMin)
              </label>
              <input
                type="number"
                value={xMinVal}
                onChange={(e) => setXMinVal(parseFloat(e.target.value) || -10)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* End X */}
            <div className="flex flex-col gap-1 w-24">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                End (xMax)
              </label>
              <input
                type="number"
                value={xMaxVal}
                onChange={(e) => setXMaxVal(parseFloat(e.target.value) || 10)}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Step Size */}
            <div className="flex flex-col gap-1 w-28">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Step (Δx)
              </label>
              <select
                value={stepVal}
                onChange={(e) => setStepVal(parseFloat(e.target.value))}
                className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
              >
                <option value={0.1}>0.1</option>
                <option value={0.25}>0.25</option>
                <option value={0.5}>0.5</option>
                <option value={1}>1.0</option>
                <option value={2}>2.0</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyTSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Table'}
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-6">
          {targetExpressions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              No visible Cartesian functions available to generate table.
            </div>
          ) : (
            <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 font-mono">
                    <th className="py-3 px-4 w-28 border-r border-zinc-800">x</th>
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
                <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-300">
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/50 transition">
                      <td className="py-2.5 px-4 font-bold text-zinc-200 border-r border-zinc-800 bg-zinc-900/30">
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
                                  <span className="px-1.5 py-0.5 text-[10px] font-sans font-semibold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                    Root
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-zinc-600 italic">Undefined</span>
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
