'use client';

import React from 'react';
import { RotateCcw, Download, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onResetView: () => void;
  onSelectPreset: (presetName: string) => void;
  onExportImage: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export default function Header({
  onResetView,
  onSelectPreset,
  onExportImage,
  isDarkTheme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 text-white px-4 flex items-center justify-between select-none shadow-lg z-20">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <span className="font-mono text-xl font-bold text-white">ƒ</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              MathPlotter
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Graphing Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-mono hidden sm:block">Interactive Calculus & Analytical Plotter</p>
        </div>
      </div>

      {/* Middle/Right: Controls & Presets */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            onChange={(e) => e.target.value && onSelectPreset(e.target.value)}
            defaultValue=""
            className="bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-medium px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
          >
            <option value="" disabled>
              ✨ Load Function Presets...
            </option>
            <option value="prompt">Default Presets (Parabola, Sine, Spiral)</option>
            <option value="calculus">Calculus & Roots (Polynomials)</option>
            <option value="asymptotes">Asymptotes & Rational (1/x, tan x)</option>
            <option value="polar">Polar Curves (Cardioid & Spirals)</option>
            <option value="conics">Conic Sections & Circles</option>
          </select>
        </div>

        <button
          onClick={onResetView}
          title="Reset Viewport to Origin"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700 transition cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Reset View</span>
        </button>

        <button
          onClick={onExportImage}
          title="Export Graph Image (PNG)"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer shadow-md shadow-indigo-600/20"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Export PNG</span>
        </button>

        <button
          onClick={onToggleTheme}
          title="Toggle Canvas Theme"
          className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition cursor-pointer"
        >
          {isDarkTheme ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
}
