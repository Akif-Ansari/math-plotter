'use client';

import React from 'react';
import Dropdown, { DropdownOption } from './Dropdown';
import {
  RotateCcw,
  Download,
  Sun,
  Moon,
  Table as TableIcon,
  Sigma,
  MoreVertical,
  X,
  Sparkles,
  FunctionSquare,
  Waves,
  Infinity as InfinityIcon,
  Orbit,
  CircleDot,
  TrendingUp,
  Activity,
  BarChart3,
  Layers,
  Zap,
  Radio,
  Cpu,
  Atom,
  Repeat,
  Sliders,
} from 'lucide-react';

interface HeaderProps {
  onResetView: () => void;
  onSelectPreset: (presetName: string) => void;
  onExportImage: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenTable?: () => void;
  onOpenIntegral?: () => void;
}

const PRESET_OPTIONS: DropdownOption<string>[] = [
  {
    value: 'prompt',
    label: 'Standard Overview',
    description: 'Parabola, Sine Wave, & Polar Spiral',
    icon: <Waves className="w-4 h-4 text-[#1DB954]" />,
    subOptions: [
      { value: 'prompt:parabola', label: 'Parabola', description: 'y = x² - 2' },
      { value: 'prompt:sine', label: 'Sine Wave', description: 'y = 3 sin(2x)' },
      { value: 'prompt:spiral', label: 'Polar Spiral', description: 'r = 3θ' },
    ],
  },
  {
    value: 'calculus',
    label: 'Calculus & Polynomials',
    description: 'Cubic & quadratic roots/extrema',
    icon: <FunctionSquare className="w-4 h-4 text-emerald-400" />,
    subOptions: [
      { value: 'calculus:cubic', label: 'Cubic Curve', description: 'y = x³ - 3x' },
      { value: 'calculus:quadratic', label: 'Quadratic', description: 'y = x² - 4' },
      { value: 'calculus:secant', label: 'Secant Line', description: 'y = 2x - 2' },
    ],
  },
  {
    value: 'riemann',
    label: 'Riemann & Dirichlet',
    description: 'Sinc kernel & Dirichlet η waves',
    icon: <Sigma className="w-4 h-4 text-fuchsia-400" />,
    subOptions: [
      { value: 'riemann:sinc', label: 'Dirichlet Sinc Kernel', description: 'y = sin(πx)/(πx)' },
      { value: 'riemann:sinc_deriv', label: 'Sinc Derivative', description: 'y = (πx cos(πx) - sin(πx))/(πx²)' },
      { value: 'riemann:critical_strip', label: 'Dirichlet η Critical Wave', description: 'cos(x ln 2)/√2 - cos(x ln 3)/√3 + ...' },
    ],
  },
  {
    value: 'laplace',
    label: 'Laplace & System Dynamics',
    description: 'Double exponential & damping',
    icon: <Cpu className="w-4 h-4 text-sky-400" />,
    subOptions: [
      { value: 'laplace:double_exp', label: 'Laplace Distribution', description: 'y = 3e^(-|x|)' },
      { value: 'laplace:underdamped', label: 'Underdamped Response', description: 'y = 6x e^(-0.7x) sin(3x)' },
      { value: 'laplace:critically_damped', label: 'Critically Damped', description: 'y = 5x e^(-x)' },
      { value: 'laplace:overdamped', label: 'Overdamped Response', description: 'y = 4(e^(-0.3x) - e^(-1.5x))' },
    ],
  },
  {
    value: 'bessel',
    label: 'Bessel & Wave Optics',
    description: 'J₀, J₁ diffraction & standing waves',
    icon: <Radio className="w-4 h-4 text-teal-400" />,
    subOptions: [
      { value: 'bessel:j0', label: 'Bessel J₀ Diffraction', description: 'y = sin(x)/x' },
      { value: 'bessel:j1', label: 'Bessel J₁ 1st Order', description: 'y = (sin(x) - x cos(x))/x²' },
      { value: 'bessel:standing_wave', label: 'Standing Wave Nodes', description: 'y = 2 cos(3x) sin(2x)' },
    ],
  },
  {
    value: 'exotic',
    label: 'Transcendental & Butterfly',
    description: 'Butterfly curve & Lemniscate',
    icon: <Atom className="w-4 h-4 text-rose-400" />,
    subOptions: [
      { value: 'exotic:butterfly', label: 'Butterfly Curve (Fay)', description: 'r = e^(sin θ) - 2cos(4θ) + sin⁵(...)' },
      { value: 'exotic:lemniscate', label: 'Lemniscate of Bernoulli', description: 'r = 4√(|cos(2θ)|)' },
      { value: 'exotic:deltoid', label: 'Deltoid Hypocycloid', description: 'x = 2cos(t)+cos(2t), y = 2sin(t)-sin(2t)' },
    ],
  },
  {
    value: 'asymptotes',
    label: 'Rational & Asymptotes',
    description: '1/x, tan(x), & rational poles',
    icon: <InfinityIcon className="w-4 h-4 text-cyan-400" />,
    subOptions: [
      { value: 'asymptotes:hyperbola', label: 'Hyperbola (1/x)', description: 'y = 1 / x' },
      { value: 'asymptotes:tan', label: 'Tangent Curve', description: 'y = tan(x)' },
      { value: 'asymptotes:rational', label: 'Rational Function', description: 'y = (x² - 1)/(x² - 4)' },
    ],
  },
  {
    value: 'polar',
    label: 'Polar Curves & Roses',
    description: 'Cardioids, roses, & spirals',
    icon: <Orbit className="w-4 h-4 text-violet-400" />,
    subOptions: [
      { value: 'polar:cardioid', label: 'Cardioid', description: 'r = 2(1 - cos θ)' },
      { value: 'polar:rose', label: 'Rose 4-Petal', description: 'r = 3 sin(4θ)' },
      { value: 'polar:archimedes', label: 'Archimedean Spiral', description: 'r = 0.5θ' },
    ],
  },
  {
    value: 'fourier',
    label: 'Wave Harmonics & Fourier',
    description: 'Fundamental & harmonic summation',
    icon: <Activity className="w-4 h-4 text-blue-400" />,
    subOptions: [
      { value: 'fourier:fundamental', label: 'Fundamental Harmonic', description: 'y = 3 sin(x)' },
      { value: 'fourier:harmonic3', label: '3rd Harmonic', description: 'y = sin(3x)' },
      { value: 'fourier:harmonic5', label: '5th Harmonic', description: 'y = 0.6 sin(5x)' },
      { value: 'fourier:sum', label: 'Fourier Summation', description: 'y = 3sin(x) + sin(3x) + 0.6sin(5x)' },
    ],
  },
  {
    value: 'growth',
    label: 'Exponential & Logistic',
    description: 'eˣ, ln(x), & sigmoid curves',
    icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
    subOptions: [
      { value: 'growth:exp', label: 'Natural Exponential', description: 'y = e^x' },
      { value: 'growth:ln', label: 'Natural Logarithm', description: 'y = ln(x)' },
      { value: 'growth:sigmoid', label: 'Logistic Sigmoid', description: 'y = 6/(1 + e^(-x)) - 3' },
    ],
  },
  {
    value: 'physics',
    label: 'Damped Oscillations',
    description: 'Underdamped wave & envelopes',
    icon: <Zap className="w-4 h-4 text-rose-400" />,
    subOptions: [
      { value: 'physics:damped', label: 'Underdamped Oscillator', description: 'y = 4e^(-0.2x) cos(2x)' },
      { value: 'physics:upper_env', label: 'Upper Decay Envelope', description: 'y = 4e^(-0.2x)' },
      { value: 'physics:lower_env', label: 'Lower Decay Envelope', description: 'y = -4e^(-0.2x)' },
    ],
  },
  {
    value: 'statistics',
    label: 'Probability Distributions',
    description: 'Gaussian bell curve & Cauchy',
    icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
    subOptions: [
      { value: 'statistics:gaussian', label: 'Gaussian Normal Curve', description: 'y = 4e^(-x²/2)' },
      { value: 'statistics:cauchy', label: 'Cauchy Distribution', description: 'y = 4 / (1 + x²)' },
      { value: 'statistics:laplace', label: 'Laplace Distribution', description: 'y = 3e^(-|x|)' },
    ],
  },
  {
    value: 'parametric',
    label: 'Parametric & Lissajous',
    description: 'Lissajous knots & Astroid curves',
    icon: <Layers className="w-4 h-4 text-teal-400" />,
    subOptions: [
      { value: 'parametric:lissajous', label: 'Lissajous Knot (3:2)', description: 'x = 4sin(3t), y = 4cos(2t)' },
      { value: 'parametric:astroid', label: 'Astroid Curve', description: 'x = 3cos³(t), y = 3sin³(t)' },
    ],
  },
  {
    value: 'conics',
    label: 'Conics & Circles',
    description: 'Parametric ellipse & Parabola',
    icon: <CircleDot className="w-4 h-4 text-emerald-400" />,
    subOptions: [
      { value: 'conics:ellipse', label: 'Ellipse (5, 3)', description: 'x = 5cos(t), y = 3sin(t)' },
      { value: 'conics:parabola', label: 'Parabola', description: 'y = 0.25x² - 3' },
      { value: 'conics:hyperbola', label: 'Hyperbola Branch', description: 'y = √(x² + 4)' },
    ],
  },
  {
    value: 'periodic',
    label: 'Periodic & Repeating Waves',
    description: 'Square, Sawtooth, Beats & FM Waves',
    icon: <Repeat className="w-4 h-4 text-amber-400" />,
    subOptions: [
      { value: 'periodic:square', label: 'Fourier Square Wave', description: 'y = 3(sin x + sin(3x)/3 + ...)' },
      { value: 'periodic:sawtooth', label: 'Fourier Sawtooth Wave', description: 'y = 2(sin x - sin(2x)/2 + ...)' },
      { value: 'periodic:triangle', label: 'Fourier Triangle Wave', description: 'y = 3(sin x - sin(3x)/9 + ...)' },
      { value: 'periodic:beats', label: 'Acoustic Beats & Interference', description: 'y = 3cos(0.5x) sin(6x)' },
      { value: 'periodic:fm_synth', label: 'FM Synthesizer Waveform', description: 'y = 3sin(x + 2.5sin(4x))' },
      { value: 'periodic:secant', label: 'Periodic Secant Envelopes', description: 'y = sec(x)' },
    ],
  },
  {
    value: 'dynamic',
    label: 'Dynamic Animated Curves',
    description: 'Oscillating parameters (a, b, c) with Live Animation',
    icon: <Sliders className="w-4 h-4 text-[#1DB954]" />,
    subOptions: [
      { value: 'dynamic:sine', label: 'Animated Sine Wave (a, b)', description: 'y = a sin(b x)' },
      { value: 'dynamic:damped', label: 'Animated Damped Oscillation', description: 'y = a e^(-0.15x) cos(b x)' },
      { value: 'dynamic:interference', label: 'Animated Dual Wave Beats', description: 'y = a sin(x) + b cos(2x)' },
      { value: 'dynamic:gaussian', label: 'Animated Moving Gaussian', description: 'y = a e^(-(x-b)²/2)' },
      { value: 'dynamic:parabola', label: 'Animated Dynamic Parabola', description: 'y = a(x - b)² + c' },
    ],
  },
];

