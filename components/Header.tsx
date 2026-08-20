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
  },
  {
    value: 'calculus',
    label: 'Calculus & Polynomials',
    description: 'Cubic & quadratic roots/extrema',
    icon: <FunctionSquare className="w-4 h-4 text-emerald-400" />,
  },
  {
    value: 'asymptotes',
    label: 'Rational & Asymptotes',
    description: '1/x, tan(x), & rational poles',
    icon: <InfinityIcon className="w-4 h-4 text-cyan-400" />,
  },
  {
    value: 'polar',
    label: 'Polar Curves & Roses',
    description: 'Cardioids, roses, & spirals',
    icon: <Orbit className="w-4 h-4 text-violet-400" />,
  },
  {
    value: 'fourier',
    label: 'Wave Harmonics & Fourier',
    description: 'Fundamental & harmonic summation',
    icon: <Activity className="w-4 h-4 text-blue-400" />,
  },
  {
    value: 'growth',
    label: 'Exponential & Logistic',
    description: 'eˣ, ln(x), & sigmoid curves',
    icon: <TrendingUp className="w-4 h-4 text-amber-400" />,
  },
  {
    value: 'physics',
    label: 'Damped Oscillations',
    description: 'Underdamped wave & envelopes',
    icon: <Zap className="w-4 h-4 text-rose-400" />,
  },
  {
    value: 'statistics',
    label: 'Probability Distributions',
    description: 'Gaussian bell curve & Cauchy',
    icon: <BarChart3 className="w-4 h-4 text-indigo-400" />,
  },
  {
    value: 'parametric',
    label: 'Parametric & Lissajous',
    description: 'Lissajous knots & Astroid curves',
    icon: <Layers className="w-4 h-4 text-teal-400" />,
  },
  {
    value: 'conics',
    label: 'Conics & Circles',
    description: 'Parametric ellipse & Parabola',
    icon: <CircleDot className="w-4 h-4 text-emerald-400" />,
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
