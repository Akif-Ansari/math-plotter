'use client';

import React from 'react';
import { MathExpression, MathFunctionType, LineStyleType, AnalysisResult } from '@/types/math';
import KaTeXRenderer from './KaTeXRenderer';
import Dropdown, { DropdownOption } from './Dropdown';
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  BarChart2,
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

const FUNCTION_TYPE_OPTIONS: DropdownOption<MathFunctionType>[] = [
  { value: 'cartesian', label: 'y = f(x)', description: 'Standard Cartesian' },
  { value: 'implicit', label: 'Implicit', description: 'F(x, y) = 0 Relation' },
  { value: 'x_of_y', label: 'x = f(y)', description: 'Horizontal Cartesian' },
  { value: 'polar', label: 'r = f(θ)', description: 'Polar Coordinates' },
  { value: 'parametric', label: 'Parametric', description: 'x(t), y(t) Curve' },
];

const LINE_STYLE_OPTIONS: DropdownOption<LineStyleType>[] = [
  { value: 'solid', label: 'Solid (━)' },
  { value: 'dashed', label: 'Dashed (╌)' },
  { value: 'dotted', label: 'Dotted (┈)' },
];

const LINE_WIDTH_OPTIONS: DropdownOption<number>[] = [
  { value: 1.5, label: 'Thin (1.5px)' },
  { value: 2.5, label: 'Normal (2.5px)' },
  { value: 4, label: 'Thick (4.0px)' },
  { value: 6, label: 'Bold (6.0px)' },
];

