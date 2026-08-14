'use client';

import React, { useMemo } from 'react';
import { MathExpression, IntegralConfig } from '@/types/math';
import { compileExpression } from '@/lib/math-engine/parser';
import { X, Layers, Activity, Check } from 'lucide-react';

interface IntegralControlModalProps {
  expressions: MathExpression[];
  config: IntegralConfig;
  onChangeConfig: (config: IntegralConfig) => void;
  onClose: () => void;
  parameters?: Record<string, number>;
}

export default function IntegralControlModal({
  expressions,
  config,
  onChangeConfig,
  onClose,
  parameters = {},
}: IntegralControlModalProps) {
  const visibleCartesian = useMemo(
    () => expressions.filter((e) => e.visible && e.type === 'cartesian'),
    [expressions]
  );

  const primaryExpr = visibleCartesian.find((e) => e.id === config.expressionId) || visibleCartesian[0];
  const secondaryExpr = visibleCartesian.find((e) => e.id === config.expressionId2);

  // Numerical Integration calculations
  const integrationData = useMemo(() => {
    if (!primaryExpr) {
      return { exact: 0, approx: 0, error: 0 };
    }

    const { evalFn: f1 } = compileExpression(primaryExpr.rawText, 'x', parameters);
    const { evalFn: f2 } = secondaryExpr ? compileExpression(secondaryExpr.rawText, 'x', parameters) : { evalFn: null };

    if (!f1) return { exact: 0, approx: 0, error: 0 };

    const getVal = (x: number) => {
      const v1 = f1(x);
      const v2 = f2 ? f2(x) : 0;
      if (!Number.isFinite(v1) || (f2 && !Number.isFinite(v2))) return 0;
      return v1 - v2;
    };

    const a = Math.min(config.a, config.b);
    const b = Math.max(config.a, config.b);
    const n = Math.max(1, config.n);
    const h = (b - a) / n;

    // 1. High precision Simpson's rule for 'Exact' reference
    const SAMPLES = 2000;
    const simpsonH = (b - a) / SAMPLES;
    let exactSum = getVal(a) + getVal(b);
    for (let i = 1; i < SAMPLES; i++) {
      const x = a + i * simpsonH;
      exactSum += getVal(x) * (i % 2 === 0 ? 2 : 4);
    }
    const exactVal = (exactSum * simpsonH) / 3;

    // 2. Selected Riemann Method approximation
    let approxVal = 0;
    if (config.method === 'exact') {
      approxVal = exactVal;
    } else if (config.method === 'left') {
      for (let i = 0; i < n; i++) {
        approxVal += getVal(a + i * h) * h;
      }
    } else if (config.method === 'right') {
      for (let i = 1; i <= n; i++) {
        approxVal += getVal(a + i * h) * h;
      }
    } else if (config.method === 'midpoint') {
      for (let i = 0; i < n; i++) {
        approxVal += getVal(a + (i + 0.5) * h) * h;
      }
    } else if (config.method === 'trapezoidal') {
      let trapSum = (getVal(a) + getVal(b)) / 2;
      for (let i = 1; i < n; i++) {
        trapSum += getVal(a + i * h);
      }
      approxVal = trapSum * h;
    }

    const err = Math.abs(approxVal - exactVal);
    return {
      exact: Number(exactVal.toFixed(4)),
      approx: Number(approxVal.toFixed(4)),
      error: Number(err.toFixed(4)),
    };
  }, [primaryExpr, secondaryExpr, config, parameters]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Definite Integral & Riemann Sums</h2>
              <p className="text-xs text-zinc-400">Visualize area under the curve & numerical integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Master Enable Switch */}
          <div className="flex items-center justify-between p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl">
            <div>
              <span className="font-semibold text-sm text-zinc-200">Show Integral Area Shading</span>
              <p className="text-xs text-zinc-400">Render definite integral bounds and Riemann rectangles on canvas</p>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, enabled: !config.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enabled ? 'bg-purple-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Function Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Function */}
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Primary Function f(x)
              </label>
              <select
                value={config.expressionId}
                onChange={(e) => onChangeConfig({ ...config, expressionId: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
              >
                {visibleCartesian.map((expr) => (
                  <option key={expr.id} value={expr.id}>
                    {expr.label ? `${expr.label} (${expr.rawText})` : `f(x) = ${expr.rawText}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Secondary Function (Area Between Curves) */}
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Subtract g(x) (Area Between Curves)
              </label>
              <select
                value={config.expressionId2 || ''}
                onChange={(e) =>
                  onChangeConfig({ ...config, expressionId2: e.target.value || null })
                }
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-purple-500"
              >
                <option value="">None (Integrate relative to X-Axis)</option>
                {visibleCartesian
                  .filter((e) => e.id !== config.expressionId)
                  .map((expr) => (
                    <option key={expr.id} value={expr.id}>
                      {expr.label ? `${expr.label} (${expr.rawText})` : `g(x) = ${expr.rawText}`}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Integration Bounds [a, b] */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Lower Bound (a)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.a}
                onChange={(e) => onChangeConfig({ ...config, a: parseFloat(e.target.value) || 0 })}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                Upper Bound (b)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.b}
                onChange={(e) => onChangeConfig({ ...config, b: parseFloat(e.target.value) || 0 })}
                className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg p-2.5 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Riemann Sum Method Selector */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-2">
              Integration & Approximation Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'exact', label: 'Exact Area' },
                { id: 'left', label: 'Left Sum' },
                { id: 'right', label: 'Right Sum' },
                { id: 'midpoint', label: 'Midpoint' },
                { id: 'trapezoidal', label: 'Trapezoid' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChangeConfig({ ...config, method: item.id as IntegralConfig['method'] })}
                  className={`p-2.5 rounded-lg text-xs font-medium border transition ${
                    config.method === item.id
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subintervals N Slider */}
          {config.method !== 'exact' && (
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs">
                <span className="font-medium text-zinc-300">Subintervals (N)</span>
                <span className="font-mono text-purple-400 font-bold">{config.n} rectangles</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={config.n}
                onChange={(e) => onChangeConfig({ ...config, n: parseInt(e.target.value) || 10 })}
                className="w-full accent-purple-500 cursor-pointer"
              />
            </div>
          )}

          {/* Live Calculation Results Card */}
          <div className="p-4 bg-purple-950/30 border border-purple-800/50 rounded-xl space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center text-purple-200">
              <span className="text-zinc-400">Definite Integral ∫ₐᵇ f(x) dx:</span>
              <span className="text-base font-bold text-purple-300">{integrationData.exact}</span>
            </div>
            {config.method !== 'exact' && (
              <>
                <div className="flex justify-between items-center text-zinc-300">
                  <span className="text-zinc-400">Riemann Sum Approximation ({config.method}):</span>
                  <span className="font-bold text-amber-300">{integrationData.approx}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Approximation Error |S_N - Exact|:</span>
                  <span className="text-rose-400 font-semibold">{integrationData.error}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end bg-zinc-950/50">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
}
