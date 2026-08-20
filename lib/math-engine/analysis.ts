import { Point2D, Asymptote, AnalysisResult, Viewport, CriticalPointAnalysis, PointCalculusReport, InflectionPoint, ConcavityInterval, NumericalRootResult } from '@/types/math';
import { compileExpression, getDerivativeText } from './parser';

/**
 * Perform comprehensive mathematical analysis on an expression.
 */
export function analyzeFunction(
  expressionId: string,
  rawText: string,
  viewport: Viewport
): AnalysisResult {
  const { evalFn, error } = compileExpression(rawText, 'x');

  if (error || !evalFn) {
    return {
      expressionId,
      rawText,
      domain: 'Undefined',
      range: 'Undefined',
      roots: [],
      rootCount: 0,
      extrema: [],
      asymptotes: [],
      isEvaluatable: false,
      error: error || 'Failed to parse function',
      criticalPoints: [],
    };
  }

  const { xMin, xMax } = viewport;

  // 1. Y-Intercept
  const y0 = evalFn(0);
  const yIntercept: Point2D | undefined =
    Number.isFinite(y0) && !isNaN(y0) ? { x: 0, y: Number(y0.toFixed(4)) } : undefined;

  // 2. Find Roots, Extrema, and Vertical Asymptotes via Dense Grid Sampling
  const roots: Point2D[] = [];
  const asymptotes: Asymptote[] = [];
  const extrema: Point2D[] = [];
  const criticalPoints: CriticalPointAnalysis[] = [];

  const SAMPLES = 1000;
  const step = (xMax - xMin) / SAMPLES;

  let validCount = 0;
  let minObservedY = Infinity;
  let maxObservedY = -Infinity;
  let minAchievedAtExtrema = false;
  let maxAchievedAtExtrema = false;

  let prevX = xMin;
  let prevY = evalFn(prevX);

  if (Number.isFinite(prevY) && !isNaN(prevY)) {
    validCount++;
    minObservedY = Math.min(minObservedY, prevY);
    maxObservedY = Math.max(maxObservedY, prevY);
  }

  for (let i = 1; i <= SAMPLES; i++) {
    const currX = xMin + i * step;
    const currY = evalFn(currX);

    const isPrevValid = Number.isFinite(prevY) && !isNaN(prevY);
    const isCurrValid = Number.isFinite(currY) && !isNaN(currY);

    if (isCurrValid) {
      validCount++;
      minObservedY = Math.min(minObservedY, currY);
      maxObservedY = Math.max(maxObservedY, currY);
    }

    if (isPrevValid && isCurrValid) {
      // Vertical asymptote check (sign flip near infinity)
      const absPrev = Math.abs(prevY);
      const absCurr = Math.abs(currY);
      if (
        (absPrev > 50 || absCurr > 50) &&
        Math.abs(currY - prevY) > 100 &&
        Math.sign(prevY) !== Math.sign(currY)
      ) {
        const asympX = Number(((prevX + currX) / 2).toFixed(4));
        if (!asymptotes.some((a) => a.type === 'vertical' && Math.abs(a.value - asympX) < 0.1)) {
          asymptotes.push({
            type: 'vertical',
            value: asympX,
            label: `x = ${asympX}`,
          });
          criticalPoints.push({
            x: asympX,
            label: `x = ${asympX}`,
            type: 'discontinuity',
            reason: 'Vertical Asymptote / Infinite Discontinuity',
          });
        }
      } else if (Math.sign(prevY) !== Math.sign(currY)) {
        // Root detection
        const rootX = refineRoot(evalFn, prevX, currX);
        if (rootX !== null) {
          const formattedX = Number(rootX.toFixed(4));
          if (!roots.some((r) => Math.abs(r.x - formattedX) < 1e-3)) {
            roots.push({ x: formattedX, y: 0 });
          }
        }
      } else if (Math.abs(currY) < 1e-6) {
        const formattedX = Number(currX.toFixed(4));
        if (!roots.some((r) => Math.abs(r.x - formattedX) < 1e-3)) {
          roots.push({ x: formattedX, y: 0 });
        }
      }

      // Check for Extrema and Corners (Derivative sign change / sharp jump)
      if (i > 1 && i < SAMPLES - 1) {
        const nextX = currX + step;
        const nextY = evalFn(nextX);
        if (Number.isFinite(nextY) && !isNaN(nextY)) {
          const dy1 = (currY - prevY) / step;
          const dy2 = (nextY - currY) / step;
          if (Math.sign(dy1) !== Math.sign(dy2) && Math.abs(dy1) < 100 && Math.abs(dy2) < 100) {
            const formattedExtY = Number(currY.toFixed(4));
            extrema.push({
              x: Number(currX.toFixed(4)),
              y: formattedExtY,
            });

            if (Math.abs(currY - minObservedY) < 0.1) minAchievedAtExtrema = true;
            if (Math.abs(currY - maxObservedY) < 0.1) maxAchievedAtExtrema = true;

            // Check if this extremum is a non-differentiable corner (e.g. |x|)
            if (Math.abs(dy1 - dy2) > 0.8 && Math.abs(dy1) > 0.2 && Math.abs(dy2) > 0.2) {
              const cornerX = Number(currX.toFixed(4));
              if (!criticalPoints.some((cp) => Math.abs(cp.x - cornerX) < 0.2)) {
                criticalPoints.push({
                  x: cornerX,
                  label: `x = ${cornerX}`,
                  type: 'non-differentiable',
                  reason: 'Sharp Corner / Cusp (Left slope ≠ Right slope)',
                });
              }
            }
          }
        }
      }
    }

    prevX = currX;
    prevY = currY;
  }

  // 3. Horizontal Asymptotes: Test limits at x -> +/- 1000, 10000
  const farRight1 = evalFn(1000);
  const farRight2 = evalFn(10000);
  let horizRightAsymptote: number | null = null;

  if (
    Number.isFinite(farRight1) &&
    Number.isFinite(farRight2) &&
    Math.abs(farRight1 - farRight2) < 0.01 &&
    Math.abs(farRight2) < 1e4
  ) {
    horizRightAsymptote = Number(farRight2.toFixed(4));
    if (!asymptotes.some((a) => a.type === 'horizontal' && Math.abs(a.value - horizRightAsymptote!) < 0.1)) {
      asymptotes.push({
        type: 'horizontal',
        value: horizRightAsymptote,
        label: `y = ${horizRightAsymptote}`,
      });
    }
  }

  const farLeft1 = evalFn(-1000);
  const farLeft2 = evalFn(-10000);
  let horizLeftAsymptote: number | null = null;

  if (
    Number.isFinite(farLeft1) &&
    Number.isFinite(farLeft2) &&
    Math.abs(farLeft1 - farLeft2) < 0.01 &&
    Math.abs(farLeft2) < 1e4
  ) {
    horizLeftAsymptote = Number(farLeft2.toFixed(4));
    if (!asymptotes.some((a) => a.type === 'horizontal' && Math.abs(a.value - horizLeftAsymptote!) < 0.1)) {
      asymptotes.push({
        type: 'horizontal',
        value: horizLeftAsymptote,
        label: `y = ${horizLeftAsymptote}`,
      });
    }
  }

  // 4. Detailed Domain and Range with Open '(' and Closed '[' Bound Formatting
  const domain = evaluateDomainNotation(evalFn, asymptotes);
  const range = evaluateRangeNotation(
    evalFn,
    minObservedY,
    maxObservedY,
    minAchievedAtExtrema,
    maxAchievedAtExtrema,
    horizLeftAsymptote,
    horizRightAsymptote,
    validCount
  );

  // 5. Symbolic Derivative
  const derivText = getDerivativeText(rawText, 'x');

  // 6. Inflection Points & Concavity (second derivative sign changes)
  const { inflectionPoints, concavityIntervals } = analyzeInflectionAndConcavity(evalFn, xMin, xMax);

  return {
    expressionId,
    rawText,
    domain,
    range,
    roots,
    rootCount: roots.length,
    yIntercept,
    extrema,
    asymptotes,
    derivativeText: derivText || undefined,
    isEvaluatable: true,
    criticalPoints,
    inflectionPoints,
    concavityIntervals,
  };
}

