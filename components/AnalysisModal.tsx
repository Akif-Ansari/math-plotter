'use client';

import React from 'react';
import { AnalysisResult } from '@/types/math';
import KaTeXRenderer from './KaTeXRenderer';
import { X, CheckCircle2, AlertCircle, Compass, Hash, ArrowUpRight, Spline, Info } from 'lucide-react';

interface AnalysisModalProps {
  analysis: AnalysisResult | null;
  expressionColor?: string;
  onClose: () => void;
}

export default function AnalysisModal({
  analysis,
  expressionColor = '#1DB954',
  onClose,
}: AnalysisModalProps) {
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shadow-sm flex-shrink-0"
              style={{ backgroundColor: expressionColor }}
            />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 truncate">
                Function Calculus Analysis
              </h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 font-mono mt-0.5 truncate">
                y = {analysis.rawText}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-6">
          {!analysis.isEvaluatable ? (
            <div className="p-3 sm:p-4 bg-[#006241]/20 border border-[#1DB954]/30 rounded-xl text-[#1DB954] text-xs sm:text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#1DB954]" />
              <span>{analysis.error || 'Cannot analyze function.'}</span>
            </div>
          ) : (
            <>
              {/* LaTeX Preview */}
              <div className="p-3 sm:p-4 bg-zinc-950/80 rounded-xl border border-zinc-800/80 flex items-center justify-center overflow-x-auto">
                <KaTeXRenderer
                  latex={`f(x) = ${analysis.rawText}`}
                  displayMode
                  className="text-base sm:text-lg text-white"
                />
              </div>

              {/* Notation Guide Banner */}
              <div className="p-2.5 sm:p-3 bg-[#006241]/20 border border-[#1DB954]/30 rounded-xl text-xs text-[#1DB954] flex items-start gap-2">
                <Info className="w-4 h-4 text-[#1DB954] mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-[11px] sm:text-xs">Interval Bound Notation Guide:</span>
                  <div className="mt-0.5 text-[10px] sm:text-[11px] text-zinc-300">
                    <code className="text-[#1DB954] font-bold">[</code> or <code className="text-[#1DB954] font-bold">]</code> = <strong>Closed bound</strong> (value included in domain/range).<br />
                    <code className="text-[#1DB954] font-bold">(</code> or <code className="text-[#1DB954] font-bold">)</code> = <strong>Open bound</strong> (value excluded, infinity, or asymptote). E.g. <code className="text-[#1DB954]">Range = [-∞, 3)</code> means 3 is an open bound.
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                {/* Domain */}
                <div className="p-4 bg-zinc-800/40 rounded-xl border border-zinc-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                    <Compass className="w-4 h-4 text-[#1DB954]" />
                    Domain
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    Domain = {analysis.domain}
                  </div>
                </div>

                {/* Range */}
                <div className="p-4 bg-zinc-800/40 rounded-xl border border-zinc-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                    <ArrowUpRight className="w-4 h-4 text-[#1DB954]" />
                    Range
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    {analysis.range}
                  </div>
                </div>

                {/* Root Count */}
                <div className="p-4 bg-zinc-800/40 rounded-xl border border-zinc-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                    <Hash className="w-4 h-4 text-[#1DB954]" />
                    Number of Roots
                  </div>
                  <div className="text-2xl font-black text-[#1DB954]">
                    {analysis.rootCount}
                  </div>
                </div>

                {/* Y-Intercept */}
                <div className="p-4 bg-zinc-800/40 rounded-xl border border-zinc-800 flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />
                    Y-Intercept
                  </div>
                  <div className="text-base font-bold text-[#1DB954] font-mono">
                    {analysis.yIntercept ? `(0, ${analysis.yIntercept.y})` : 'None'}
                  </div>
                </div>
              </div>

              {/* Roots List */}
              <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Roots / X-Intercepts ({analysis.roots.length})</span>
                  <span className="text-[#1DB954] font-mono text-[10px]">f(x) = 0</span>
                </h3>
                {analysis.roots.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No real roots found in current viewport.</p>
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
              <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Asymptotes ({analysis.asymptotes.length})
                </h3>
                {analysis.asymptotes.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic">No asymptotes detected in current viewport.</p>
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
                <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Spline className="w-4 h-4 text-[#1DB954]" />
                    <div>
                      <div className="text-xs font-semibold text-zinc-400">First Derivative f'(x)</div>
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
