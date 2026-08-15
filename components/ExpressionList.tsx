'use client';

import React from 'react';
import { MathExpression, MathFunctionType, LineStyleType, AnalysisResult } from '@/types/math';
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
  isDarkTheme?: boolean;
}

const PRESET_COLORS = [
  '#1DB954',
  '#006241',
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
  isDarkTheme = true,
}: ExpressionListProps) {
  const [activeInputId, setActiveInputId] = React.useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);
  const [editingSettingsId, setEditingSettingsId] = React.useState<string | null>(null);

  if (isCollapsed) {
    return (
      <aside className={`w-12 sm:w-14 border-r flex flex-col items-center py-3 sm:py-4 z-10 shadow-xl select-none flex-shrink-0 transition-colors duration-200 ${
        isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand Expression Panel"
          className={`p-1.5 sm:p-2 rounded-lg border transition cursor-pointer mb-3 sm:mb-4 ${
            isDarkTheme
              ? 'text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 border-zinc-700'
              : 'text-zinc-500 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300'
          }`}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button
          onClick={onAddExpression}
          title="Add New Expression"
          className="p-1.5 sm:p-2 text-black bg-[#1DB954] hover:bg-[#18a349] rounded-lg transition cursor-pointer mb-4 sm:mb-6 shadow-md shadow-[#1DB954]/20"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex-1 overflow-y-auto space-y-2.5 w-full flex flex-col items-center px-1">
          {expressions.map((expr, index) => (
            <button
              key={expr.id}
              onClick={() => setIsCollapsed(false)}
              title={expr.label || `y = ${expr.rawText}`}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/20 flex items-center justify-center text-[10px] font-bold shadow cursor-pointer transition transform hover:scale-110"
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
    <aside className={`w-full sm:w-80 md:w-96 border-r flex flex-col h-full z-10 shadow-xl select-none min-w-0 max-w-full overflow-hidden transition-colors duration-200 ${
      isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
    }`}>
      {/* Sidebar Header */}
      <div className={`p-2.5 sm:p-3.5 border-b flex items-center justify-between min-w-0 ${
        isDarkTheme ? 'bg-zinc-950/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
      }`}>
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#1DB954]" />
          <h2 className={`font-semibold text-xs sm:text-sm ${isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'}`}>
            Expressions
          </h2>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onAddExpression}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-[#1DB954] hover:bg-[#18a349] text-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition cursor-pointer shadow-md shadow-[#1DB954]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse Sidebar"
            className={`p-1 sm:p-1.5 rounded-lg transition cursor-pointer ${
              isDarkTheme ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customizable Expression List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2.5 sm:space-y-3 min-w-0">
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
              className={`p-2.5 sm:p-3 rounded-xl border transition-all min-w-0 overflow-hidden ${
                activeInputId === expr.id
                  ? isDarkTheme
                    ? 'border-[#1DB954]/80 bg-zinc-800/80 shadow-lg shadow-[#1DB954]/10'
                    : 'border-[#1DB954]/80 bg-zinc-50 shadow-md shadow-[#1DB954]/10'
                  : isDarkTheme
                    ? 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 shadow-sm'
              }`}
            >
              {/* Top Control Bar - Fully Responsive with flex-wrap and compact gaps */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2 min-w-0">
                {/* Left: Color Picker + Function Type + Index Badge */}
                <div className="flex items-center gap-1.5 min-w-0 flex-shrink">
                  {/* Color Circle Picker */}
                  <div className="relative flex items-center flex-shrink-0">
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
                    className={`text-[10px] sm:text-[11px] font-mono px-1.5 sm:px-2 py-0.5 rounded border focus:outline-none focus:border-[#1DB954] max-w-[95px] sm:max-w-[120px] truncate ${
                      isDarkTheme
                        ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-300'
                    }`}
                  >
                    <option value="cartesian">y = f(x)</option>
                    <option value="implicit">Implicit</option>
                    <option value="x_of_y">x = f(y)</option>
                    <option value="polar">r = f(θ)</option>
                    <option value="parametric">Parametric</option>
                  </select>

                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded border flex-shrink-0 ${
                    isDarkTheme ? 'text-zinc-500 bg-zinc-900/80 border-zinc-800' : 'text-zinc-600 bg-zinc-100 border-zinc-200'
                  }`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Right: Actions (Customize, Analysis, Table, Integral, Duplicate, Visibility, Delete) */}
                <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end">
                  <button
                    onClick={() => setEditingSettingsId(isCustomizing ? null : expr.id)}
                    title="Customize Styling & Label"
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                      isCustomizing
                        ? 'text-[#1DB954] bg-[#006241]/30 border border-[#1DB954]/40'
                        : isDarkTheme
                          ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                          : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                  </button>

                  {expr.type === 'cartesian' && (
                    <>
                      <button
                        onClick={() => onOpenAnalysis(expr.id)}
                        title="Calculus Analysis (Roots, Domain, Range, Asymptotes)"
                        className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                          isDarkTheme
                            ? 'text-zinc-400 hover:text-[#1DB954] hover:bg-zinc-800'
                            : 'text-zinc-500 hover:text-[#1DB954] hover:bg-zinc-100'
                        }`}
                      >
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                      {onOpenTable && (
                        <button
                          onClick={() => onOpenTable(expr.id)}
                          title="Table of Values (x vs f(x))"
                          className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                            isDarkTheme
                              ? 'text-zinc-400 hover:text-[#1DB954] hover:bg-zinc-800'
                              : 'text-zinc-500 hover:text-[#1DB954] hover:bg-zinc-100'
                          }`}
                        >
                          <TableIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onOpenIntegral && (
                        <button
                          onClick={() => onOpenIntegral(expr.id)}
                          title="Definite Integral & Riemann Sums"
                          className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                            isDarkTheme
                              ? 'text-zinc-400 hover:text-[#1DB954] hover:bg-zinc-800'
                              : 'text-zinc-500 hover:text-[#1DB954] hover:bg-zinc-100'
                          }`}
                        >
                          <Sigma className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={() => onDuplicateExpression(expr.id)}
                    title="Duplicate Expression"
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                      isDarkTheme
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUpdateExpression(expr.id, { visible: !expr.visible })}
                    title={expr.visible ? 'Hide Graph' : 'Show Graph'}
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                      isDarkTheme
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {expr.visible ? <Eye className="w-3.5 h-3.5 text-[#1DB954]" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                  </button>

                  <button
                    onClick={() => onDeleteExpression(expr.id)}
                    title="Delete Expression"
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${
                      isDarkTheme
                        ? 'text-zinc-400 hover:text-[#1DB954] hover:bg-zinc-800'
                        : 'text-zinc-500 hover:text-[#1DB954] hover:bg-zinc-100'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Custom Settings Panel - Mobile Responsive Grid & Compact Padding */}
              {isCustomizing && (
                <div className={`mb-2.5 p-2 sm:p-2.5 rounded-lg space-y-2 text-xs min-w-0 border ${
                  isDarkTheme ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                }`}>
                  {/* Label */}
                  <div>
                    <label className={`text-[10px] font-medium block mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Custom Label/Name
                    </label>
                    <input
                      type="text"
                      value={expr.label || ''}
                      onChange={(e) => onUpdateExpression(expr.id, { label: e.target.value })}
                      placeholder="e.g. Parabola / Conic"
                      className={`w-full rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1DB954] border ${
                        isDarkTheme
                          ? 'bg-zinc-950 border-zinc-700/80 text-white'
                          : 'bg-white border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>

                  {/* Line Style & Thickness */}
                  <div className="grid grid-cols-2 gap-2 min-w-0">
                    <div className="min-w-0">
                      <label className={`text-[10px] font-medium block mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Line Style
                      </label>
                      <select
                        value={expr.lineStyle || 'solid'}
                        onChange={(e) =>
                          onUpdateExpression(expr.id, {
                            lineStyle: e.target.value as LineStyleType,
                          })
                        }
                        className={`w-full text-[11px] px-1.5 py-1 rounded border focus:outline-none focus:border-[#1DB954] truncate ${
                          isDarkTheme
                            ? 'bg-zinc-950 text-zinc-300 border-zinc-700/80'
                            : 'bg-white text-zinc-800 border-zinc-300'
                        }`}
                      >
                        <option value="solid">Solid (━)</option>
                        <option value="dashed">Dashed (╌)</option>
                        <option value="dotted">Dotted (┈)</option>
                      </select>
                    </div>

                    <div className="min-w-0">
                      <label className={`text-[10px] font-medium block mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Thickness
                      </label>
                      <select
                        value={expr.lineWidth || 2.5}
                        onChange={(e) =>
                          onUpdateExpression(expr.id, {
                            lineWidth: parseFloat(e.target.value),
                          })
                        }
                        className={`w-full text-[11px] px-1.5 py-1 rounded border focus:outline-none focus:border-[#1DB954] truncate ${
                          isDarkTheme
                            ? 'bg-zinc-950 text-zinc-300 border-zinc-700/80'
                            : 'bg-white text-zinc-800 border-zinc-300'
                        }`}
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
                    <label className={`text-[10px] font-medium block mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Color Palette
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => onUpdateExpression(expr.id, { color: c })}
                          className={`w-5 h-5 rounded-full transition transform hover:scale-125 ${
                            expr.color === c ? 'ring-2 ring-[#1DB954] scale-110' : ''
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Expression Input Field - With min-w-0 to prevent flex item blowout */}
              {expr.type === 'parametric' ? (
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs font-mono flex-shrink-0 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      x(t) =
                    </span>
                    <input
                      type="text"
                      value={expr.parametricX || ''}
                      onFocus={() => setActiveInputId(expr.id)}
                      onChange={(e) => onUpdateExpression(expr.id, { parametricX: e.target.value })}
                      placeholder="3 * cos(t)"
                      className={`min-w-0 flex-1 border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#1DB954] ${
                        isDarkTheme
                          ? 'bg-zinc-900 border-zinc-700/80 text-white'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs font-mono flex-shrink-0 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                      y(t) =
                    </span>
                    <input
                      type="text"
                      value={expr.parametricY || ''}
                      onFocus={() => setActiveInputId(expr.id)}
                      onChange={(e) => onUpdateExpression(expr.id, { parametricY: e.target.value })}
                      placeholder="3 * sin(t)"
                      className={`min-w-0 flex-1 border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#1DB954] ${
                        isDarkTheme
                          ? 'bg-zinc-900 border-zinc-700/80 text-white'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs font-mono font-bold flex-shrink-0 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
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
                      className={`min-w-0 flex-1 border rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#1DB954] ${
                        isDarkTheme
                          ? 'bg-zinc-900 border-zinc-700/80 text-white'
                          : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* LaTeX Render Preview & Quick Summary */}
              {expr.rawText && (
                <div className={`mt-2 pt-2 border-t flex items-center justify-between gap-2 text-xs min-w-0 ${
                  isDarkTheme ? 'border-zinc-800/80' : 'border-zinc-200'
                }`}>
                  <div className="truncate min-w-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    {expr.label && (
                      <span className="text-[10px] text-[#1DB954] font-semibold uppercase flex-shrink-0">
                        {expr.label}:
                      </span>
                    )}
                    <KaTeXRenderer
                      latex={getLatexString()}
                      className={`font-serif ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-800'}`}
                    />
                  </div>

                  {analysis && analysis.isEvaluatable && (
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono flex-shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-[#006241]/20 text-[#1DB954] border border-[#1DB954]/30">
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