/**
 * Analyzes Continuity, Left/Right Limits, and Differentiability at a specific point x = c.
 */
export function analyzePointCalculus(
  rawText: string,
  c: number,
  params: Record<string, number> = {}
): PointCalculusReport {
  const { evalFn, error } = compileExpression(rawText, 'x', params);
  if (error || !evalFn) {
    return {
      x: c,
      fX: 'Undefined',
      leftLimit: 'Undefined',
      rightLimit: 'Undefined',
      limitValue: 'DNE',
      limitExists: false,
      isContinuous: false,
      discontinuityType: error || 'Failed to parse function',
      isDifferentiable: false,
      nonDiffReason: error || 'Failed to parse function',
    };
  }

  const h = 1e-6;
  const fC = evalFn(c);
  const isFcDefined = Number.isFinite(fC) && !isNaN(fC);

  const fLeft = evalFn(c - h);
  const fRight = evalFn(c + h);

  const isLeftFinite = Number.isFinite(fLeft) && !isNaN(fLeft) && Math.abs(fLeft) < 1e5;
  const isRightFinite = Number.isFinite(fRight) && !isNaN(fRight) && Math.abs(fRight) < 1e5;

  const leftLimitStr = !Number.isFinite(fLeft) || isNaN(fLeft)
    ? 'Undefined'
    : Math.abs(fLeft) >= 1e5
      ? (fLeft > 0 ? '+∞' : '-∞')
      : Number(fLeft.toFixed(4)).toString();

  const rightLimitStr = !Number.isFinite(fRight) || isNaN(fRight)
    ? 'Undefined'
    : Math.abs(fRight) >= 1e5
      ? (fRight > 0 ? '+∞' : '-∞')
      : Number(fRight.toFixed(4)).toString();

  const limitExists = isLeftFinite && isRightFinite && Math.abs(fLeft - fRight) < 1e-3;
  const limitValue = limitExists ? Number(((fLeft + fRight) / 2).toFixed(4)).toString() : 'DNE (Does Not Exist)';

  let isContinuous = false;
  let discontinuityType = 'None (Continuous)';

  if (limitExists && isFcDefined && Math.abs((fLeft + fRight) / 2 - fC) < 1e-3) {
    isContinuous = true;
  } else if (!isLeftFinite || !isRightFinite) {
    discontinuityType = 'Infinite / Essential Discontinuity (Vertical Asymptote)';
  } else if (!limitExists) {
    discontinuityType = 'Jump Discontinuity (Left Limit ≠ Right Limit)';
  } else {
    discontinuityType = 'Removable Discontinuity (Hole / Undefined at point)';
  }

  let isDifferentiable = false;
  let nonDiffReason = 'None (Differentiable)';
  let leftDerivative: string | undefined;
  let rightDerivative: string | undefined;

  if (isContinuous) {
    const dLeft = (fC - evalFn(c - h)) / h;
    const dRight = (evalFn(c + h) - fC) / h;
    leftDerivative = Number.isFinite(dLeft) ? Number(dLeft.toFixed(4)).toString() : 'Undefined';
    rightDerivative = Number.isFinite(dRight) ? Number(dRight.toFixed(4)).toString() : 'Undefined';

    if (Math.abs(dLeft) > 1e4 || Math.abs(dRight) > 1e4) {
      nonDiffReason = "Vertical Tangent (|f'(x)| → ∞)";
    } else if (Math.abs(dLeft - dRight) < 0.05) {
      isDifferentiable = true;
    } else {
      nonDiffReason = `Corner / Sharp Cusp (Left slope ${leftDerivative} ≠ Right slope ${rightDerivative})`;
    }
  } else {
    nonDiffReason = `Function is discontinuous at x = ${c}`;
  }

  return {
    x: c,
    fX: isFcDefined ? Number(fC.toFixed(4)).toString() : 'Undefined',
    leftLimit: leftLimitStr,
    rightLimit: rightLimitStr,
    limitValue,
    limitExists,
    isContinuous,
    discontinuityType,
    isDifferentiable,
    nonDiffReason,
    leftDerivative,
    rightDerivative,
  };
}

