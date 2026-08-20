'use client';

import React from 'react';
import { AnalysisResult, PointCalculusReport, NumericalRootResult } from '@/types/math';
import KaTeXRenderer from './KaTeXRenderer';
import { analyzePointCalculus, numericalBisection, numericalNewton, numericalSecant } from '@/lib/math-engine/analysis';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Compass,
  Hash,
  ArrowUpRight,
  Spline,
  Activity,
  Check,
  XCircle,
  TrendingUp,
  TrendingDown,
  GitCommitHorizontal,
  Calculator,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface AnalysisModalProps {
  analysis: AnalysisResult | null;
  expressionColor?: string;
  onClose: () => void;
  isDarkTheme?: boolean;
}

export default function AnalysisModal({
  analysis,
  expressionColor = '#1DB954',
  onClose,
  isDarkTheme = true,
}: AnalysisModalProps) {
  const [testPointStr, setTestPointStr] = React.useState<string>('0');
  // Numerical methods state
  const [numMethod, setNumMethod] = React.useState<'bisection' | 'newton' | 'secant'>('newton');
  const [numA, setNumA] = React.useState<string>('-2');
  const [numB, setNumB] = React.useState<string>('2');
  const [numX0, setNumX0] = React.useState<string>('1');
  const [numResult, setNumResult] = React.useState<NumericalRootResult | null>(null);
  const [showSteps, setShowSteps] = React.useState<boolean>(false);

  // Compute point calculus report whenever rawText or testPoint changes
  const testPoint = parseFloat(testPointStr);
  const isValidPoint = !isNaN(testPoint) && Number.isFinite(testPoint);

  const pointReport: PointCalculusReport | null = React.useMemo(() => {
    if (!analysis || !isValidPoint) return null;
    return analyzePointCalculus(analysis.rawText, testPoint);
  }, [analysis, isValidPoint, testPoint]);

  const runNumericalMethod = () => {
    if (!analysis) return;
    let result: NumericalRootResult;
    if (numMethod === 'bisection') {
      result = numericalBisection(analysis.rawText, parseFloat(numA), parseFloat(numB));
    } else if (numMethod === 'newton') {
      result = numericalNewton(analysis.rawText, parseFloat(numX0));
    } else {
      result = numericalSecant(analysis.rawText, parseFloat(numA), parseFloat(numB));
    }
    setNumResult(result);
    setShowSteps(false);
  };

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 ${isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
        {/* Modal Header */}
        <div className={`p-3.5 sm:p-5 border-b flex items-center justify-between ${isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0"
              style={{ backgroundColor: expressionColor }}
            />
            <div className="min-w-0">
              <h2 className={`text-sm sm:text-base font-bold flex items-center gap-2 truncate ${isDarkTheme ? 'text-white' : 'text-zinc-900'
                }`}>
                Function Calculus Analysis
              </h2>
              <p className={`text-[11px] sm:text-xs font-mono mt-0.5 truncate ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                y = {analysis.rawText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 sm:p-1.5 rounded-lg transition cursor-pointer flex-shrink-0 ${isDarkTheme ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
          {!analysis.isEvaluatable ? (
            <div className="p-3 sm:p-4 bg-[#006241]/20 border border-[#1DB954]/30 rounded-xl text-[#1DB954] text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#1DB954]" />
              <span>{analysis.error || 'Cannot analyze function.'}</span>
            </div>
          ) : (
            <>
              {/* LaTeX Preview */}
              <div className={`p-3 sm:p-4 rounded-xl border flex items-center justify-center overflow-x-auto ${isDarkTheme ? 'bg-zinc-950/80 border-zinc-800/80 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}>
                <KaTeXRenderer
                  latex={`f(x) = ${analysis.rawText}`}
                  displayMode
                  className={`text-base sm:text-lg ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}
                />
              </div>

              {/* Point Continuity, Limit & Differentiability Inspector */}
              <div className={`p-4 rounded-xl border space-y-3.5 ${isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#1DB954]" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'
                      }`}>
                      Point Continuity & Differentiability Inspector
                    </h3>
                  </div>

                  {/* Test Point Input */}
                  <div className="flex items-center gap-2">
                    <label className={`text-xs font-mono font-medium ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Test point x =
                    </label>
                    <div className="flex items-center rounded-lg border overflow-hidden border-zinc-700/50">
                      <button
                        type="button"
                        onClick={() => setTestPointStr((prev) => (parseFloat(prev || '0') - 1).toString())}
                        className={`px-2 py-1 text-xs font-mono transition cursor-pointer ${isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                          }`}
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={testPointStr}
                        onChange={(e) => setTestPointStr(e.target.value)}
                        className={`w-20 px-2 py-1 text-center text-xs font-mono focus:outline-none ${isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                          }`}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setTestPointStr((prev) => (parseFloat(prev || '0') + 1).toString())}
                        className={`px-2 py-1 text-xs font-mono transition cursor-pointer ${isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                          }`}
                      >
                        +1
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggested Critical / Discontinuity Points */}
                {((analysis.criticalPoints && analysis.criticalPoints.length > 0) || analysis.asymptotes.length > 0 || analysis.roots.length > 0) && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`text-[10px] uppercase font-semibold ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
                      Quick test points:
                    </span>
                    {analysis.criticalPoints?.map((cp, idx) => (
                      <button
                        key={`cp-${idx}`}
                        type="button"
                        onClick={() => setTestPointStr(cp.x.toString())}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${testPoint === cp.x
                            ? 'bg-[#1DB954] text-black border-[#1DB954] font-bold'
                            : isDarkTheme
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/50'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                      >
                        {cp.type === 'discontinuity' ? '⚡ ' : '📐 '}x = {cp.x} ({cp.type === 'discontinuity' ? 'Discontinuity' : 'Cusp/Corner'})
                      </button>
                    ))}
                    {analysis.roots.slice(0, 3).map((r, idx) => (
                      <button
                        key={`r-${idx}`}
                        type="button"
                        onClick={() => setTestPointStr(r.x.toString())}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${testPoint === r.x
                            ? 'bg-[#1DB954] text-black border-[#1DB954] font-bold'
                            : isDarkTheme
                              ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                              : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                          }`}
                      >
                        Root x = {r.x}
                      </button>
                    ))}
                  </div>
                )}

                {/* Point Report Display */}
                {pointReport && (
                  <div className="space-y-2.5 pt-1">
                    {/* 3 Status Cards in a Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* 1. Limit Analysis */}
                      <div className={`p-3 rounded-lg border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-semibold ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Limit at x → {pointReport.x}
                          </span>
                          {pointReport.limitExists ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/60">
                              <Check className="w-3 h-3" /> Exists
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800/60">
                              <XCircle className="w-3 h-3" /> DNE
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Left (x→{pointReport.x}⁻):</span>
                            <span className="font-semibold">{pointReport.leftLimit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Right (x→{pointReport.x}⁺):</span>
                            <span className="font-semibold">{pointReport.rightLimit}</span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-zinc-800/60 text-[#1DB954] font-bold">
                            <span>lim f(x):</span>
                            <span>{pointReport.limitValue}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Continuity Status */}
                      <div className={`p-3 rounded-lg border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-semibold ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Continuity at x = {pointReport.x}
                          </span>
                          {pointReport.isContinuous ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/60">
                              <Check className="w-3 h-3" /> Continuous
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-800/60">
                              <XCircle className="w-3 h-3" /> Discontinuous
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between font-mono">
                            <span className="text-zinc-500">f({pointReport.x}):</span>
                            <span className="font-semibold">{pointReport.fX}</span>
                          </div>
                          <div className="text-[11px] pt-1 border-t border-zinc-800/60">
                            {pointReport.isContinuous ? (
                              <span className="text-emerald-400 font-medium">lim f(x) = f({pointReport.x})</span>
                            ) : (
                              <span className="text-rose-400 font-medium leading-tight block">
                                {pointReport.discontinuityType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. Differentiability Status */}
                      <div className={`p-3 rounded-lg border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
                        }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-semibold ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                            Differentiability at x = {pointReport.x}
                          </span>
                          {pointReport.isDifferentiable ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/60">
                              <Check className="w-3 h-3" /> Differentiable
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-950/40 px-1.5 py-0.2 rounded border border-amber-800/60">
                              <XCircle className="w-3 h-3" /> Not Differentiable
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs font-mono">
                          {pointReport.leftDerivative && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">f&apos;₋({pointReport.x}):</span>
                              <span className="font-semibold">{pointReport.leftDerivative}</span>
                            </div>
                          )}
                          {pointReport.rightDerivative && (
                            <div className="flex justify-between">
                              <span className="text-zinc-500">f&apos;₊({pointReport.x}):</span>
                              <span className="font-semibold">{pointReport.rightDerivative}</span>
                            </div>
                          )}
                          <div className="text-[11px] font-sans pt-1 border-t border-zinc-800/60">
                            {pointReport.isDifferentiable ? (
                              <span className="text-emerald-400 font-medium">f&apos;({pointReport.x}) = {pointReport.leftDerivative}</span>
                            ) : (
                              <span className="text-amber-400 font-medium leading-tight block">
                                {pointReport.nonDiffReason}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                {/* Domain */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                    <Compass className="w-4 h-4 text-[#1DB954]" />
                    Domain
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    Domain = {analysis.domain}
                  </div>
                </div>

                {/* Range */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                    <ArrowUpRight className="w-4 h-4 text-[#1DB954]" />
                    Range
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    {analysis.range}
                  </div>
                </div>

                {/* Root Count */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                    <Hash className="w-4 h-4 text-[#1DB954]" />
                    Number of Roots
                  </div>
                  <div className="text-2xl font-black text-[#1DB954]">
                    {analysis.rootCount}
                  </div>
                </div>

                {/* Y-Intercept */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                    <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                    Y-Intercept
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    {analysis.yIntercept ? `(0, ${analysis.yIntercept.y})` : 'None'}
                  </div>
                </div>
              </div>

              {/* Roots List */}
              <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                  <span>Roots / X-Intercepts ({analysis.roots.length})</span>
                  <span className="text-[#1DB954] font-mono text-[10px]">f(x) = 0</span>
                </h3>
                {analysis.roots.length === 0 ? (
                  <p className={`text-xs italic ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    No real roots found in current viewport.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.roots.map((root, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#006241]/20 text-[#1DB954] border border-[#1DB954]/30 text-xs font-mono rounded-lg"
                      >
                        x = {root.x}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Asymptotes */}
              <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
                  }`}>
                  Asymptotes ({analysis.asymptotes.length})
                </h3>
                {analysis.asymptotes.length === 0 ? (
                  <p className={`text-xs italic ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    No asymptotes detected in current viewport.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.asymptotes.map((asymp, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-[#006241]/20 text-[#1DB954] border border-[#1DB954]/30 text-xs font-mono rounded-lg"
                      >
                        {asymp.type.toUpperCase()}: {asymp.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Inflection Points */}
              {analysis.inflectionPoints && analysis.inflectionPoints.length > 0 && (
                <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                    <span className="flex items-center gap-1.5">
                      <GitCommitHorizontal className="w-3.5 h-3.5 text-amber-400" />
                      Inflection Points ({analysis.inflectionPoints.length})
                    </span>
                    <span className={`text-[10px] font-mono ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>f&apos;&apos;(x) = 0</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.inflectionPoints.map((ip, i) => (
                      <div key={i} className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${ip.changeType === 'down-to-up'
                          ? isDarkTheme ? 'bg-sky-950/40 text-sky-300 border-sky-800/60' : 'bg-sky-50 text-sky-700 border-sky-200'
                          : isDarkTheme ? 'bg-amber-950/40 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                        <div className="font-bold">({ip.x}, {ip.y})</div>
                        <div className="text-[10px] opacity-70 mt-0.5">
                          {ip.changeType === 'down-to-up' ? '∩ → ∪ Concavity Up' : '∪ → ∩ Concavity Down'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Concavity Intervals */}
              {analysis.concavityIntervals && analysis.concavityIntervals.length > 0 && (
                <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center justify-between ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
                    }`}>
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                      Concavity Intervals
                    </span>
                    <span className={`text-[10px] font-mono ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>Sign of f&apos;&apos;(x)</span>
                  </h3>
                  <div className="space-y-1.5">
                    {analysis.concavityIntervals.map((ci, i) => (
                      <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-mono ${ci.direction === 'up'
                          ? isDarkTheme ? 'bg-sky-950/30 text-sky-300 border border-sky-900/50' : 'bg-sky-50 text-sky-700 border border-sky-200'
                          : isDarkTheme ? 'bg-amber-950/30 text-amber-300 border border-amber-900/50' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                        {ci.direction === 'up'
                          ? <TrendingUp className="w-3 h-3 flex-shrink-0" />
                          : <TrendingDown className="w-3 h-3 flex-shrink-0" />}
                        <span>{ci.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Numerical Methods Panel */}
              <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                  <Calculator className="w-3.5 h-3.5 text-[#1DB954]" />
                  Numerical Root-Finding Methods
                </h3>

                {/* Method Selector */}
                <div className="flex gap-1.5 mb-3">
                  {(['newton', 'bisection', 'secant'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setNumMethod(m); setNumResult(null); }}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-semibold capitalize transition cursor-pointer ${numMethod === m
                          ? 'bg-[#1DB954] text-black shadow-sm'
                          : isDarkTheme ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                        }`}
                    >
                      {m === 'newton' ? 'Newton-Raphson' : m === 'bisection' ? 'Bisection' : 'Secant'}
                    </button>
                  ))}
                </div>

                {/* Input Fields */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {numMethod === 'newton' ? (
                    <>
                      <label className={`text-[11px] font-mono ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>x₀ =</label>
                      <input
                        type="number"
                        step="any"
                        value={numX0}
                        onChange={(e) => setNumX0(e.target.value)}
                        className={`w-24 px-2 py-1 text-xs font-mono rounded-lg border focus:outline-none ${isDarkTheme ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                          }`}
                      />
                    </>
                  ) : (
                    <>
                      <label className={`text-[11px] font-mono ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {numMethod === 'bisection' ? 'a =' : 'x₀ ='}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={numA}
                        onChange={(e) => setNumA(e.target.value)}
                        className={`w-20 px-2 py-1 text-xs font-mono rounded-lg border focus:outline-none ${isDarkTheme ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                          }`}
                      />
                      <label className={`text-[11px] font-mono ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        {numMethod === 'bisection' ? 'b =' : 'x₁ ='}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={numB}
                        onChange={(e) => setNumB(e.target.value)}
                        className={`w-20 px-2 py-1 text-xs font-mono rounded-lg border focus:outline-none ${isDarkTheme ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-zinc-300 text-zinc-900'
                          }`}
                      />
                    </>
                  )}
                  <button
                    type="button"
                    onClick={runNumericalMethod}
                    className="px-3 py-1 bg-[#1DB954] hover:bg-[#18a349] text-black text-[11px] font-bold rounded-lg transition cursor-pointer shadow-sm"
                  >
                    Compute
                  </button>
                </div>

                {/* Method Description */}
                <p className={`text-[10px] italic mb-3 ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  {numMethod === 'bisection' && 'Requires f(a)·f(b) < 0. Halves the interval each step. Guaranteed convergence.'}
                  {numMethod === 'newton' && 'Uses tangent line: xₙ₊₁ = xₙ − f(xₙ)/f′(xₙ). Quadratic convergence near root.'}
                  {numMethod === 'secant' && 'Two-point approximation of Newton. No derivative needed but may diverge.'}
                </p>

                {/* Result */}
                {numResult && (
                  <div className={`space-y-2 border-t pt-3 ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'
                    }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      {numResult.converged ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-[#006241]/30 text-[#1DB954] border border-[#1DB954]/40 text-[11px] font-mono rounded-lg">
                          <Check className="w-3 h-3" /> Converged in {numResult.iterations} iterations
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-950/30 text-rose-400 border border-rose-800/50 text-[11px] font-mono rounded-lg">
                          <XCircle className="w-3 h-3" /> {numResult.error || 'Did not converge'}
                        </span>
                      )}
                      {numResult.root !== null && (
                        <span className={`text-[11px] font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'
                          }`}>
                          Root ≈ {numResult.root}
                        </span>
                      )}
                    </div>

                    {/* Iteration Table Toggle */}
                    {numResult.steps.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowSteps((s) => !s)}
                          className={`flex items-center gap-1 text-[11px] transition cursor-pointer ${isDarkTheme ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                            }`}
                        >
                          {showSteps ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                          {showSteps ? 'Hide' : 'Show'} iteration table ({numResult.steps.length} steps)
                        </button>
                        {showSteps && (
                          <div className="overflow-x-auto">
                            <table className={`w-full text-[10px] font-mono border-collapse ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'
                              }`}>
                              <thead>
                                <tr className={isDarkTheme ? 'text-zinc-500 border-b border-zinc-800' : 'text-zinc-400 border-b border-zinc-200'}>
                                  <th className="text-left py-1 pr-3">Iter</th>
                                  <th className="text-left py-1 pr-3">x</th>
                                  <th className="text-left py-1">f(x)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {numResult.steps.slice(0, 15).map((step) => (
                                  <tr key={step.iter} className={isDarkTheme ? 'border-b border-zinc-900 hover:bg-zinc-800/40' : 'border-b border-zinc-100 hover:bg-zinc-100'}>
                                    <td className="py-0.5 pr-3 text-zinc-500">{step.iter}</td>
                                    <td className="py-0.5 pr-3">{step.x}</td>
                                    <td className={`py-0.5 ${Math.abs(step.fx) < 1e-6 ? 'text-[#1DB954] font-bold' : ''
                                      }`}>{step.fx}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {numResult.steps.length > 15 && (
                              <p className={`text-[10px] mt-1 italic ${isDarkTheme ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                Showing first 15 of {numResult.steps.length} iterations.
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Symbolic Derivative */}
              {analysis.derivativeText && (
                <div className={`p-4 rounded-xl border ${isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <Spline className="w-4 h-4 text-[#1DB954]" />
                <div className={`text-xs font-semibold uppercase tracking-wider ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  First Derivative f&apos;(x)
                </div>
              </div>
              {/* d/dx notation display */}
              <div className={`flex items-center justify-center p-3 rounded-lg border overflow-x-auto ${isDarkTheme ? 'bg-zinc-950/70 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
              <KaTeXRenderer
                latex={`\\dfrac{d}{dx}\\!\\left(${analysis.rawText}\\right) = ${analysis.derivativeText}`}
                displayMode
                className={`text-sm ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}
              />
            </div>
          {/* Also show as plain monospace fallback below */}
          <div className={`mt-2 text-[11px] font-mono text-center ${isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}`}>
            f&apos;(x) = {analysis.derivativeText}
          </div>
        </div>
              )}
      </>
          )}
    </div>
      </div >
    </div >
  );
}

