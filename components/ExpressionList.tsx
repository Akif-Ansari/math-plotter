'use client';

import React, { useState } from 'react';
import { MathExpression, MathFunctionType, LineStyleType, AnalysisResult } from '@/types/math';
import { extractParameters } from '@/lib/math-engine/parser';
import KaTeXRenderer from './KaTeXRenderer';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BarChart2,
  Calculator,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Copy,
  Table as TableIcon,
  Sigma,
} from 'lucide-react';

interface ExpressionListProps {
  expressions: MathExpression[];
  onAddExpression: () => void;
  onUpdateExpression: (id: string, updated: Partial<MathExpression>) => void;
  onDeleteExpression: (id: string) => void;
  onDuplicateExpression: (id: string) => void;
  onOpenAnalysis: (id: string) => void;
  onOpenTable?: (id?: string) => void;
  onOpenIntegral?: (id: string) => void;
  analyses: Record<string, AnalysisResult>;
}

const PRESET_COLORS = [
  '#10B981', // Emerald Green
  '#3B82F6', // Royal Blue
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export default function ExpressionList({
  expressions,
  onAddExpression,
  onUpdateExpression,
  onDeleteExpression,
  onDuplicateExpression,
  onOpenAnalysis,
  onOpenTable,
  onOpenIntegral,
  analyses,
}: ExpressionListProps) {
  const [activeInputId, setActiveInputId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [editingSettingsId, setEditingSettingsId] = useState<string | null>(null);

  if (isCollapsed) {
    return (
      <aside className="w-14 bg-zinc-900 border-r border-zinc-800 text-white flex flex-col items-center py-4 z-10 shadow-xl select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand Expression Panel"
          className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition cursor-pointer mb-4"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={onAddExpression}
          title="Add New Expression"
          className="p-2 text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition cursor-pointer mb-6"
        >
          <Plus className="w-5 h-5" />
        </button>

        <div className="flex-1 overflow-y-auto space-y-3 w-full flex flex-col items-center">
          {expressions.map((expr, index) => (
            <button
              key={expr.id}
              onClick={() => setIsCollapsed(false)}
              title={expr.label || `y = ${expr.rawText}`}
              className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer transition transform hover:scale-110"
              style={{ backgroundColor: expr.color }}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 md:w-96 bg-zinc-900 border-r border-zinc-800 text-white flex flex-col h-full z-10 shadow-xl select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/40">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-indigo-400" />
          <h2 className="font-semibold text-sm text-zinc-200">Expressions</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onAddExpression}
            className="flex items-center gap-1 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg transition cursor-pointer shadow-md shadow-indigo-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expression
          </button>

          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse Sidebar"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customizable Expression List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {expressions.map((expr, index) => {
          const analysis = analyses[expr.id];
          const isCustomizing = editingSettingsId === expr.id;

          const getPrefix = () => {
            if (expr.type === 'polar') return 'r =';
            if (expr.type === 'x_of_y') return 'x =';
            if (expr.type === 'implicit') return 'eq:';
            return 'y =';
          };

          const getLatexString = () => {
            if (expr.type === 'polar') return `r = ${expr.rawText}`;
            if (expr.type === 'x_of_y') return `x = ${expr.rawText}`;
            if (expr.type === 'implicit') return expr.rawText.includes('=') ? expr.rawText : `F(x,y) = ${expr.rawText}`;
            return `y = ${expr.rawText}`;
          };

          return (
            <div
              key={expr.id}
              className={`p-3 rounded-xl border transition-all ${
                activeInputId === expr.id
                  ? 'border-indigo-500/80 bg-zinc-800/80 shadow-lg shadow-indigo-500/10'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            >
              {/* Top Control Bar */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Color Circle Picker */}
                  <div className="relative flex items-center">
                    <input
                      type="color"
                      value={expr.color}
                      onChange={(e) => onUpdateExpression(expr.id, { color: e.target.value })}
                      className="w-5 h-5 rounded-full border-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
                      title="Choose Custom Color"
                    />
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white/20 shadow-md cursor-pointer transition transform hover:scale-110"
                      style={{ backgroundColor: expr.color }}
                    />
                  </div>

                  {/* Function Type Selector */}
                  <select
                    value={expr.type}
                    onChange={(e) =>
                      onUpdateExpression(expr.id, {
                        type: e.target.value as MathFunctionType,
                      })
                    }
                    className="bg-zinc-800 text-[11px] font-mono text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 focus:outline-none"
                  >
                    <option value="cartesian">y = f(x)</option>
                    <option value="implicit">Implicit (y² = x)</option>
                    <option value="x_of_y">x = f(y)</option>
                    <option value="polar">r = f(θ)</option>
                    <option value="parametric">Parametric</option>
                  </select>

                  <span className="text-[10px] font-mono text-zinc-500">#{index + 1}</span>
                </div>

                {/* Actions: Customize, Analysis, Duplicate, Visibility, Delete */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingSettingsId(isCustomizing ? null : expr.id)}
                    title="Customize Styling & Label"
                    className={`p-1 rounded transition cursor-pointer ${
                      isCustomizing ? 'text-indigo-400 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {expr.type === 'cartesian' && (
                    <>
                      <button
                        onClick={() => onOpenAnalysis(expr.id)}
                        title="Calculus Analysis (Roots, Domain, Range, Asymptotes)"
                        className="p-1 text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                      {onOpenTable && (
                        <button
                          onClick={() => onOpenTable(expr.id)}
                          title="Table of Values (x vs f(x))"
                          className="p-1 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                        >
                          <TableIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onOpenIntegral && (
                        <button
                          onClick={() => onOpenIntegral(expr.id)}
                          title="Definite Integral & Riemann Sums"
                          className="p-1 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                        >
                          <Sigma className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => onDuplicateExpression(expr.id)}
                    title="Duplicate Expression"
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUpdateExpression(expr.id, { visible: !expr.visible })}
                    title={expr.visible ? 'Hide Graph' : 'Show Graph'}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition cursor-pointer"
                  >
                    {expr.visible ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-600" />}
                  </button>

                  <button
                    onClick={() => onDeleteExpression(expr.id)}
                    title="Delete Expression"
                    className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Custom Settings Panel */}
              {isCustomizing && (
                <div className="mb-2.5 p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg space-y-2 text-xs">
                  {/* Label */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Custom Label/Name</label>
                    <input
                      type="text"
                      value={expr.label || ''}
                      onChange={(e) => onUpdateExpression(expr.id, { label: e.target.value })}
                      placeholder="e.g. Parabola / Conic"
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Line Style & Thickness */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-400 font-medium block mb-1">Line Style</label>
                      <select
                        value={expr.lineStyle || 'solid'}
                        onChange={(e) =>
                          onUpdateExpression(expr.id, {
                            lineStyle: e.target.value as LineStyleType,
                          })
                        }
                        className="w-full bg-zinc-950 text-zinc-300 text-[11px] px-2 py-1 rounded border border-zinc-700/80 focus:outline-none"
                      >
                        <option value="solid">Solid (━)</option>
                        <option value="dashed">Dashed (╌)</option>
                        <option value="dotted">Dotted (┈)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-zinc-400 font-medium block mb-1">Thickness</label>
                      <select
                        value={expr.lineWidth || 2.5}
                        onChange={(e) =>
                          onUpdateExpression(expr.id, {
                            lineWidth: parseFloat(e.target.value),
                          })
                        }
                        className="w-full bg-zinc-950 text-zinc-300 text-[11px] px-2 py-1 rounded border border-zinc-700/80 focus:outline-none"
                      >
                        <option value={1.5}>Thin (1.5px)</option>
                        <option value={2.5}>Normal (2.5px)</option>
                        <option value={4}>Thick (4.0px)</option>
                        <option value={6}>Bold (6.0px)</option>
                      </select>
                    </div>
                  </div>

                  {/* Preset Swatches */}
                  <div>
                    <label className="text-[10px] text-zinc-400 font-medium block mb-1">Color Palette</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => onUpdateExpression(expr.id, { color: c })}
                          className={`w-4 h-4 rounded-full transition transform hover:scale-125 ${
                            expr.color === c ? 'ring-2 ring-white scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Expression Input Field */}
              {expr.type === 'parametric' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">x(t) =</span>
                    <input
                      type="text"
                      value={expr.parametricX || ''}
                      onFocus={() => setActiveInputId(expr.id)}
                      onChange={(e) => onUpdateExpression(expr.id, { parametricX: e.target.value })}
                      placeholder="3 * cos(t)"
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">y(t) =</span>
                    <input
                      type="text"
                      value={expr.parametricY || ''}
                      onFocus={() => setActiveInputId(expr.id)}
                      onChange={(e) => onUpdateExpression(expr.id, { parametricY: e.target.value })}
                      placeholder="3 * sin(t)"
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      {getPrefix()}
                    </span>
                    <input
                      type="text"
                      value={expr.rawText}
                      onFocus={() => setActiveInputId(expr.id)}
                      onChange={(e) => onUpdateExpression(expr.id, { rawText: e.target.value })}
                      placeholder={
                        expr.type === 'polar'
                          ? '3 * theta'
                          : expr.type === 'implicit'
                          ? 'y^2 = x'
                          : expr.type === 'x_of_y'
                          ? 'y^2'
                          : 'sqrt(x)'
                      }
                      className="flex-1 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* LaTeX Render Preview & Quick Summary */}
              {expr.rawText && (
                <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                  <div className="truncate flex items-center gap-1.5">
                    {expr.label && <span className="text-[10px] text-indigo-400 font-semibold uppercase">{expr.label}:</span>}
                    <KaTeXRenderer
                      latex={getLatexString()}
                      className="text-zinc-300 font-serif"
                    />
                  </div>

                  {analysis && analysis.isEvaluatable && (
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono flex-shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {analysis.rootCount} root{analysis.rootCount !== 1 && 's'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