/**
 * Refines root within interval [x1, x2] using Bisection Method.
 */
function refineRoot(evalFn: (x: number) => number, x1: number, x2: number): number | null {
  let a = x1;
  let b = x2;
  let fa = evalFn(a);
  let fb = evalFn(b);

  if (Math.abs(fa) < 1e-7) return a;
  if (Math.abs(fb) < 1e-7) return b;

  for (let iter = 0; iter < 30; iter++) {
    const mid = (a + b) / 2;
    const fmid = evalFn(mid);

    if (isNaN(fmid) || !Number.isFinite(fmid)) return null;
    if (Math.abs(fmid) < 1e-7 || (b - a) / 2 < 1e-7) {
      return mid;
    }

    if (Math.sign(fa) === Math.sign(fmid)) {
      a = mid;
      fa = fmid;
    } else {
      b = mid;
      fb = fmid;
    }
  }

  return (a + b) / 2;
}

/**
 * Infers domain interval notation with open/closed bounds (e.g. (-infinity, infinity), [0, infinity), (-infinity, 0) U (0, infinity)).
 */
function evaluateDomainNotation(
  evalFn: (x: number) => number,
  asymptotes: Asymptote[]
): string {
  const vAsymptotes = asymptotes
    .filter((a) => a.type === 'vertical')
    .map((a) => a.value)
    .sort((a, b) => a - b);

  if (vAsymptotes.length > 0) {
    // E.g., for 1/x -> (-infinity, 0) U (0, infinity)
    if (vAsymptotes.length === 1 && Math.abs(vAsymptotes[0]) < 1e-3) {
      return '(-∞, 0) ∪ (0, ∞)';
    }
    const excludedList = vAsymptotes.map((v) => v.toString()).join(', ');
    return `ℝ \\ {${excludedList}}`;
  }

  const negVal = evalFn(-10);
  const zeroVal = evalFn(0);
  const posVal = evalFn(10);

  const isNegValid = Number.isFinite(negVal) && !isNaN(negVal);
  const isZeroValid = Number.isFinite(zeroVal) && !isNaN(zeroVal);
  const isPosValid = Number.isFinite(posVal) && !isNaN(posVal);

  if (isNegValid && isZeroValid && isPosValid) {
    return '(-∞, ∞)';
  } else if (!isNegValid && isZeroValid && isPosValid) {
    return '[0, ∞)'; // 0 is included (closed bound)
  } else if (!isNegValid && !isZeroValid && isPosValid) {
    return '(0, ∞)'; // 0 is excluded (open bound)
  } else if (isNegValid && isZeroValid && !isPosValid) {
    return '(-∞, 0]';
  } else if (isNegValid && !isZeroValid && !isPosValid) {
    return '(-∞, 0)';
  }
  return 'Subset of ℝ';
}

