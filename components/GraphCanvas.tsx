'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MathExpression, Viewport, SnapPoint, AnalysisResult } from '@/types/math';
import { compileExpression, compile2DExpression, isImplicitEquation } from '@/lib/math-engine/parser';
import { analyzeFunction, findIntersections } from '@/lib/math-engine/analysis';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface GraphCanvasProps {
  expressions: MathExpression[];
  viewport: Viewport;
  onViewportChange: (newViewport: Viewport) => void;
  isDarkTheme: boolean;
  onAnalysisUpdate: (analyses: Record<string, AnalysisResult>) => void;
}

export default function GraphCanvas({
  expressions,
  viewport,
  onViewportChange,
  isDarkTheme,
  onAnalysisUpdate,
}: GraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastAnalysisRef = useRef<string>('');

  // Mouse interaction state
  const isDragging = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = useState<{
    screenX: number;
    screenY: number;
    mathX: number;
    mathY: number;
    snapPoint?: SnapPoint;
  } | null>(null);

  const [snapPoints, setSnapPoints] = useState<SnapPoint[]>([]);

  // Calculate snap points (Roots, Intercepts, Extrema, Asymptotes, Intersections)
  const computeAllSnapPoints = useCallback(() => {
    const points: SnapPoint[] = [];
    const analyses: Record<string, AnalysisResult> = {};

    const visibleExprs = expressions.filter((e) => e.visible);

    // 1. Analyze each function
    for (const expr of visibleExprs) {
      if (expr.type === 'cartesian') {
        const analysis = analyzeFunction(expr.id, expr.rawText, viewport);
        analyses[expr.id] = analysis;

        if (analysis.isEvaluatable) {
          // Roots
          analysis.roots.forEach((root) => {
            points.push({
              x: root.x,
              y: root.y,
              label: `Root: (${root.x}, ${root.y})`,
              type: 'root',
              color: expr.color,
              expressionId: expr.id,
            });
          });

          // Y-Intercept
          if (analysis.yIntercept) {
            points.push({
              x: analysis.yIntercept.x,
              y: analysis.yIntercept.y,
              label: `Y-Int: (${analysis.yIntercept.x}, ${analysis.yIntercept.y})`,
              type: 'y-intercept',
              color: expr.color,
              expressionId: expr.id,
            });
          }

          // Extrema
          analysis.extrema.forEach((ext) => {
            points.push({
              x: ext.x,
              y: ext.y,
              label: `Extrema: (${ext.x}, ${ext.y})`,
              type: 'extrema',
              color: expr.color,
              expressionId: expr.id,
            });
          });
        }
      }
    }

    // 2. Compute Intersections between pairs of visible cartesian functions
    for (let i = 0; i < visibleExprs.length; i++) {
      for (let j = i + 1; j < visibleExprs.length; j++) {
        const e1 = visibleExprs[i];
        const e2 = visibleExprs[j];
        if (e1.type === 'cartesian' && e2.type === 'cartesian') {
          const isects = findIntersections(e1, e2, viewport);
          isects.forEach((pt) => {
            points.push({
              x: pt.x,
              y: pt.y,
              label: `Intersection: (${pt.x}, ${pt.y})`,
              type: 'intersection',
              color: '#F59E0B',
            });
          });
        }
      }
    }

    setSnapPoints(points);

    // ONLY notify parent if analysis JSON has meaningfully changed!
    const currentAnalysisStr = JSON.stringify(analyses);
    if (currentAnalysisStr !== lastAnalysisRef.current) {
      lastAnalysisRef.current = currentAnalysisStr;
      onAnalysisUpdate(analyses);
    }
  }, [expressions, viewport, onAnalysisUpdate]);

  useEffect(() => {
    computeAllSnapPoints();
  }, [computeAllSnapPoints]);

  // Main Canvas Render Loop
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 600;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Color Palette based on theme
    const bg = isDarkTheme ? '#09090B' : '#F8FAFC';
    const gridMajor = isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)';
    const gridMinor = isDarkTheme ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
    const axisColor = isDarkTheme ? '#E4E4E7' : '#1E293B';
    const textColor = isDarkTheme ? '#A1A1AA' : '#64748B';

    // Clear Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    // Coordinate conversions
    const { xMin, xMax, yMin, yMax } = viewport;
    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;
    const toMathX = (sx: number) => xMin + (sx / width) * (xMax - xMin);
    const toMathY = (sy: number) => yMin + ((height - sy) / height) * (yMax - yMin);

    // 1. Draw Grid Lines & Ticks
    const calculateGridStep = (span: number) => {
      const targetTicks = 10;
      const rawStep = span / targetTicks;
      const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
      const residual = rawStep / magnitude;

      if (residual < 1.5) return magnitude;
      if (residual < 3.5) return 2 * magnitude;
      if (residual < 7.5) return 5 * magnitude;
      return 10 * magnitude;
    };

    const stepX = calculateGridStep(xMax - xMin);
    const stepY = calculateGridStep(yMax - yMin);
    const minorStepX = stepX / 5;
    const minorStepY = stepY / 5;

    // Draw Minor Grid
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = gridMinor;
    ctx.beginPath();
    const startMinorX = Math.floor(xMin / minorStepX) * minorStepX;
    for (let x = startMinorX; x <= xMax; x += minorStepX) {
      const sx = toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMinorY = Math.floor(yMin / minorStepY) * minorStepY;
    for (let y = startMinorY; y <= yMax; y += minorStepY) {
      const sy = toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Draw Major Grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = gridMajor;
    ctx.beginPath();
    const startMajorX = Math.floor(xMin / stepX) * stepX;
    for (let x = startMajorX; x <= xMax; x += stepX) {
      const sx = toScreenX(x);
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
    }
    const startMajorY = Math.floor(yMin / stepY) * stepY;
    for (let y = startMajorY; y <= yMax; y += stepY) {
      const sy = toScreenY(y);
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
    }
    ctx.stroke();

    // Draw Axes (X=0 and Y=0)
    const originX = toScreenX(0);
    const originY = toScreenY(0);

    ctx.lineWidth = 2;
    ctx.strokeStyle = axisColor;
    ctx.beginPath();
    // X Axis
    ctx.moveTo(0, Math.max(0, Math.min(height, originY)));
    ctx.lineTo(width, Math.max(0, Math.min(height, originY)));
    // Y Axis
    ctx.moveTo(Math.max(0, Math.min(width, originX)), 0);
    ctx.lineTo(Math.max(0, Math.min(width, originX)), height);
    ctx.stroke();

    // Numerical Axis Labels
    ctx.fillStyle = textColor;
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';

    // Label X Axis
    const labelYPos = Math.max(16, Math.min(height - 6, originY + 16));
    for (let x = startMajorX; x <= xMax; x += stepX) {
      if (Math.abs(x) > 1e-6) {
        const sx = toScreenX(x);
        if (sx > 20 && sx < width - 20) {
          ctx.fillText(x.toLocaleString('en-US', { maximumFractionDigits: 3 }), sx, labelYPos);
        }
      }
    }

    // Label Y Axis
    ctx.textAlign = 'right';
    const labelXPos = Math.max(24, Math.min(width - 8, originX - 6));
    for (let y = startMajorY; y <= yMax; y += stepY) {
      if (Math.abs(y) > 1e-6) {
        const sy = toScreenY(y);
        if (sy > 15 && sy < height - 15) {
          ctx.fillText(y.toLocaleString('en-US', { maximumFractionDigits: 3 }), labelXPos, sy + 4);
        }
      }
    }

    // Origin label '0'
    if (originX >= 0 && originX <= width && originY >= 0 && originY <= height) {
      ctx.fillText('0', originX - 6, originY + 14);
    }

    // 2. Render Functions
    expressions.forEach((expr) => {
      if (!expr.visible) return;

      ctx.save();
      ctx.strokeStyle = expr.color;
      ctx.lineWidth = expr.lineWidth || 2.5;

      if (expr.lineStyle === 'dashed') {
        ctx.setLineDash([8, 6]);
      } else if (expr.lineStyle === 'dotted') {
        ctx.setLineDash([3, 4]);
      } else {
        ctx.setLineDash([]);
      }

      // Check if expression is Implicit (e.g. y^2 = x, x^2 + y^2 = 25)
      const isImplicit =
        expr.type === 'implicit' ||
        (expr.type === 'cartesian' && isImplicitEquation(expr.rawText));

      if (isImplicit) {
        const { evalFn: eval2D } = compile2DExpression(expr.rawText);
        if (eval2D) {
          ctx.beginPath();
          const GRID_X = 180;
          const GRID_Y = 180;
          const dx = (xMax - xMin) / GRID_X;
          const dy = (yMax - yMin) / GRID_Y;

          for (let i = 0; i < GRID_X; i++) {
            for (let j = 0; j < GRID_Y; j++) {
              const x0 = xMin + i * dx;
              const x1 = x0 + dx;
              const y0 = yMin + j * dy;
              const y1 = y0 + dy;

              const v0 = eval2D(x0, y0);
              const v1 = eval2D(x1, y0);
              const v2 = eval2D(x1, y1);
              const v3 = eval2D(x0, y1);

              if (![v0, v1, v2, v3].every(Number.isFinite)) continue;

              const edges: { x: number; y: number }[] = [];
              if (Math.sign(v0) !== Math.sign(v1)) {
                const t = Math.abs(v0) / (Math.abs(v0) + Math.abs(v1) + 1e-9);
                edges.push({ x: x0 + t * dx, y: y0 });
              }
              if (Math.sign(v1) !== Math.sign(v2)) {
                const t = Math.abs(v1) / (Math.abs(v1) + Math.abs(v2) + 1e-9);
                edges.push({ x: x1, y: y0 + t * dy });
              }
              if (Math.sign(v2) !== Math.sign(v3)) {
                const t = Math.abs(v3) / (Math.abs(v2) + Math.abs(v3) + 1e-9);
                edges.push({ x: x0 + t * dx, y: y1 });
              }
              if (Math.sign(v3) !== Math.sign(v0)) {
                const t = Math.abs(v0) / (Math.abs(v0) + Math.abs(v3) + 1e-9);
                edges.push({ x: x0, y: y0 + t * dy });
              }

              if (edges.length >= 2) {
                ctx.moveTo(toScreenX(edges[0].x), toScreenY(edges[0].y));
                ctx.lineTo(toScreenX(edges[1].x), toScreenY(edges[1].y));
                if (edges.length === 4) {
                  ctx.moveTo(toScreenX(edges[2].x), toScreenY(edges[2].y));
                  ctx.lineTo(toScreenX(edges[3].x), toScreenY(edges[3].y));
                }
              }
            }
          }
          ctx.stroke();
        }
      } else if (expr.type === 'x_of_y') {
        const { evalFn } = compileExpression(expr.rawText, 'y');
        if (evalFn) {
          ctx.beginPath();
          let isPlotting = false;
          let prevMathX: number | null = null;

          for (let sy = -10; sy <= height + 10; sy += 1) {
            const mathY = toMathY(sy);
            const mathX = evalFn(mathY);

            const isValid = Number.isFinite(mathX) && !isNaN(mathX);

            if (isValid) {
              const sx = toScreenX(mathX);
              const clampedSx = Math.max(-width * 5, Math.min(width * 6, sx));

              const isAsymptoteJump =
                prevMathX !== null &&
                Math.sign(prevMathX) !== Math.sign(mathX) &&
                (Math.abs(prevMathX) > (xMax - xMin) * 0.3 || Math.abs(mathX) > (xMax - xMin) * 0.3);

              if (isAsymptoteJump) {
                ctx.moveTo(clampedSx, sy);
                isPlotting = true;
                prevMathX = isValid ? mathX : null;
                continue;
              }

              if (!isPlotting) {
                ctx.moveTo(clampedSx, sy);
                isPlotting = true;
              } else {
                ctx.lineTo(clampedSx, sy);
              }
            } else {
              isPlotting = false;
            }

            prevMathX = isValid ? mathX : null;
          }
          ctx.stroke();
        }
      } else if (expr.type === 'cartesian') {
        const { evalFn } = compileExpression(expr.rawText, 'x');
        if (evalFn) {
          ctx.beginPath();
          let isPlotting = false;
          let prevMathY: number | null = null;

          for (let sx = -10; sx <= width + 10; sx += 1) {
            const mathX = toMathX(sx);
            const mathY = evalFn(mathX);

            const isValid = Number.isFinite(mathY) && !isNaN(mathY);

            if (isValid) {
              const sy = toScreenY(mathY);

              // Clamp screen coordinate to allow smooth offscreen extension without clipping cutoff
              const clampedSy = Math.max(-height * 5, Math.min(height * 6, sy));

              // Check for asymptote jump across infinity (sign flip between large positive & negative values)
              const isAsymptoteJump =
                prevMathY !== null &&
                Math.sign(prevMathY) !== Math.sign(mathY) &&
                (Math.abs(prevMathY) > (yMax - yMin) * 0.3 || Math.abs(mathY) > (yMax - yMin) * 0.3);

              if (isAsymptoteJump) {
                ctx.moveTo(sx, clampedSy);
                isPlotting = true;
                prevMathY = isValid ? mathY : null;
                continue;
              }

              if (!isPlotting) {
                ctx.moveTo(sx, clampedSy);
                isPlotting = true;
              } else {
                ctx.lineTo(sx, clampedSy);
              }
            } else {
              isPlotting = false;
            }

            prevMathY = isValid ? mathY : null;
          }
          ctx.stroke();
        }
      } else if (expr.type === 'polar') {
        const { evalFn } = compileExpression(expr.rawText, 'theta');
        if (evalFn) {
          ctx.beginPath();
          let isPlotting = false;
          const thetaMax = 12 * Math.PI;
          const dTheta = 0.01;

          for (let theta = 0; theta <= thetaMax; theta += dTheta) {
            const r = evalFn(theta);
            if (Number.isFinite(r) && !isNaN(r)) {
              const x = r * Math.cos(theta);
              const y = r * Math.sin(theta);
              const sx = toScreenX(x);
              const sy = toScreenY(y);

              if (!isPlotting) {
                ctx.moveTo(sx, sy);
                isPlotting = true;
              } else {
                ctx.lineTo(sx, sy);
              }
            } else {
              isPlotting = false;
            }
          }
          ctx.stroke();
        }
      } else if (expr.type === 'parametric' && expr.parametricX && expr.parametricY) {
        const { evalFn: fnX } = compileExpression(expr.parametricX, 't');
        const { evalFn: fnY } = compileExpression(expr.parametricY, 't');
        if (fnX && fnY) {
          ctx.beginPath();
          let isPlotting = false;
          const tMin = expr.domainMin ?? -10;
          const tMax = expr.domainMax ?? 10;
          const dt = (tMax - tMin) / 600;

          for (let t = tMin; t <= tMax; t += dt) {
            const x = fnX(t);
            const y = fnY(t);
            if (Number.isFinite(x) && Number.isFinite(y)) {
              const sx = toScreenX(x);
              const sy = toScreenY(y);

              if (!isPlotting) {
                ctx.moveTo(sx, sy);
                isPlotting = true;
              } else {
                ctx.lineTo(sx, sy);
              }
            } else {
              isPlotting = false;
            }
          }
          ctx.stroke();
        }
      }

      ctx.restore();
    });

    // 3. Draw Snap Points (Roots, Y-Intercepts, Extrema, Intersections)
    snapPoints.forEach((pt) => {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);

      if (sx >= 0 && sx <= width && sy >= 0 && sy <= height) {
        ctx.save();

        let dotColor = pt.color || '#3B82F6';
        if (pt.type === 'root') dotColor = '#10B981';
        if (pt.type === 'extrema') dotColor = '#8B5CF6';
        if (pt.type === 'intersection') dotColor = '#F59E0B';

        ctx.fillStyle = dotColor;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = dotColor;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    });

    // 4. Draw Hover Highlight Cursor
    if (hoverInfo) {
      const { screenX, screenY, snapPoint } = hoverInfo;

      ctx.save();
      ctx.strokeStyle = isDarkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, height);
      ctx.moveTo(0, screenY);
      ctx.lineTo(width, screenY);
      ctx.stroke();

      if (snapPoint) {
        const spSx = toScreenX(snapPoint.x);
        const spSy = toScreenY(snapPoint.y);
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(spSx, spSy, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.restore();
  }, [viewport, expressions, snapPoints, hoverInfo, isDarkTheme]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const { xMin, xMax, yMin, yMax } = viewport;

    const mathX = xMin + (sx / width) * (xMax - xMin);
    const mathY = yMin + ((height - sy) / height) * (yMax - yMin);

    if (isDragging.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      const spanX = xMax - xMin;
      const spanY = yMax - yMin;

      const shiftX = -(dx / width) * spanX;
      const shiftY = (dy / height) * spanY;

      onViewportChange({
        xMin: xMin + shiftX,
        xMax: xMax + shiftX,
        yMin: yMin + shiftY,
        yMax: yMax + shiftY,
      });
      return;
    }

    const nearbySnap = snapPoints.find((pt) => {
      const spSx = ((pt.x - xMin) / (xMax - xMin)) * width;
      const spSy = height - ((pt.y - yMin) / (yMax - yMin)) * height;
      const dist = Math.hypot(spSx - sx, spSy - sy);
      return dist < 12;
    });

    setHoverInfo({
      screenX: sx,
      screenY: sy,
      mathX,
      mathY,
      snapPoint: nearbySnap,
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
    applyZoom(zoomFactor);
  };

  const applyZoom = (factor: number) => {
    const { xMin, xMax, yMin, yMax } = viewport;
    const centerX = (xMin + xMax) / 2;
    const centerY = (yMin + yMax) / 2;
    const halfSpanX = ((xMax - xMin) * factor) / 2;
    const halfSpanY = ((yMax - yMin) * factor) / 2;

    onViewportChange({
      xMin: centerX - halfSpanX,
      xMax: centerX + halfSpanX,
      yMin: centerY - halfSpanY,
      yMax: centerY + halfSpanY,
    });
  };

  return (
    <div className="relative flex-1 h-full w-full overflow-hidden bg-zinc-950 select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-crosshair block"
      />

      {/* Floating Viewport Coordinates & Hover Tooltip */}
      {hoverInfo && (
        <div
          className="absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-12 bg-zinc-900/90 backdrop-blur-md text-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-700/80 text-xs font-mono shadow-xl flex items-center gap-2"
          style={{
            left: `${hoverInfo.screenX}px`,
            top: `${hoverInfo.screenY}px`,
          }}
        >
          {hoverInfo.snapPoint ? (
            <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {hoverInfo.snapPoint.label}
            </div>
          ) : (
            <div>
              ({hoverInfo.mathX.toFixed(3)}, {hoverInfo.mathY.toFixed(3)})
            </div>
          )}
        </div>
      )}

      {/* On-Canvas Zoom & Navigation Toolbar */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => applyZoom(0.8)}
          title="Zoom In"
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl border border-zinc-700/80 shadow-lg backdrop-blur-md transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyZoom(1.25)}
          title="Zoom Out"
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl border border-zinc-700/80 shadow-lg backdrop-blur-md transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            onViewportChange({
              xMin: -10,
              xMax: 10,
              yMin: -10,
              yMax: 10,
            })
          }
          title="Reset Zoom Scale"
          className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl border border-zinc-700/80 shadow-lg backdrop-blur-md transition cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Axis Helper Indicator */}
      <div className="absolute top-4 right-6 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Move className="w-3 h-3 text-indigo-400" /> Pan / Scroll to Zoom
        </span>
        <span>
          X: [{viewport.xMin.toFixed(1)}, {viewport.xMax.toFixed(1)}]
        </span>
        <span>
          Y: [{viewport.yMin.toFixed(1)}, {viewport.yMax.toFixed(1)}]
        </span>
      </div>
    </div>
  );
}
