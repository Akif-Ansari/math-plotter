import { Point2D, Asymptote, AnalysisResult, Viewport } from '@/types/math';
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

      // Check for Extrema (Derivative sign change)
      if (i > 1 && i < SAMPLES - 1) {
        const nextX = currX + step;
        const nextY = evalFn(nextX);
        if (Number.isFinite(nextY) && !isNaN(nextY)) {
          const dy1 = currY - prevY;
          const dy2 = nextY - currY;
          if (Math.sign(dy1) !== Math.sign(dy2) && Math.abs(dy1) < 100 && Math.abs(dy2) < 100) {
            const formattedExtY = Number(currY.toFixed(4));
            extrema.push({
              x: Number(currX.toFixed(4)),
              y: formattedExtY,
            });

            if (Math.abs(currY - minObservedY) < 0.1) minAchievedAtExtrema = true;
            if (Math.abs(currY - maxObservedY) < 0.1) maxAchievedAtExtrema = true;
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