/**
 * Evaluates Range notation distinguishing open '(' ')' vs closed '[' ']' bounds.
 * Example outputs:
 *  - Range = [-infinity, 3) (3 is open bound via asymptote)
 *  - Range = [-2.00, ∞) (-2.00 is closed bound via parabola minimum)
 *  - Range = (-∞, ∞)
 */
function evaluateRangeNotation(
  evalFn: (x: number) => number,
  minY: number,
  maxY: number,
  minAchievedAtExtrema: boolean,
  maxAchievedAtExtrema: boolean,
  horizLeftAsymptote: number | null,
  horizRightAsymptote: number | null,
  validCount: number
): string {
  if (validCount === 0) return 'Undefined';

  const isMinInfinity = minY < -100 || !Number.isFinite(minY);
  const isMaxInfinity = maxY > 100 || !Number.isFinite(maxY);

  // Determine left bound (Min): '(' for -infinity or open asymptote, '[' for closed attained minimum
  let leftBracket = '(';
  let minLabel = '-∞';

  if (!isMinInfinity) {
    minLabel = minY.toFixed(2);
    // If minY matches a horizontal asymptote, it's an open bound '('
    const isAsymptoteBound =
      (horizLeftAsymptote !== null && Math.abs(horizLeftAsymptote - minY) < 0.1) ||
      (horizRightAsymptote !== null && Math.abs(horizRightAsymptote - minY) < 0.1);

    if (isAsymptoteBound && !minAchievedAtExtrema) {
      leftBracket = '('; // Open bound
    } else {
      leftBracket = '['; // Closed bound (value included)
    }
  }

  // Determine right bound (Max): ')' for infinity or open asymptote, ']' for closed attained maximum
  let rightBracket = ')';
  let maxLabel = '∞';

  if (!isMaxInfinity) {
    maxLabel = maxY.toFixed(2);
    const isAsymptoteBound =
      (horizLeftAsymptote !== null && Math.abs(horizLeftAsymptote - maxY) < 0.1) ||
      (horizRightAsymptote !== null && Math.abs(horizRightAsymptote - maxY) < 0.1);

    if (isAsymptoteBound && !maxAchievedAtExtrema) {
      rightBracket = ')'; // Open bound (e.g. 3 is open bound: [-infinity, 3))
    } else {
      rightBracket = ']'; // Closed bound (value included, e.g. [-2, 3])
    }
  }

  return `Range = ${leftBracket}${minLabel}, ${maxLabel}${rightBracket}`;
}

