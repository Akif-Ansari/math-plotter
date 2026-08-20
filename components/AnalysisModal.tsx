'use client';

import React from 'react';
import { AnalysisResult, PointCalculusReport } from '@/types/math';
import KaTeXRenderer from './KaTeXRenderer';
import { analyzePointCalculus } from '@/lib/math-engine/analysis';
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

  // Compute point calculus report whenever rawText or testPoint changes
  const testPoint = parseFloat(testPointStr);
  const isValidPoint = !isNaN(testPoint) && Number.isFinite(testPoint);

  const pointReport: PointCalculusReport | null = React.useMemo(() => {
    if (!analysis || !isValidPoint) return null;
    return analyzePointCalculus(analysis.rawText, testPoint);
  }, [analysis, isValidPoint, testPoint]);

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 ${
        isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Modal Header */}
        <div className={`p-3.5 sm:p-5 border-b flex items-center justify-between ${
          isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
        }`}>
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0"
              style={{ backgroundColor: expressionColor }}
            />
            <div className="min-w-0">
              <h2 className={`text-sm sm:text-base font-bold flex items-center gap-2 truncate ${
                isDarkTheme ? 'text-white' : 'text-zinc-900'
              }`}>
                Function Calculus Analysis
              </h2>
              <p className={`text-[11px] sm:text-xs font-mono mt-0.5 truncate ${
                isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                y = {analysis.rawText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 sm:p-1.5 rounded-lg transition cursor-pointer flex-shrink-0 ${
              isDarkTheme ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
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
              <div className={`p-3 sm:p-4 rounded-xl border flex items-center justify-center overflow-x-auto ${
                isDarkTheme ? 'bg-zinc-950/80 border-zinc-800/80 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}>
                <KaTeXRenderer
                  latex={`f(x) = ${analysis.rawText}`}
                  displayMode
                  className={`text-base sm:text-lg ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}
                />
              </div>

              {/* Point Continuity, Limit & Differentiability Inspector */}
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#1DB954]" />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${
                      isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'
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
                        className={`px-2 py-1 text-xs font-mono transition cursor-pointer ${
                          isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
                        }`}
                      >
                        -1
                      </button>
                      <input
                        type="number"
                        step="any"
                        value={testPointStr}
                        onChange={(e) => setTestPointStr(e.target.value)}
                        className={`w-20 px-2 py-1 text-center text-xs font-mono focus:outline-none ${
                          isDarkTheme ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900'
                        }`}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => setTestPointStr((prev) => (parseFloat(prev || '0') + 1).toString())}
                        className={`px-2 py-1 text-xs font-mono transition cursor-pointer ${
                          isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-800'
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
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${
                          testPoint === cp.x
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
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${
                          testPoint === r.x
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
                      <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                        isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
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
                      <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                        isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
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
                      <div className={`p-3 rounded-lg border flex flex-col justify-between ${
                        isDarkTheme ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
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
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${
                    isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <Compass className="w-4 h-4 text-[#1DB954]" />
                    Domain
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    Domain = {analysis.domain}
                  </div>
                </div>

                {/* Range */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${
                    isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <ArrowUpRight className="w-4 h-4 text-[#1DB954]" />
                    Range
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    {analysis.range}
                  </div>
                </div>

                {/* Root Count */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${
                    isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                  }`}>
                    <Hash className="w-4 h-4 text-[#1DB954]" />
                    Number of Roots
                  </div>
                  <div className="text-2xl font-black text-[#1DB954]">
                    {analysis.rootCount}
                  </div>
                </div>

                {/* Y-Intercept */}
                <div className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isDarkTheme ? 'bg-zinc-800/40 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${
                    isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
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
              <div className={`p-4 rounded-xl border ${
                isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 flex items-center justify-between ${
                  isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
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
              <div className={`p-4 rounded-xl border ${
                isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
              }`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                  isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
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

              {/* Symbolic Derivative */}
              {analysis.derivativeText && (
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDarkTheme ? 'bg-zinc-800/30 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Spline className="w-4 h-4 text-[#1DB954]" />
                    <div>
                      <div className={`text-xs font-semibold ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                        First Derivative f&apos;(x)
                      </div>
                      <div className="text-xs font-mono text-[#1DB954] mt-0.5">{analysis.derivativeText}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

