'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="hidden md:flex h-7 bg-zinc-950 border-t border-zinc-800/80 px-4 items-center justify-between text-[11px] text-zinc-500 font-mono select-none z-20">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954]" />
          <span>Math Engine: <strong className="text-zinc-400 font-semibold">Custom Calculus &amp; Numerical Solver</strong></span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-zinc-400">Interactive High-Precision Canvas</span>
      </div>
    </footer>
  );
}
