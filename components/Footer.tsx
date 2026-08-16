'use client';

import React from 'react';

interface FooterProps {
  isDarkTheme?: boolean;
}

export default function Footer({ isDarkTheme = true }: FooterProps) {
  return (
    <footer
      className={`hidden md:flex h-7 border-t px-4 items-center justify-between text-[11px] font-mono select-none z-20 transition-colors duration-200 ${
        isDarkTheme
          ? "bg-zinc-950 border-zinc-800/80 text-zinc-500"
          : "bg-white border-zinc-200 text-zinc-600"
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span>
            Math Plotter:
            <strong
              className={`font-semibold ${isDarkTheme ? "text-zinc-400" : "text-zinc-700"}`}
            >
              Custom Calculus &amp; Numerical Solver
            </strong>
          </span>
        </span>
      </div>
    </footer>
  );
}