export default function Header({
  onResetView,
  onSelectPreset,
  onExportImage,
  isDarkTheme,
  onToggleTheme,
  onOpenTable,
  onOpenIntegral,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header
      className={`h-12 md:h-16 border-b px-3 md:px-4 flex items-center justify-between select-none z-20 transition-colors duration-200 ${isDarkTheme
        ? "bg-[#212121] border-b-[#333] text-white"
        : "bg-[#fafafa] border-b-[#ebebeb] text-black"
        }`}
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className={`font-bold text-base md:text-lg tracking-tight ${isDarkTheme
                ? "text-white"
                : "text-black"
                }`}
            >
              MathPlotter
            </h1>
          </div>
          <p
            className={`text-xs font-mono hidden md:block ${isDarkTheme ? "text-[#10B981]" : "text-black"}`}
          >
            Interactive Calculus &amp; Analytical Plotter
          </p>
        </div>
      </div>

      {/* Desktop Controls (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative w-56">
          <Dropdown
            options={PRESET_OPTIONS}
            placeholder="Load Preset..."
            icon={<Sparkles className="w-3.5 h-3.5" />}
            onChange={(val) => onSelectPreset(val)}
            isDarkTheme={isDarkTheme}
            size="sm"
            fullWidth
          />
        </div>

        {onOpenTable && (
          <button
            onClick={onOpenTable}
            title="Open Table of Values"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md  transition cursor-pointer ${isDarkTheme
              ? 'bg-[#333333] hover:bg-[#333333]/80 text-white'
              : 'bg-[#e2e2e2]/90 hover:bg-[#e8e8e8] text-black'
              }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="hidden lg:inline">Table of Values</span>
          </button>
        )}

        {onOpenIntegral && (
          <button
            onClick={onOpenIntegral}
            title="Configure Definite Integral &amp; Riemann Sums"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md  transition cursor-pointer ${isDarkTheme
              ? 'bg-[#333333] hover:bg-[#333333]/80 text-white'
              : 'bg-[#e2e2e2]/90 hover:bg-[#e8e8e8] text-black'
              }`}
          >
            <Sigma className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="hidden lg:inline">Definite Integral</span>
          </button>
        )}

        <button
          onClick={onResetView}
          title="Reset Viewport to Origin"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md  transition cursor-pointer ${isDarkTheme
            ? 'bg-[#333333] hover:bg-[#333333]/80 text-white'
            : 'bg-[#e2e2e2]/90 hover:bg-[#e8e8e8] text-black'
            }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset View</span>
        </button>

        <button
          onClick={onExportImage}
          title="Export Graph Image (PNG)"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#1DB954] hover:bg-[#18a349] text-white rounded-md transition cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Export PNG</span>
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle Canvas Theme"
          className={`p-2 rounded-md transition cursor-pointer ${isDarkTheme
            ? 'bg-[#333333] hover:bg-[#333333]/80 text-white'
            : 'bg-[#e2e2e2]/90 hover:bg-[#e8e8e8] text-black'
            }`}
        >
          {isDarkTheme ? (
            <Sun className="w-4 h-4 text-[#1DB954]" />
          ) : (
            <Moon className="w-4 h-4 text-[#1DB954]" />
          )}
        </button>
      </div>

      {/* Mobile Controls */}
      <div className="flex md:hidden items-center gap-1.5">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition cursor-pointer ${isDarkTheme
            ? "text-[#1DB954] hover:text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            : "text-[#1DB954] hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300"
            }`}
        >
          {isDarkTheme ? (
            <Sun className="w-4 h-4 text-[#1DB954]" />
          ) : (
            <Moon className="w-4 h-4 text-[#1DB954]" />
          )}
        </button>

        {/* Overflow menu button */}
        <button
          onClick={() => setMenuOpen(true)}
          className={`p-2 rounded-lg border transition cursor-pointer ${isDarkTheme
            ? "text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
            : "text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300"
            }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Overflow Menu Dropdown */}
      {
        menuOpen && (
          <div
            className="fixed inset-0 z-50 md:hidden"
            onClick={() => setMenuOpen(false)}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 animate-fade-in" />
            {/* Menu */}
            <div
              className={`absolute top-12 right-2 w-64 border rounded-xl shadow-2xl animate-slide-up ${isDarkTheme
                ? "bg-zinc-900 border-zinc-700 text-white"
                : "bg-white border-zinc-200 text-zinc-900"
                }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className={`flex items-center justify-between px-4 py-3 border-b ${isDarkTheme ? "border-zinc-800" : "border-zinc-200"
                  }`}
              >
                <span
                  className={`text-xs font-semibold ${isDarkTheme ? "text-zinc-300" : "text-zinc-800"}`}
                >
                  Tools &amp; Presets
                </span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-2 space-y-1">
                {/* Presets */}
                <div className="px-3 py-2">
                  <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
                    Presets
                  </label>
                  <Dropdown
                    options={PRESET_OPTIONS}
                    placeholder="Choose a preset…"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    onChange={(val) => {
                      onSelectPreset(val);
                      setMenuOpen(false);
                    }}
                    isDarkTheme={isDarkTheme}
                    size="sm"
                    fullWidth
                  />
                </div>

                {onOpenTable && (
                  <button
                    onClick={() => {
                      onOpenTable();
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition ${isDarkTheme
                      ? "text-zinc-200 hover:bg-zinc-800"
                      : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                  >
                    <TableIcon className="w-4 h-4 text-[#1DB954]" />
                    Table of Values
                  </button>
                )}

                {onOpenIntegral && (
                  <button
                    onClick={() => {
                      onOpenIntegral();
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition ${isDarkTheme
                      ? "text-zinc-200 hover:bg-zinc-800"
                      : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                  >
                    <Sigma className="w-4 h-4 text-[#1DB954]" />
                    Definite Integral
                  </button>
                )}

                <button
                  onClick={() => {
                    onResetView();
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition ${isDarkTheme
                    ? "text-zinc-200 hover:bg-zinc-800"
                    : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                >
                  <RotateCcw className="w-4 h-4 text-zinc-400" />
                  Reset View
                </button>

                <button
                  onClick={() => {
                    onExportImage();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-black font-semibold bg-[#1DB954] hover:bg-[#18a349] rounded-lg transition"
                >
                  <Download className="w-4 h-4" />
                  Export PNG
                </button>
              </div>
            </div>
          </div>
        )
      }
    </header >
  );
}
