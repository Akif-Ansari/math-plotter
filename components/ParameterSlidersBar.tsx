'use client';

import React from 'react';
import { Sliders, Play, Pause, RotateCcw } from 'lucide-react';

interface ParameterSlidersBarProps {
  parameters: Record<string, number>;
  onChangeParameter: (paramName: string, value: number) => void;
  onResetParameter: (paramName: string) => void;
  detectedParams: string[];
}

export default function ParameterSlidersBar({
  parameters,
  onChangeParameter,
  onResetParameter,
  detectedParams,
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
    <div className="absolute bottom-6 left-6 z-20 bg-zinc-900/95 backdrop-blur-md border border-indigo-500/40 text-zinc-100 p-4 rounded-2xl shadow-2xl font-mono text-xs w-80 space-y-3 animate-in fade-in duration-200">
      {/* Header & Animation Control */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2 font-bold text-indigo-400">
          <Sliders className="w-4 h-4" />
          <span>Dynamic Parameters</span>
        </div>
        <button
          onClick={() => setIsPlaying((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
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
            <div key={param} className="space-y-1 bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800">
              <div className="flex justify-between items-center text-[11px]">
                <span className="font-bold text-indigo-300">{param} =</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    {val}
                  </span>
                  <button
                    onClick={() => onResetParameter(param)}
                    title={`Reset ${param}`}
                    className="p-1 text-zinc-500 hover:text-white transition"
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
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