/**
 * Finds intersection points between two functions within the viewport.
 */
export function findIntersections(
  expr1: { id: string; rawText: string; color: string },
  expr2: { id: string; rawText: string; color: string },
  viewport: Viewport
): Point2D[] {
  const { evalFn: fn1 } = compileExpression(expr1.rawText, 'x');
  const { evalFn: fn2 } = compileExpression(expr2.rawText, 'x');

  if (!fn1 || !fn2) return [];

  const diffFn = (x: number) => fn1(x) - fn2(x);
  const { xMin, xMax } = viewport;
  const SAMPLES = 400;
  const step = (xMax - xMin) / SAMPLES;

  const intersections: Point2D[] = [];

  let prevX = xMin;
  let prevDiff = diffFn(prevX);

  for (let i = 1; i <= SAMPLES; i++) {
    const currX = xMin + i * step;
    const currDiff = diffFn(currX);

    if (
      Number.isFinite(prevDiff) &&
      Number.isFinite(currDiff) &&
      Math.sign(prevDiff) !== Math.sign(currDiff) &&
      Math.abs(currDiff - prevDiff) < 100
    ) {
      const intersectX = refineRoot(diffFn, prevX, currX);
      if (intersectX !== null) {
        const yVal = fn1(intersectX);
        if (Number.isFinite(yVal)) {
          const formattedX = Number(intersectX.toFixed(3));
          const formattedY = Number(yVal.toFixed(3));
          if (!intersections.some((p) => Math.abs(p.x - formattedX) < 1e-2)) {
            intersections.push({ x: formattedX, y: formattedY });
          }
        }
      }
    }

    prevX = currX;
    prevDiff = currDiff;
  }

  return intersections;
}

/**
 * Detects inflection points (f''(x) sign changes) and labels concavity intervals.
 */
