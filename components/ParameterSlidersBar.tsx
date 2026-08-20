'use client';

import React from 'react';
import { Sliders, Play, Pause, Square, RotateCcw, FastForward, Minus, Plus } from 'lucide-react';

interface ParameterSlidersBarProps {
  parameters: Record<string, number>;
  onChangeParameter: (paramName: string, value: number) => void;
  onResetParameter: (paramName: string) => void;
  detectedParams: string[];
  isDarkTheme?: boolean;
}

const SPEED_PRESETS = [0.25, 0.5, 1, 2, 4];

export default function ParameterSlidersBar({
  parameters,
  onChangeParameter,
  onResetParameter,
  detectedParams,
  isDarkTheme = true,
}: ParameterSlidersBarProps) {
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [speed, setSpeed] = React.useState<number>(1);
  const animFrameRef = React.useRef<number | null>(null);
  const timeRef = React.useRef<number>(0);

  // Animation Loop for play/pause with dynamic speed scaling
  React.useEffect(() => {
    if (!isPlaying || detectedParams.length === 0) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const animate = () => {
      // 0.03 is base speed at 1x
      timeRef.current += 0.03 * speed;
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
  }, [isPlaying, detectedParams, speed, onChangeParameter]);

  const handleStop = () => {
    setIsPlaying(false);
    timeRef.current = 0;
  };

  const handleIncreaseSpeed = () => {
    setSpeed((prev) => {
      const next = prev < 1 ? prev + 0.25 : prev + 0.5;
      return Math.min(Number(next.toFixed(2)), 10);
    });
  };

  const handleDecreaseSpeed = () => {
    setSpeed((prev) => {
      const next = prev <= 1 ? Math.max(0.1, prev - 0.25) : prev - 0.5;
      return Math.max(0.1, Number(next.toFixed(2)));
    });
  };

  if (detectedParams.length === 0) return null;

  return (
    <div className={`absolute bottom-4 left-3 sm:bottom-6 sm:left-6 z-20 backdrop-blur-md border p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl font-mono text-xs w-[calc(100vw-1.5rem)] sm:w-84 max-w-sm space-y-2.5 sm:space-y-3 animate-in fade-in duration-200 ${isDarkTheme
      ? "bg-[#212121] border-b-[#333] text-white"
      : "bg-[#fafafa] border-b-[#ebebeb] text-black"
      }`}>
      {/* Header & Animation Start / Stop */}
      <div className={`flex items-center justify-between border-b pb-2 ${isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
        <div className="flex items-center gap-2 font-bold text-[#1DB954]">
          <Sliders className="w-4 h-4" />
          <span>Dynamic Parameters</span>
        </div>

        {/* Start / Pause / Stop Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsPlaying((prev) => !prev)}
            title={isPlaying ? 'Pause Animation' : 'Start Animation'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer ${isPlaying
              ? 'bg-[#006241]/35 text-[#1DB954] border border-[#1DB954]/50 animate-pulse'
              : 'bg-[#1DB954] hover:bg-[#18a349] text-black shadow-md shadow-[#1DB954]/20'
              }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {isPlaying ? 'Pause' : 'Start'}
          </button>

          {isPlaying && (
            <button
              type="button"
              onClick={handleStop}
              title="Stop Animation"
              className={`p-1.5 rounded-lg text-[11px] font-sans font-semibold transition cursor-pointer ${
                isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-rose-400' : 'bg-zinc-200 hover:bg-zinc-300 text-rose-600'
              }`}
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          )}
        </div>
      </div>

      {/* Speed Controls (Increase / Decrease & Presets) */}
      <div className={`p-2 rounded-xl border flex flex-col gap-1.5 ${
        isDarkTheme ? 'bg-zinc-950/60 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-sans font-medium text-zinc-400">
            <FastForward className="w-3.5 h-3.5 text-[#1DB954]" />
            <span>Speed:</span>
            <span className={`font-mono font-bold ${isDarkTheme ? 'text-white' : 'text-zinc-900'}`}>
              {speed}x
            </span>
          </div>

          {/* Slower (-) and Faster (+) Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDecreaseSpeed}
              title="Decrease Speed"
              className={`p-1 rounded transition cursor-pointer ${
                isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
              }`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleIncreaseSpeed}
              title="Increase Speed"
              className={`p-1 rounded transition cursor-pointer ${
                isDarkTheme ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'
              }`}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Quick Speed Preset Badges */}
        <div className="flex items-center gap-1">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setSpeed(preset)}
              className={`flex-1 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                speed === preset
                  ? 'bg-[#1DB954] text-black font-bold shadow-sm'
                  : isDarkTheme
                    ? 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-300'
              }`}
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>

      {/* Sliders List */}
      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
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
                    type="button"
                    onClick={() => onResetParameter(param)}
                    title={`Reset ${param}`}
                    className={`p-1 transition cursor-pointer ${isDarkTheme ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-900'}`}
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

