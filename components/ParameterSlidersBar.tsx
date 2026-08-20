'use client';

import React from 'react';
import { Sliders, Play, Pause, RotateCcw } from 'lucide-react';

interface ParameterSlidersBarProps {
  parameters: Record<string, number>;
  onChangeParameter: (paramName: string, value: number) => void;
  onResetParameter: (paramName: string) => void;
  detectedParams: string[];
  isDarkTheme?: boolean;
}

export default function ParameterSlidersBar({
  parameters,
  onChangeParameter,
  onResetParameter,
  detectedParams,
  isDarkTheme = true,
}: ParameterSlidersBarProps) {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const animFrameRef = React.useRef<number | null>(null);
  const timeRef = React.useRef<number>(0);

  // Animation Loop for play/pause mode
  React.useEffect(() => {
    if (!isPlaying || detectedParams.length === 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const animate = () => {
      timeRef.current += 0.03;
      detectedParams.forEach((param, idx) => {
        // Offset phases slightly for multiple parameters
        const val = Number((5 * Math.sin(timeRef.current + idx * 1.5)).toFixed(2));
        onChangeParameter(param, val);
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, detectedParams, onChangeParameter]);

  if (detectedParams.length === 0) return null;

  return (
    <div className={`absolute bottom-4 left-3 sm:bottom-6 sm:left-6 z-20 backdrop-blur-md border p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl font-mono text-xs w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm space-y-2.5 sm:space-y-3 animate-in fade-in duration-200 ${isDarkTheme
      ? "bg-[#212121] border-b-[#333] text-white"
      : "bg-[#fafafa] border-b-[#ebebeb] text-black"
      }`}>
      {/* Header & Animation Control */}
      <div className={`flex items-center justify-between border-b pb-2 ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
        <div className="flex items-center gap-2 font-bold text-[#1DB954]">
          <Sliders className="w-4 h-4" />
          <span>Dynamic Parameters</span>
        </div>
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer ${isPlaying
            ? 'bg-[#006241]/30 text-[#1DB954] border border-[#1DB954]/40 animate-pulse'
            : 'bg-[#1DB954] hover:bg-[#18a349] text-black shadow-md shadow-[#1DB954]/20'
            }`}
        >
          {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isPlaying ? 'Pause' : 'Animate'}
        </button>
      </div>

      {/* Sliders List */}
      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
        {detectedParams.map((param) => {
          const val = parameters[param] !== undefined ? parameters[param] : 1;
          return (
            <div
              key={param}
              className={`space-y-1 p-2.5 rounded-xl border ${isDarkTheme ? 'bg-zinc-950/50 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                }`}
            >
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-[#1DB954]">{param} =</span>
                <div className="flex items-center gap-2">
                  <span className={`font-bold px-2 py-0.5 rounded border ${isDarkTheme ? 'text-white bg-zinc-800 border-zinc-700' : 'text-zinc-900 bg-white border-zinc-300 shadow-sm'
                    }`}>
                    {val}
                  </span>
                  <button
                    onClick={() => onResetParameter(param)}
                    title={`Reset ${param}`}
                    className={`p-1 transition ${isDarkTheme ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={val}
                onChange={(e) => onChangeParameter(param, parseFloat(e.target.value))}
                className={`w-full accent-[#1DB954] cursor-pointer h-1.5 rounded-lg ${isDarkTheme ? 'bg-zinc-800' : 'bg-zinc-200'
                  }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
