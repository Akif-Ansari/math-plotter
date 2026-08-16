'use client';

import React from 'react';
import { RotateCcw, Download, Sun, Moon, Table as TableIcon, Sigma, MoreVertical, X } from 'lucide-react';

interface HeaderProps {
  onResetView: () => void;
  onSelectPreset: (presetName: string) => void;
  onExportImage: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenTable?: () => void;
  onOpenIntegral?: () => void;
}

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
      className={`h-12 md:h-16 border-b px-3 md:px-4 flex items-center justify-between select-none z-20 transition-colors duration-200 ${
        isDarkTheme
          ? "bg-zinc-900 border-zinc-800 text-white"
          : "bg-white border-[#ebebeb] text-zinc-900"
      }`}
    >
      {/* Left: Branding */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1
              className={`font-bold text-base md:text-lg tracking-tight bg-clip-text text-transparent ${
                isDarkTheme
                  ? "bg-gradient-to-r from-white via-zinc-200 to-zinc-400"
                  : "bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600"
              }`}
            >
              MathPlotter
            </h1>
            <span
              className={`hidden sm:inline text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full ${isDarkTheme ? "bg-[#006241]/20 text-[#1DB954] border border-[#006241]/40" : "bg-[#1d8953] text-white border-none"} `}
            >
              Graphing Engine
            </span>
          </div>
          <p
            className={`text-xs font-mono hidden md:block ${isDarkTheme ? "text-zinc-400" : "text-black"}`}
          >
            Interactive Calculus &amp; Analytical Plotter
          </p>
        </div>
      </div>

      {/* Desktop Controls (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2">
        <div className="relative">
          <select
            onChange={(e) => e.target.value && onSelectPreset(e.target.value)}
            defaultValue=""
            className={`text-sm font-medium px-5 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#1DB954] cursor-pointer shadow-sm transition ${
              isDarkTheme
                ? "bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border-zinc-700"
                : "bg-zinc-100 hover:bg-zinc-200/85 text-zinc-800 border-zinc-300"
            }`}
          >
            <option value="" disabled>
              ✨ Load Function Presets...
            </option>
            <option value="prompt">
              Default Presets (Parabola, Sine, Spiral)
            </option>
            <option value="calculus">Calculus &amp; Roots (Polynomials)</option>
            <option value="asymptotes">
              Asymptotes &amp; Rational (1/x, tan x)
            </option>
            <option value="polar">Polar Curves (Cardioid &amp; Spirals)</option>
            <option value="conics">Conic Sections &amp; Circles</option>
          </select>
        </div>

        {onOpenTable && (
          <button
            onClick={onOpenTable}
            title="Open Table of Values"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
              isDarkTheme
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="hidden lg:inline">Table of Values</span>
          </button>
        )}

        {onOpenIntegral && (
          <button
            onClick={onOpenIntegral}
            title="Configure Definite Integral &amp; Riemann Sums"
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
              isDarkTheme
                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300"
            }`}
          >
            <Sigma className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="hidden lg:inline">Definite Integral</span>
          </button>
        )}

        <button
          onClick={onResetView}
          title="Reset Viewport to Origin"
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition cursor-pointer ${
            isDarkTheme
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-300"
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset View</span>
        </button>

        <button
          onClick={onExportImage}
          title="Export Graph Image (PNG)"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-[#1DB954] hover:bg-[#18a349] text-black rounded-lg transition cursor-pointer shadow-md shadow-[#1DB954]/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Export PNG</span>
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle Canvas Theme"
          className={`p-2 rounded-lg border transition cursor-pointer ${
            isDarkTheme
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
      </div>

      {/* Mobile Controls */}
      <div className="flex md:hidden items-center gap-1.5">
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg border transition cursor-pointer ${
            isDarkTheme
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
          className={`p-2 rounded-lg border transition cursor-pointer ${
            isDarkTheme
              ? "text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border-zinc-700"
              : "text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-zinc-300"
          }`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Overflow Menu Dropdown */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40 animate-fade-in" />
          {/* Menu */}
          <div
            className={`absolute top-12 right-2 w-64 border rounded-xl shadow-2xl animate-slide-up overflow-hidden ${
              isDarkTheme
                ? "bg-zinc-900 border-zinc-700 text-white"
                : "bg-white border-zinc-200 text-zinc-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-4 py-3 border-b ${
                isDarkTheme ? "border-zinc-800" : "border-zinc-200"
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
                <label className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  Presets
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onSelectPreset(e.target.value);
                      setMenuOpen(false);
                    }
                  }}
                  defaultValue=""
                  className={`mt-1 w-full text-xs px-3 py-2 rounded-lg border focus:outline-none focus:border-[#1DB954] ${
                    isDarkTheme
                      ? "bg-zinc-800 text-zinc-200 border-zinc-700"
                      : "bg-zinc-100 text-zinc-800 border-zinc-300"
                  }`}
                >
                  <option value="" disabled>
                    Choose a preset…
                  </option>
                  <option value="prompt">Parabola, Sine, Spiral</option>
                  <option value="calculus">Calculus &amp; Roots</option>
                  <option value="asymptotes">Asymptotes &amp; Rational</option>
                  <option value="polar">Polar Curves</option>
                  <option value="conics">Conic Sections</option>
                </select>
              </div>

              {onOpenTable && (
                <button
                  onClick={() => {
                    onOpenTable();
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition ${
                    isDarkTheme
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition ${
                    isDarkTheme
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs rounded-lg transition ${
                  isDarkTheme
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
      )}
    </header>
  );
}