const PRESET_COLORS = [
  '#1DB954', // Electric Green
  '#006241', // Forest Emerald
  '#3B82F6', // Cobalt Blue
  '#EF4444', // Crimson Red
  '#8B5CF6', // Vivid Violet
  '#F59E0B', // Amber Gold
  '#EC4899', // Hot Pink
  '#06B6D4', // Cyan Sky
  '#F97316', // Sunset Orange
  '#14B8A6', // Teal
  '#6366F1', // Indigo
  '#A855F7', // Magenta
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
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });
  const [editingSettingsId, setEditingSettingsId] = React.useState<string | null>(null);

  if (isCollapsed) {
    return (
      <aside className={`w-12 sm:w-14  flex flex-col items-center py-3 sm:py-4 z-10 shadow-xl select-none flex-shrink-0 transition-colors duration-200 ${isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
        <button
          onClick={() => setIsCollapsed(false)}
          title="Expand Expression Panel"
          className={`p-1.5 sm:p-2 rounded-md transition cursor-pointer mb-3 sm:mb-4 ${isDarkTheme
            ? "bg-[#212121]  text-white"
            : "bg-[#fafafa]  text-black"
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
    <aside className={`w-full sm:w-80 md:w-96 border-r flex flex-col h-full z-10 shadow-xl select-none min-w-0 max-w-full overflow-hidden transition-colors duration-200 
      ${isDarkTheme ?
        'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
      {/* Sidebar Header */}
      <div className={`p-2.5 sm:p-3.5  flex items-center justify-between min-w-0 `}>

        <h2 className={`font-semibold text-sm sm:text-base ${isDarkTheme ? 'text-white' : 'text-black/90'}`}>
          Expressions
        </h2>


        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onAddExpression}
            className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold bg-[#1DB954] hover:bg-[#18a349] text-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-sm transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>

          <button
            onClick={() => setIsCollapsed(true)}
            title="Collapse Sidebar"
            className={`p-1 sm:p-1.5 rounded-lg transition cursor-pointer ${isDarkTheme ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customizable Expression List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 pt-0 space-y-2.5 sm:space-y-3 min-w-0">
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
              className={`p-2.5 sm:p-3 rounded-lg  transition-all min-w-0  ${activeInputId === expr.id
                ? isDarkTheme
                  ? 'border-black/80 bg-[#212121]'
                  : 'border border-[#1DB954] bg-white'
                : isDarkTheme
                  ? 'border-zinc-800 bg-zinc-950/60 '
                  : 'border border-[#ebebeb] bg-white '
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
                  <div className="w-24 sm:w-28 flex-shrink-0">
                    <Dropdown<MathFunctionType>
                      value={expr.type}
                      onChange={(newType) =>
                        onUpdateExpression(expr.id, { type: newType })
                      }
                      options={FUNCTION_TYPE_OPTIONS}
                      isDarkTheme={isDarkTheme}
                      size="xs"
                      variant="compact"
                      fullWidth
                    />
                  </div>

                  <span className={`text-[10px] font-mono px-1 py-0.5 rounded border flex-shrink-0 ${isDarkTheme ? 'text-zinc-500 bg-zinc-900/80 border-zinc-800' : 'text-zinc-600 bg-zinc-100 border-zinc-200'
                    }`}>
                    #{index + 1}
                  </span>
                </div>

                {/* Right: Actions (Customize, Analysis, Table, Integral, Duplicate, Visibility, Delete) */}
                <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-end">
                  <button
                    onClick={() => setEditingSettingsId(isCustomizing ? null : expr.id)}
                    title="Customize Styling & Label"
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isCustomizing
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
                        className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isDarkTheme
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
                          className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isDarkTheme
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
                          className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isDarkTheme
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
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isDarkTheme
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onUpdateExpression(expr.id, { visible: !expr.visible })}
                    title={expr.visible ? 'Hide Graph' : 'Show Graph'}
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isDarkTheme
                      ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                  >
                    {expr.visible ? <Eye className="w-3.5 h-3.5 text-[#1DB954]" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
                  </button>

                  <button
                    onClick={() => onDeleteExpression(expr.id)}
                    title="Delete Expression"
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 flex items-center justify-center rounded transition cursor-pointer ${isDarkTheme
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
                <div className={`mb-2.5 p-2 sm:p-2.5 rounded-lg space-y-2 text-xs min-w-0 border ${isDarkTheme ? 'bg-zinc-900/90 border-zinc-800 text-zinc-200' : 'bg-zinc-50 border-zinc-200 text-zinc-800'
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
                      className={`w-full rounded px-2 py-1 text-xs focus:outline-none focus:border-[#1DB954] border ${isDarkTheme
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
                      <Dropdown<LineStyleType>
                        value={expr.lineStyle || 'solid'}
                        onChange={(val) =>
                          onUpdateExpression(expr.id, { lineStyle: val })
                        }
                        options={LINE_STYLE_OPTIONS}
                        isDarkTheme={isDarkTheme}
                        size="xs"
                        variant="compact"
                        fullWidth
                      />
                    </div>

                    <div className="min-w-0">
                      <label className={`text-[10px] font-medium block mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        Thickness
                      </label>
                      <Dropdown<number>
                        value={expr.lineWidth || 2.5}
                        onChange={(val) =>
                          onUpdateExpression(expr.id, { lineWidth: val })
                        }
                        options={LINE_WIDTH_OPTIONS}
                        isDarkTheme={isDarkTheme}
                        size="xs"
                        variant="compact"
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* Preset Swatches */}
                  <div>
                    <label className={`text-[10px] font-medium block mb-1.5 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Color Palette
                    </label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {PRESET_COLORS.map((c) => {
                        const isSelected = expr.color.toLowerCase() === c.toLowerCase();
                        return (
                          <button
                            key={c}
                            onClick={() => onUpdateExpression(expr.id, { color: c })}
                            title={`Select color ${c}`}
                            className={`w-5 h-5 rounded-full transition transform hover:scale-125 cursor-pointer flex-shrink-0 ${isSelected
                              ? isDarkTheme
                                ? 'ring-2 ring-white ring-offset-1 ring-offset-zinc-900 scale-110'
                                : 'ring-2 ring-zinc-900 ring-offset-1 ring-offset-white scale-110'
                              : 'opacity-85 hover:opacity-100'
                              }`}
                            style={{ backgroundColor: c }}
                          />
                        );
                      })}
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
                      className={`min-w-0 flex-1 border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#1DB954] ${isDarkTheme
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
                      className={`min-w-0 flex-1 border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-[#1DB954] ${isDarkTheme
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
                      className={`min-w-0 flex-1 border rounded px-2.5 py-1 text-xs font-mono focus:outline-none focus:border-[#1DB954] ${isDarkTheme
                        ? 'bg-zinc-900 border-zinc-700/80 text-white'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        }`}
                    />
                  </div>
                </div>
              )}

              {/* LaTeX Render Preview & Quick Summary */}
              {expr.rawText && (
                <div className={`mt-2 pt-2 border-t flex items-center justify-between gap-2 text-xs min-w-0 ${isDarkTheme ? 'border-zinc-800/80' : 'border-zinc-200'
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
