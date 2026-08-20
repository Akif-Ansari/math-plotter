'use client';

import React from 'react';
import { MathExpression, IntegralConfig } from '@/types/math';
import { compileExpression } from '@/lib/math-engine/parser';
import Dropdown, { DropdownOption } from './Dropdown';
import { X, Activity, Check } from 'lucide-react';

interface IntegralControlModalProps {
  expressions: MathExpression[];
  config: IntegralConfig;
  onChangeConfig: (config: IntegralConfig) => void;
  onClose: () => void;
  parameters?: Record<string, number>;
  isDarkTheme?: boolean;
}

export default function IntegralControlModal({
  expressions,
  config,
  onChangeConfig,
  onClose,
  parameters = {},
  isDarkTheme = true,
}: IntegralControlModalProps) {
  const visibleCartesian = React.useMemo(
    () => expressions.filter((e) => e.visible && e.type === 'cartesian'),
    [expressions]
  );

  const primaryExpr = visibleCartesian.find((e) => e.id === config.expressionId) || visibleCartesian[0];
  const secondaryExpr = visibleCartesian.find((e) => e.id === config.expressionId2);

  const primaryOptions: DropdownOption<string>[] = React.useMemo(
    () =>
      visibleCartesian.map((expr) => ({
        value: expr.id,
        label: expr.label ? `${expr.label} (${expr.rawText})` : `f(x) = ${expr.rawText}`,
        icon: (
          <span
            className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
            style={{ backgroundColor: expr.color }}
          />
        ),
      })),
    [visibleCartesian]
  );

  const secondaryOptions: DropdownOption<string>[] = React.useMemo(
    () => [
      { value: '', label: 'None (Integrate relative to X-Axis)' },
      ...visibleCartesian
        .filter((e) => e.id !== config.expressionId)
        .map((expr) => ({
          value: expr.id,
          label: expr.label ? `${expr.label} (${expr.rawText})` : `g(x) = ${expr.rawText}`,
          icon: (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: expr.color }}
            />
          ),
        })),
    ],
    [visibleCartesian, config.expressionId]
  );

  // Numerical Integration calculations
  const integrationData = React.useMemo(() => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div className={`border rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-colors duration-200 ${isDarkTheme ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
        }`}>
        {/* Modal Header */}
        <div className={`px-4 py-3 sm:px-6 sm:py-4 border-b flex items-center justify-between ${isDarkTheme ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 rounded-xl bg-[#006241]/20 border border-[#1DB954]/30 text-[#1DB954] flex-shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className={`text-base sm:text-lg font-bold truncate ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}>
                Definite Integral &amp; Riemann Sums
              </h2>
              <p className={`text-[11px] sm:text-xs truncate ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Visualize area under the curve &amp; numerical integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-lg transition flex-shrink-0 ${isDarkTheme ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Master Enable Switch */}
          <div className={`flex items-center justify-between p-4 border rounded-xl ${isDarkTheme ? 'bg-zinc-950/70 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
            }`}>
            <div>
              <span className={`font-semibold text-sm ${isDarkTheme ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Show Integral Area Shading
              </span>
              <p className={`text-xs ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Render definite integral bounds and Riemann rectangles on canvas
              </p>
            </div>
            <button
              onClick={() => onChangeConfig({ ...config, enabled: !config.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.enabled ? 'bg-[#1DB954]' : isDarkTheme ? 'bg-zinc-700' : 'bg-zinc-300'
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>

          {/* Function Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Function */}
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Primary Function f(x)
              </label>
              <Dropdown<string>
                value={config.expressionId}
                onChange={(val) => onChangeConfig({ ...config, expressionId: val })}
                options={primaryOptions}
                isDarkTheme={isDarkTheme}
                size="sm"
                fullWidth
              />
            </div>

            {/* Secondary Function (Area Between Curves) */}
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Subtract g(x) (Area Between Curves)
              </label>
              <Dropdown<string>
                value={config.expressionId2 || ''}
                onChange={(val) =>
                  onChangeConfig({ ...config, expressionId2: val || null })
                }
                options={secondaryOptions}
                isDarkTheme={isDarkTheme}
                size="sm"
                fullWidth
              />
            </div>
          </div>

          {/* Integration Bounds [a, b] */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Lower Bound (a)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.a}
                onChange={(e) => onChangeConfig({ ...config, a: parseFloat(e.target.value) || 0 })}
                className={`w-full border text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#1DB954] font-mono ${isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
              />
            </div>
            <div>
              <label className={`text-xs font-medium block mb-1.5 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
                Upper Bound (b)
              </label>
              <input
                type="number"
                step="0.5"
                value={config.b}
                onChange={(e) => onChangeConfig({ ...config, b: parseFloat(e.target.value) || 0 })}
                className={`w-full border text-xs rounded-lg p-2.5 focus:outline-none focus:border-[#1DB954] font-mono ${isDarkTheme ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-300 text-zinc-900'
                  }`}
              />
            </div>
          </div>

          {/* Riemann Sum Method Selector */}
          <div>
            <label className={`text-xs font-medium block mb-2 ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
              Integration &amp; Approximation Method
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
                  className={`p-2.5 rounded-lg text-xs font-medium border transition ${config.method === item.id
                    ? 'bg-[#006241] border-[#1DB954] text-white shadow-md'
                    : isDarkTheme
                      ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 border-zinc-300 text-zinc-700 hover:bg-zinc-200'
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
                <span className={`font-medium ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  Subintervals (N)
                </span>
                <span className="font-mono text-[#1DB954] font-bold">{config.n} rectangles</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={config.n}
                onChange={(e) => onChangeConfig({ ...config, n: parseInt(e.target.value) || 10 })}
                className="w-full accent-[#1DB954] cursor-pointer"
              />
            </div>
          )}

          {/* Live Calculation Results Card */}
          <div className={`p-4 rounded-xl space-y-2 font-mono text-xs border ${isDarkTheme ? 'bg-[#006241]/20 border-[#1DB954]/30' : 'bg-[#006241]/10 border-[#1DB954]/30'
            }`}>
            <div className="flex justify-between items-center text-[#1DB954]">
              <span className={isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}>Definite Integral ∫ₐᵇ f(x) dx:</span>
              <span className="text-base font-bold text-[#1DB954]">{integrationData.exact}</span>
            </div>
            {config.method !== 'exact' && (
              <>
                <div className={`flex justify-between items-center ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  <span className={isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}>Riemann Sum Approximation ({config.method}):</span>
                  <span className="font-bold text-[#1DB954]">{integrationData.approx}</span>
                </div>
                <div className={`flex justify-between items-center ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  <span>Approximation Error |S_N - Exact|:</span>
                  <span className="text-[#1DB954] font-semibold">{integrationData.error}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-end ${isDarkTheme ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
          }`}>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1DB954] hover:bg-[#18a349] text-black rounded-lg text-xs font-semibold transition cursor-pointer shadow-md shadow-[#1DB954]/20"
          >
            <Check className="w-4 h-4" />
            Apply &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
