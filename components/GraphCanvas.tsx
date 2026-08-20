'use client';

import React from 'react';
import { MathExpression, Viewport, SnapPoint, AnalysisResult, TangentInfo, IntegralConfig } from '@/types/math';
import { compileExpression, compile2DExpression, isImplicitEquation } from '@/lib/math-engine/parser';
import { analyzeFunction, findIntersections } from '@/lib/math-engine/analysis';
import { ZoomIn, ZoomOut, Maximize2, Move, Compass, Sigma } from 'lucide-react';

interface GraphCanvasProps {
  expressions: MathExpression[];
  viewport: Viewport;
  onViewportChange: (newViewport: Viewport) => void;
  isDarkTheme: boolean;
  onAnalysisUpdate: (analyses: Record<string, AnalysisResult>) => void;
  parameters?: Record<string, number>;
  integralConfig?: IntegralConfig;
  onOpenIntegralModal?: () => void;
}

export default function GraphCanvas({
  expressions,
  viewport,
  onViewportChange,
  isDarkTheme,
  onAnalysisUpdate,
  parameters = {},
  integralConfig,
  onOpenIntegralModal,
}: GraphCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const lastAnalysisRef = React.useRef<string>('');

  const viewportRef = React.useRef(viewport);
  React.useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const onViewportChangeRef = React.useRef(onViewportChange);
  React.useEffect(() => {
    onViewportChangeRef.current = onViewportChange;
  }, [onViewportChange]);

  // Mouse interaction state
  const isDragging = React.useRef(false);
  const lastMousePos = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverInfo, setHoverInfo] = React.useState<{
    screenX: number;
    screenY: number;
    mathX: number;
    mathY: number;
    snapPoint?: SnapPoint;
  } | null>(null);

  const [snapPoints, setSnapPoints] = React.useState<SnapPoint[]>([]);

  // Tangent Explorer state
  const [isTangentMode, setIsTangentMode] = React.useState<boolean>(false);
  const [tangentInfo, setTangentInfo] = React.useState<TangentInfo | null>(null);

  // Calculate snap points (Roots, Intercepts, Extrema, Asymptotes, Intersections)
  const computeAllSnapPoints = React.useCallback(() => {
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
              color: '#1DB954',
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
      setTimeout(() => {
        onAnalysisUpdate(analyses);
      }, 0);
    }
  }, [expressions, viewport, onAnalysisUpdate]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      computeAllSnapPoints();
    }, 40);
    return () => clearTimeout(timer);
  }, [computeAllSnapPoints]);

  // Main Canvas Render Loop
  const renderCanvas = React.useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 600;

      if (width === 0 || height === 0) return;

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
        const { evalFn: eval2D } = compile2DExpression(expr.rawText, parameters);
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
        const { evalFn } = compileExpression(expr.rawText, 'y', parameters);
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
        const { evalFn } = compileExpression(expr.rawText, 'x', parameters);
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
                Math.abs(prevMathY) > (yMax - yMin) * 0.4 &&
                Math.abs(mathY) > (yMax - yMin) * 0.4;

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
        const { evalFn } = compileExpression(expr.rawText, 'theta', parameters);
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
        const { evalFn: fnX } = compileExpression(expr.parametricX, 't', parameters);
        const { evalFn: fnY } = compileExpression(expr.parametricY, 't', parameters);
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

        let dotColor = pt.color || '#1DB954';
        if (pt.type === 'root') dotColor = '#1DB954';
        if (pt.type === 'extrema') dotColor = '#006241';
        if (pt.type === 'intersection') dotColor = '#1DB954';

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
        ctx.fillStyle = '#1DB954';
        ctx.beginPath();
        ctx.arc(spSx, spSy, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 5. Draw Tangent Line & Tangency Point Marker
    if (isTangentMode && tangentInfo) {
      ctx.save();
      const tColor = tangentInfo.expressionColor || '#F59E0B';
      ctx.strokeStyle = tColor;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 5]);

      const m = tangentInfo.slope;
      const c = tangentInfo.y - m * tangentInfo.x;

      const x1 = viewport.xMin;
      const y1 = m * x1 + c;
      const x2 = viewport.xMax;
      const y2 = m * x2 + c;

      const sx1 = toScreenX(x1);
      const sy1 = toScreenY(y1);
      const sx2 = toScreenX(x2);
      const sy2 = toScreenY(y2);

      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();

      // Point of Tangency
      const tangSx = toScreenX(tangentInfo.x);
      const tangSy = toScreenY(tangentInfo.y);

      if (tangSx >= -50 && tangSx <= width + 50 && tangSy >= -50 && tangSy <= height + 50) {
        ctx.fillStyle = tColor;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(tangSx, tangSy, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1.0;
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = tColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(tangSx, tangSy, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    }

    // 6. Draw Definite Integral Area & Riemann Sum Rectangles
    if (integralConfig?.enabled) {
      const primaryExpr = expressions.find((e) => e.id === integralConfig.expressionId && e.visible);
      const secondaryExpr = expressions.find((e) => e.id === integralConfig.expressionId2 && e.visible);

      if (primaryExpr) {
        const { evalFn: f1 } = compileExpression(primaryExpr.rawText, 'x', parameters);
        const { evalFn: f2 } = secondaryExpr ? compileExpression(secondaryExpr.rawText, 'x', parameters) : { evalFn: null };

        if (f1) {
          ctx.save();
          const a = Math.min(integralConfig.a, integralConfig.b);
          const b = Math.max(integralConfig.a, integralConfig.b);
          const getVal = (xVal: number) => {
            const v1 = f1(xVal);
            const v2 = f2 ? f2(xVal) : 0;
            if (!Number.isFinite(v1) || (f2 && !Number.isFinite(v2))) return 0;
            return v1 - v2;
          };

          const fillColor = 'rgba(168, 85, 247, 0.25)';
          const strokeColor = '#A855F7';

          if (integralConfig.method === 'exact') {
            ctx.fillStyle = fillColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.beginPath();

            const startSx = toScreenX(a);
            const startSy = toScreenY(0);
            ctx.moveTo(startSx, startSy);

            const steps = Math.max(100, Math.floor((b - a) * 25));
            const stepDx = (b - a) / steps;

            for (let i = 0; i <= steps; i++) {
              const xVal = a + i * stepDx;
              const yVal = getVal(xVal);
              const sx = toScreenX(xVal);
              const sy = toScreenY(yVal);
              ctx.lineTo(sx, sy);
            }

            const endSx = toScreenX(b);
            const endSy = toScreenY(0);
            ctx.lineTo(endSx, endSy);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            // Riemann Sum Discrete Rectangles / Trapezoids
            const n = Math.max(1, integralConfig.n);
            const h = (b - a) / n;

            for (let i = 0; i < n; i++) {
              const xLeft = a + i * h;
              const xRight = xLeft + h;

              if (integralConfig.method === 'trapezoidal') {
                const y1 = getVal(xLeft);
                const y2 = getVal(xRight);
                const sx1 = toScreenX(xLeft);
                const sx2 = toScreenX(xRight);
                const sy1 = toScreenY(y1);
                const sy2 = toScreenY(y2);
                const sy0 = toScreenY(0);

                ctx.fillStyle = fillColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(sx1, sy0);
                ctx.lineTo(sx1, sy1);
                ctx.lineTo(sx2, sy2);
                ctx.lineTo(sx2, sy0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
              } else {
                let sampleX = xLeft;
                if (integralConfig.method === 'right') sampleX = xRight;
                if (integralConfig.method === 'midpoint') sampleX = (xLeft + xRight) / 2;

                const rectY = getVal(sampleX);
                const sx1 = toScreenX(xLeft);
                const sx2 = toScreenX(xRight);
                const sy0 = toScreenY(0);
                const syTop = toScreenY(rectY);

                const rectWidth = sx2 - sx1;
                const rectHeight = sy0 - syTop;

                ctx.fillStyle = fillColor;
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1.5;
                ctx.fillRect(sx1, syTop, rectWidth, rectHeight);
                ctx.strokeRect(sx1, syTop, rectWidth, rectHeight);
              }
            }
          }

          ctx.restore();
        }
      }
    }

    ctx.restore();
  } catch (err) {
    console.error('Canvas render error:', err);
  }
  }, [viewport, expressions, snapPoints, hoverInfo, isDarkTheme, isTangentMode, tangentInfo, parameters, integralConfig]);

  // Schedule frame render with requestAnimationFrame
  React.useEffect(() => {
    const animId = requestAnimationFrame(() => {
      renderCanvas();
    });
    return () => cancelAnimationFrame(animId);
  }, [renderCanvas]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number | null = null;
    const scheduleRender = () => {
      if (animId !== null) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        renderCanvas();
      });
    };

    const handleResize = () => scheduleRender();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => {
      scheduleRender();
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
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

    // Compute Tangent Info if Tangent Explorer is active
    if (isTangentMode) {
      const activeCartesian = expressions.find((e) => e.visible && e.type === 'cartesian');
      if (activeCartesian) {
        const { evalFn } = compileExpression(activeCartesian.rawText, 'x', parameters);
        if (evalFn) {
          const yVal = evalFn(mathX);
          if (Number.isFinite(yVal) && !isNaN(yVal)) {
            const h = 0.0001;
            const y1 = evalFn(mathX - h);
            const y2 = evalFn(mathX + h);
            if (Number.isFinite(y1) && Number.isFinite(y2)) {
              const slope = (y2 - y1) / (2 * h);
              const c = yVal - slope * mathX;
              const angleDeg = (Math.atan(slope) * 180) / Math.PI;

              const mStr = slope.toFixed(3);
              const cAbsStr = Math.abs(c).toFixed(3);
              const signStr = c >= 0 ? '+' : '-';
              const eqStr = `y = ${mStr}x ${signStr} ${cAbsStr}`;

              setTangentInfo({
                expressionId: activeCartesian.id,
                expressionColor: activeCartesian.color,
                rawText: activeCartesian.rawText,
                x: Number(mathX.toFixed(3)),
                y: Number(yVal.toFixed(3)),
                slope: Number(slope.toFixed(3)),
                equation: eqStr,
                angleDegrees: Number(angleDeg.toFixed(1)),
              });
            }
          }
        }
      }
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

  // Helper to apply focal zoom & drag shift
  const applyFocalZoomAndPan = React.useCallback(
    (
      factor: number,
      focalScreenX: number,
      focalScreenY: number,
      shiftScreenX: number = 0,
      shiftScreenY: number = 0
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const width = canvas.clientWidth || 800;
      const height = canvas.clientHeight || 600;

      const { xMin, xMax, yMin, yMax } = viewportRef.current;

      const mathX = xMin + (focalScreenX / width) * (xMax - xMin);
      const mathY = yMin + ((height - focalScreenY) / height) * (yMax - yMin);

      const spanX = xMax - xMin;
      const spanY = yMax - yMin;

      const newSpanX = spanX * factor;
      const newSpanY = spanY * factor;

      const ratioX = (mathX - xMin) / spanX;
      const ratioY = (mathY - yMin) / spanY;

      const mathShiftX = -(shiftScreenX / width) * newSpanX;
      const mathShiftY = (shiftScreenY / height) * newSpanY;

      const nextXMin = mathX - ratioX * newSpanX + mathShiftX;
      const nextXMax = nextXMin + newSpanX;
      const nextYMin = mathY - ratioY * newSpanY + mathShiftY;
      const nextYMax = nextYMin + newSpanY;

      onViewportChangeRef.current({
        xMin: nextXMin,
        xMax: nextXMax,
        yMin: nextYMin,
        yMax: nextYMax,
      });
    },
    []
  );

  // Attach non-passive wheel, touch, and gesture listeners directly to canvas element
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchMode: 'none' | 'pan' | 'pinch' = 'none';
    let lastSingleTouch: { x: number; y: number } | null = null;
    let lastPinchDist: number | null = null;
    let lastPinchMidpoint: { x: number; y: number } | null = null;

    const handleWheelNative = (e: WheelEvent) => {
      if (e.cancelable) e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      let zoomFactor: number;
      if (e.ctrlKey) {
        // Trackpad pinch gesture in Chrome/Safari emits wheel event with e.ctrlKey = true
        zoomFactor = Math.pow(1.006, e.deltaY);
      } else {
        // Standard mouse wheel scrolling
        zoomFactor = e.deltaY < 0 ? 0.85 : 1.15;
      }

      zoomFactor = Math.max(0.7, Math.min(1.4, zoomFactor));
      applyFocalZoomAndPan(zoomFactor, sx, sy);
    };

    const handleTouchStartNative = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      if (e.touches.length === 1) {
        touchMode = 'pan';
        lastSingleTouch = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
        lastPinchDist = null;
        lastPinchMidpoint = null;
      } else if (e.touches.length >= 2) {
        touchMode = 'pinch';
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        lastPinchDist = dist;
        lastPinchMidpoint = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top,
        };
        lastSingleTouch = null;
      }
    };

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      const rect = canvas.getBoundingClientRect();

      if (e.touches.length === 1 && touchMode === 'pan' && lastSingleTouch) {
        const curX = e.touches[0].clientX - rect.left;
        const curY = e.touches[0].clientY - rect.top;
        const dx = curX - lastSingleTouch.x;
        const dy = curY - lastSingleTouch.y;
        lastSingleTouch = { x: curX, y: curY };

        applyFocalZoomAndPan(1.0, curX, curY, dx, dy);
      } else if (e.touches.length >= 2) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const currentMid = {
          x: (t1.clientX + t2.clientX) / 2 - rect.left,
          y: (t1.clientY + t2.clientY) / 2 - rect.top,
        };

        if (lastPinchDist && lastPinchDist > 0 && currentDist > 0) {
          let zoomFactor = lastPinchDist / currentDist;
          zoomFactor = Math.max(0.6, Math.min(1.6, zoomFactor));

          const shiftX = lastPinchMidpoint ? currentMid.x - lastPinchMidpoint.x : 0;
          const shiftY = lastPinchMidpoint ? currentMid.y - lastPinchMidpoint.y : 0;

          applyFocalZoomAndPan(zoomFactor, currentMid.x, currentMid.y, shiftX, shiftY);
        }

        lastPinchDist = currentDist;
        lastPinchMidpoint = currentMid;
      }
    };

    const handleTouchEndNative = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      if (e.touches.length === 0) {
        touchMode = 'none';
        lastSingleTouch = null;
        lastPinchDist = null;
        lastPinchMidpoint = null;
      } else if (e.touches.length === 1) {
        touchMode = 'pan';
        lastSingleTouch = {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        };
        lastPinchDist = null;
        lastPinchMidpoint = null;
      }
    };

    const handleGestureNative = (e: Event) => {
      if (e.cancelable) e.preventDefault();
    };

    // Passive: false is crucial so preventDefault stops page zoom
    canvas.addEventListener('wheel', handleWheelNative, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStartNative, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    canvas.addEventListener('touchend', handleTouchEndNative, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEndNative, { passive: false });
    canvas.addEventListener('gesturestart', handleGestureNative, { passive: false });
    canvas.addEventListener('gesturechange', handleGestureNative, { passive: false });
    canvas.addEventListener('gestureend', handleGestureNative, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheelNative);
      canvas.removeEventListener('touchstart', handleTouchStartNative);
      canvas.removeEventListener('touchmove', handleTouchMoveNative);
      canvas.removeEventListener('touchend', handleTouchEndNative);
      canvas.removeEventListener('touchcancel', handleTouchEndNative);
      canvas.removeEventListener('gesturestart', handleGestureNative);
      canvas.removeEventListener('gesturechange', handleGestureNative);
      canvas.removeEventListener('gestureend', handleGestureNative);
    };
  }, [applyFocalZoomAndPan]);

  const applyZoom = (factor: number) => {
    const canvas = canvasRef.current;
    const width = canvas?.clientWidth || 800;
    const height = canvas?.clientHeight || 600;
    applyFocalZoomAndPan(factor, width / 2, height / 2);
  };

  return (
    <div className={`relative flex-1 h-full w-full overflow-hidden select-none touch-none transition-colors duration-200 ${
      isDarkTheme ? 'bg-zinc-950' : 'bg-[#F8FAFC]'
    }`} style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-crosshair block touch-none"
        style={{ touchAction: 'none' }}
      />

      {/* Tangent Explorer Floating HUD Card */}
      {isTangentMode && tangentInfo && (
        <div className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-20 backdrop-blur-md border p-3 sm:p-4 rounded-xl shadow-2xl font-mono text-xs max-w-[calc(100vw-2rem)] sm:max-w-xs space-y-2 sm:space-y-2.5 animate-in fade-in duration-150 ${
          isDarkTheme
            ? 'bg-zinc-900/95 border-[#1DB954]/40 text-zinc-100'
            : 'bg-white/95 border-[#1DB954]/50 text-zinc-900 shadow-xl'
        }`}>
          <div className={`flex items-center justify-between border-b pb-1.5 sm:pb-2 ${
            isDarkTheme ? 'border-zinc-800' : 'border-zinc-200'
          }`}>
            <div className="flex items-center gap-2 font-bold text-[#1DB954]">
              <Compass className="w-4 h-4 text-[#1DB954]" />
              <span>Tangent &amp; Derivative</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-ping" />
          </div>
          <div className={`space-y-1.5 text-[11px] ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
            <div className="flex justify-between">
              <span className={isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}>Function:</span>
              <span className="font-semibold" style={{ color: tangentInfo.expressionColor }}>
                y = {tangentInfo.rawText}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}>Point (a, f(a)):</span>
              <span className={`font-semibold ${isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'}`}>
                ({tangentInfo.x}, {tangentInfo.y})
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}>Slope f&apos;(a):</span>
              <span className="font-bold text-[#1DB954]">{tangentInfo.slope}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}>Tangent Line:</span>
              <span className="font-semibold text-[#1DB954]">{tangentInfo.equation}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkTheme ? 'text-zinc-500' : 'text-zinc-400'}>Angle θ:</span>
              <span className="text-[#1DB954]">{tangentInfo.angleDegrees}°</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Viewport Coordinates & Hover Tooltip */}
      {hoverInfo && (
        <div
          className={`absolute z-10 pointer-events-none transform -translate-x-1/2 -translate-y-12 backdrop-blur-md px-3 py-1.5 rounded-lg border text-xs font-mono shadow-xl flex items-center gap-2 ${
            isDarkTheme
              ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100'
              : 'bg-white/95 border-zinc-300 text-zinc-900 shadow-md'
          }`}
          style={{
            left: `${hoverInfo.screenX}px`,
            top: `${hoverInfo.screenY}px`,
          }}
        >
          {hoverInfo.snapPoint ? (
            <div className="flex items-center gap-1.5 font-semibold text-[#1DB954]">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
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
      <div className="absolute bottom-4 right-3 sm:bottom-6 sm:right-6 flex flex-col gap-1.5 sm:gap-2 z-10">
        {onOpenIntegralModal && (
          <button
            onClick={onOpenIntegralModal}
            title="Configure Definite Integral & Riemann Sums"
            className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md transition cursor-pointer ${
              integralConfig?.enabled
                ? 'bg-[#006241]/30 border-[#1DB954] text-[#1DB954] shadow-[#1DB954]/10'
                : isDarkTheme
                  ? 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white'
                  : 'bg-white/90 hover:bg-zinc-100 border-zinc-200 text-zinc-800 hover:text-black shadow-md'
            }`}
          >
            <Sigma className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => {
            setIsTangentMode((prev) => !prev);
            if (isTangentMode) setTangentInfo(null);
          }}
          title={isTangentMode ? 'Disable Tangent Explorer' : 'Enable Tangent Explorer'}
          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md transition cursor-pointer ${
            isTangentMode
              ? 'bg-[#006241]/30 border-[#1DB954] text-[#1DB954] shadow-[#1DB954]/10'
              : isDarkTheme
                ? 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white'
                : 'bg-white/90 hover:bg-zinc-100 border-zinc-200 text-zinc-800 hover:text-black shadow-md'
          }`}
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyZoom(0.8)}
          title="Zoom In"
          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md transition cursor-pointer ${
            isDarkTheme
              ? 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white'
              : 'bg-white/90 hover:bg-zinc-100 border-zinc-200 text-zinc-800 hover:text-black shadow-md'
          }`}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => applyZoom(1.25)}
          title="Zoom Out"
          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md transition cursor-pointer ${
            isDarkTheme
              ? 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white'
              : 'bg-white/90 hover:bg-zinc-100 border-zinc-200 text-zinc-800 hover:text-black shadow-md'
          }`}
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
          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shadow-lg backdrop-blur-md transition cursor-pointer ${
            isDarkTheme
              ? 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700/80 text-zinc-200 hover:text-white'
              : 'bg-white/90 hover:bg-zinc-100 border-zinc-200 text-zinc-800 hover:text-black shadow-md'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Axis Helper Indicator */}
      <div className={`absolute top-3 right-3 sm:top-4 sm:right-6 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border text-[10px] sm:text-[11px] font-mono flex items-center gap-2 sm:gap-3 ${
        isDarkTheme
          ? 'bg-zinc-900/80 border-zinc-800 text-zinc-400'
          : 'bg-white/90 border-zinc-200 text-zinc-600 shadow-sm'
      }`}>
        <span className="hidden md:flex items-center gap-1">
          <Move className="w-3 h-3 text-[#1DB954]" /> Pan / Scroll to Zoom
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