function analyzeInflectionAndConcavity(
  evalFn: (x: number) => number,
  xMin: number,
  xMax: number
): { inflectionPoints: InflectionPoint[]; concavityIntervals: ConcavityInterval[] } {
  const h = 1e-4;
  const SAMPLES = 800;
  const step = (xMax - xMin) / SAMPLES;

  const inflectionPoints: InflectionPoint[] = [];
  const concavityIntervals: ConcavityInterval[] = [];

  // Numerical second derivative: f''(x) ≈ (f(x+h) - 2f(x) + f(x-h)) / h^2
  const d2 = (x: number): number | null => {
    const fPlus = evalFn(x + h);
    const fMid = evalFn(x);
    const fMinus = evalFn(x - h);
    if (!Number.isFinite(fPlus) || !Number.isFinite(fMid) || !Number.isFinite(fMinus)) return null;
    return (fPlus - 2 * fMid + fMinus) / (h * h);
  };

  let prevX = xMin;
  let prevD2 = d2(prevX);
  let intervalStart = xMin;
  let intervalDir: 'up' | 'down' | null = prevD2 === null ? null : prevD2 > 0 ? 'up' : 'down';

  for (let i = 1; i <= SAMPLES; i++) {
    const currX = xMin + i * step;
    const currD2 = d2(currX);

    if (prevD2 !== null && currD2 !== null && Math.abs(prevD2) < 1e6 && Math.abs(currD2) < 1e6) {
      if (Math.sign(prevD2) !== Math.sign(currD2) && prevD2 !== 0) {
        // Sign change: inflection point found
        const infX = Number(((prevX + currX) / 2).toFixed(4));
        const fVal = evalFn(infX);
        if (Number.isFinite(fVal)) {
          const changeType: InflectionPoint['changeType'] = prevD2 > 0 ? 'up-to-down' : 'down-to-up';
          if (!inflectionPoints.some((ip) => Math.abs(ip.x - infX) < 0.05)) {
            inflectionPoints.push({ x: infX, y: Number(fVal.toFixed(4)), changeType });
          }
          // Close previous concavity interval
          const currDir = prevD2 > 0 ? 'up' : 'down';
          if (intervalDir !== null && intervalStart < infX) {
            concavityIntervals.push({
              from: Number(intervalStart.toFixed(4)),
              to: infX,
              direction: intervalDir,
              label: `(${intervalStart.toFixed(2)}, ${infX}) — Concave ${intervalDir === 'up' ? 'Up ∪' : 'Down ∩'}`,
            });
          }
          intervalStart = infX;
          intervalDir = currDir === 'up' ? 'down' : 'up';
        }
      }
    }

    prevX = currX;
    prevD2 = currD2;
  }

  // Close last interval
  if (intervalDir !== null && inflectionPoints.length > 0) {
    concavityIntervals.push({
      from: inflectionPoints[inflectionPoints.length - 1].x,
      to: Number(xMax.toFixed(4)),
      direction: intervalDir,
      label: `(${inflectionPoints[inflectionPoints.length - 1].x}, ${xMax.toFixed(2)}) — Concave ${intervalDir === 'up' ? 'Up ∪' : 'Down ∩'}`,
    });
  }

  if (inflectionPoints.length === 0 && prevD2 !== null) {
    // No inflection: single concavity interval
    concavityIntervals.push({
      from: Number(xMin.toFixed(4)),
      to: Number(xMax.toFixed(4)),
      direction: prevD2 > 0 ? 'up' : 'down',
      label: `(-∞, ∞) — Concave ${prevD2 > 0 ? 'Up ∪ (everywhere in viewport)' : 'Down ∩ (everywhere in viewport)'}`,
    });
  }

  return { inflectionPoints, concavityIntervals };
}

/**
 * Bisection Method: Finds root of f in [a, b] (requires f(a) * f(b) < 0).
 */
export function numericalBisection(
  rawText: string,
  a: number,
  b: number,
  maxIter = 40,
  tol = 1e-8
): NumericalRootResult {
  const { evalFn, error } = compileExpression(rawText, 'x');
  if (error || !evalFn) return { method: 'bisection', root: null, iterations: 0, converged: false, error: error || 'Parse error', steps: [] };

  let fa = evalFn(a);
  let fb = evalFn(b);
  const steps: NumericalRootResult['steps'] = [];

  if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
    return { method: 'bisection', root: null, iterations: 0, converged: false, error: 'f(a) or f(b) is not finite', steps: [] };
  }
  if (Math.sign(fa) === Math.sign(fb)) {
    return { method: 'bisection', root: null, iterations: 0, converged: false, error: 'f(a) and f(b) must have opposite signs', steps: [] };
  }

  let mid = a;
  let iter = 0;
  for (; iter < maxIter; iter++) {
    mid = (a + b) / 2;
    const fmid = evalFn(mid);
    steps.push({ iter: iter + 1, x: Number(mid.toFixed(8)), fx: Number(fmid.toFixed(8)) });
    if (!Number.isFinite(fmid)) break;
    if (Math.abs(fmid) < tol || (b - a) / 2 < tol) { iter++; break; }
    if (Math.sign(fa) === Math.sign(fmid)) { a = mid; fa = fmid; } else { b = mid; }
  }

  const root = Number(mid.toFixed(8));
  return { method: 'bisection', root, iterations: iter, converged: Math.abs(evalFn(root)) < tol * 10, steps };
}

/**
 * Newton-Raphson Method: x_{n+1} = x_n - f(x_n) / f'(x_n).
 */
export function numericalNewton(
  rawText: string,
  x0: number,
  maxIter = 40,
  tol = 1e-8
): NumericalRootResult {
  const { evalFn, error } = compileExpression(rawText, 'x');
  if (error || !evalFn) return { method: 'newton', root: null, iterations: 0, converged: false, error: error || 'Parse error', steps: [] };

  const h = 1e-6;
  const steps: NumericalRootResult['steps'] = [];
  let x = x0;

  for (let iter = 0; iter < maxIter; iter++) {
    const fx = evalFn(x);
    if (!Number.isFinite(fx)) break;
    steps.push({ iter: iter + 1, x: Number(x.toFixed(8)), fx: Number(fx.toFixed(8)) });
    if (Math.abs(fx) < tol) { break; }
    const dfx = (evalFn(x + h) - evalFn(x - h)) / (2 * h);
    if (Math.abs(dfx) < 1e-14) {
      return { method: 'newton', root: null, iterations: iter + 1, converged: false, error: "Derivative ≈ 0, cannot continue", steps };
    }
    const xNew = x - fx / dfx;
    if (!Number.isFinite(xNew)) break;
    if (Math.abs(xNew - x) < tol) { x = xNew; steps.push({ iter: iter + 2, x: Number(x.toFixed(8)), fx: Number(evalFn(x).toFixed(8)) }); break; }
    x = xNew;
  }

  const root = Number(x.toFixed(8));
  const converged = Number.isFinite(evalFn(root)) && Math.abs(evalFn(root)) < tol * 100;
  return { method: 'newton', root, iterations: steps.length, converged, steps };
}

/**
 * Secant Method: Uses two initial points x0, x1.
 */
export function numericalSecant(
  rawText: string,
  x0: number,
  x1: number,
  maxIter = 40,
  tol = 1e-8
): NumericalRootResult {
  const { evalFn, error } = compileExpression(rawText, 'x');
  if (error || !evalFn) return { method: 'secant', root: null, iterations: 0, converged: false, error: error || 'Parse error', steps: [] };

  const steps: NumericalRootResult['steps'] = [];
  let xPrev = x0;
  let xCurr = x1;
  let fPrev = evalFn(xPrev);
  let fCurr = evalFn(xCurr);

  for (let iter = 0; iter < maxIter; iter++) {
    if (!Number.isFinite(fCurr)) break;
    steps.push({ iter: iter + 1, x: Number(xCurr.toFixed(8)), fx: Number(fCurr.toFixed(8)) });
    if (Math.abs(fCurr) < tol) break;
    const denom = fCurr - fPrev;
    if (Math.abs(denom) < 1e-14) {
      return { method: 'secant', root: null, iterations: iter + 1, converged: false, error: 'Division by zero in secant step', steps };
    }
    const xNext = xCurr - fCurr * (xCurr - xPrev) / denom;
    if (!Number.isFinite(xNext)) break;
    xPrev = xCurr; fPrev = fCurr;
    xCurr = xNext; fCurr = evalFn(xCurr);
    if (Math.abs(xCurr - xPrev) < tol) { steps.push({ iter: iter + 2, x: Number(xCurr.toFixed(8)), fx: Number(fCurr.toFixed(8)) }); break; }
  }

  const root = Number(xCurr.toFixed(8));
  const converged = Number.isFinite(fCurr) && Math.abs(fCurr) < tol * 100;
  return { method: 'secant', root, iterations: steps.length, converged, steps };
}
