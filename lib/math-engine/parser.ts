import * as math from 'mathjs';

/**
 * Normalizes trigonometric & inverse trigonometric functions in user input strings.
 * Supports:
 *  - Standard trig: sin, cos, tan, sec, csc, cosec, cot
 *  - Inverse trig: arcsin, arccos, arctan, arcsec, arccsc, arccot, asin, acos, atan
 *  - Superscript inverse: sin^-1(x), sin^{-1}(x), cos^-1(x), tan^-1(x), etc.
 *  - Missing parentheses: sin x -> sin(x), sinx -> sin(x), cos 2x -> cos(2*x)
 */
export function normalizeTrigExpressions(input: string): string {
  if (!input) return '';
  let s = input;

  // 1. Synonym normalization: cosec -> csc, acosec -> acsc
  s = s
    .replace(/\\?acosec/gi, 'acsc')
    .replace(/\\?cosec/gi, 'csc');

  // 2. Inverse Trig Superscripts: e.g. sin^-1(x), sin^-1x, sin^{-1}(x), sin^-1(2x)
  s = s
    .replace(/\\?sin\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'asin($2)')
    .replace(/\\?cos\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'acos($2)')
    .replace(/\\?tan\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'atan($2)')
    .replace(/\\?sec\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'asec($2)')
    .replace(/\\?csc\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'acsc($2)')
    .replace(/\\?cot\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'acot($2)');

  // 3. Convert arc* names: \arcsin, arcsin, \arccos, arccos, etc.
  s = s
    .replace(/\\?arcsin/gi, 'asin')
    .replace(/\\?arccos/gi, 'acos')
    .replace(/\\?arctan/gi, 'atan')
    .replace(/\\?arcsec/gi, 'asec')
    .replace(/\\?arccsc/gi, 'acsc')
    .replace(/\\?arccot/gi, 'acot');

  // 4. Missing parentheses for simple expressions like "tan x" -> "tan(x)", "sin 2x" -> "sin(2x)", "tanx" -> "tan(x)"
  const trigFns = ['asin', 'acos', 'atan', 'asec', 'acsc', 'acot', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot'];
  for (const fn of trigFns) {
    const spaceRegex = new RegExp(`\\\\?\\b${fn}\\s+([^\\s\\(\\)]+)`, 'gi');
    s = s.replace(spaceRegex, `${fn}($1)`);

    const directRegex = new RegExp(`\\\\?\\b${fn}([xXyY\\theta])(?![a-zA-Z0-9_\\(])`, 'gi');
    s = s.replace(directRegex, `${fn}($1)`);
  }

  // 5. Expand reciprocal & inverse reciprocal functions for mathjs execution:
  //    sec(u) -> (1 / cos(u))
  //    csc(u) -> (1 / sin(u))
  //    cot(u) -> (1 / tan(u))
  //    asec(u) -> acos(1 / (u))
  //    acsc(u) -> asin(1 / (u))
  //    acot(u) -> atan(1 / (u))
  s = s
    .replace(/\bsec\s*\(([^()]+)\)/gi, '(1 / cos($1))')
    .replace(/\bcsc\s*\(([^()]+)\)/gi, '(1 / sin($1))')
    .replace(/\bcot\s*\(([^()]+)\)/gi, '(1 / tan($1))')
    .replace(/\basec\s*\(([^()]+)\)/gi, 'acos(1 / ($1))')
    .replace(/\bacsc\s*\(([^()]+)\)/gi, 'asin(1 / ($1))')
    .replace(/\bacot\s*\(([^()]+)\)/gi, 'atan(1 / ($1))');

  return s;
}

/**
 * Preprocesses input expression text to sanitize and convert math symbols into mathjs-compatible strings.
 */
export function sanitizeMathString(input: string): string {
  if (!input) return '';

  let cleaned = input.trim();

  // Strip 'y = ' or 'f(x) = ' or 'r = ' prefix if present for standard cartesian FIRST
  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    const lhs = parts[0].trim().toLowerCase();
    if (['y', 'f(x)', 'r', 'g(x)'].includes(lhs)) {
      cleaned = parts[1].trim();
    } else {
      // General equation: LHS - (RHS)
      cleaned = `(${parts[0].trim()}) - (${parts[1].trim()})`;
    }
  }

  // Normalize Trig & Inverse Trig
  cleaned = normalizeTrigExpressions(cleaned);

  // Alias 'root(x)' or 'root(x, 2)' -> 'sqrt(x)'
  cleaned = cleaned
    .replace(/\broot\(([^,)]+)\)/g, 'sqrt($1)')
    .replace(/\\root\{([^}]+)\}/g, 'sqrt($1)');

  // Replace common LaTeX symbols
  cleaned = cleaned
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))')
    .replace(/\\pi/g, 'pi')
    .replace(/\\theta/g, 'theta')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
    .replace(/\\ln/g, 'log') // mathjs log is natural log
    .replace(/\\log/g, 'log10')
    .replace(/\^\{([^}]+)\}/g, '^($1)');

  // Implicit multiplication inserts: e.g. 2x -> 2*x, 3y -> 3*y, 3sin -> 3*sin, x sin -> x*sin, 3(x) -> 3*(x)
  cleaned = cleaned
    .replace(/(\d+)([a-zA-Z\theta])/g, '$1*$2')
    .replace(/(\d+)\(/g, '$1*(')
    .replace(/\)(\d+)/g, ')*$1')
    .replace(/\)\(/g, ')*(')
    .replace(/([xXyY\theta])([a-zA-Z])/g, (match, p1, p2) => {
      if (['s', 'c', 't', 'l', 'a', 'p'].includes(p2)) {
        return `${p1}*${p2}`;
      }
      return match;
    });

  return cleaned;
}

/**
 * Preprocesses 2D implicit equation string F(x, y) = LHS - RHS
 */
export function sanitize2DMathString(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();

  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    cleaned = `(${parts[0].trim()}) - (${parts[1].trim()})`;
  }

  cleaned = normalizeTrigExpressions(cleaned);

  cleaned = cleaned
    .replace(/\broot\(([^,)]+)\)/g, 'sqrt($1)')
    .replace(/\\root\{([^}]+)\}/g, 'sqrt($1)');

  cleaned = cleaned
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))')
    .replace(/\\pi/g, 'pi')
    .replace(/\\ln/g, 'log')
    .replace(/\\log/g, 'log10')
    .replace(/\^\{([^}]+)\}/g, '^($1)');

  cleaned = cleaned
    .replace(/(\d+)([a-zA-Z])/g, '$1*$2')
    .replace(/(\d+)\(/g, '$1*(')
    .replace(/\)(\d+)/g, ')*$1')
    .replace(/\)\(/g, ')*(')
    .replace(/([xXyY])([a-zA-Z])/g, (match, p1, p2) => {
      if (['s', 'c', 't', 'l', 'a', 'p'].includes(p2)) {
        return `${p1}*${p2}`;
      }
      return match;
    });

  return cleaned;
}

export type EvaluatorFn = (varVal: number) => number;
export type Evaluator2DFn = (x: number, y: number) => number;

/**
 * Compiles a 1D mathematical string expression for variable 'x' or 'theta' or 't' or 'y'.
 */
export function compileExpression(rawInput: string, varName: 'x' | 'theta' | 't' | 'y' = 'x'): { evalFn: EvaluatorFn | null; error: string | null } {
  try {
    const sanitized = sanitizeMathString(rawInput);
    if (!sanitized) {
      return { evalFn: null, error: 'Empty expression' };
    }

    const compiled = math.compile(sanitized);

    const evalFn: EvaluatorFn = (v: number) => {
      try {
        const localScope: Record<string, number> = { [varName]: v };
        if (varName === 'x') localScope['X'] = v;
        if (varName === 'y') localScope['Y'] = v;
        if (varName === 'theta') localScope['t'] = v;

        const res = compiled.evaluate(localScope);
        if (typeof res === 'number') {
          return Number.isFinite(res) ? res : NaN;
        } else if (typeof res === 'boolean') {
          return res ? 1 : 0;
        } else if (res && typeof res === 'object' && 're' in res) {
          return Math.abs(res.im) < 1e-9 ? res.re : NaN;
        }
        return NaN;
      } catch {
        return NaN;
      }
    };

    return { evalFn, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid math expression';
    return { evalFn: null, error: msg };
  }
}

/**
 * Compiles a 2D implicit equation F(x, y) = 0.
 */
export function compile2DExpression(rawInput: string): { evalFn: Evaluator2DFn | null; error: string | null } {
  try {
    const sanitized = sanitize2DMathString(rawInput);
    if (!sanitized) {
      return { evalFn: null, error: 'Empty expression' };
    }

    const compiled = math.compile(sanitized);

    const evalFn: Evaluator2DFn = (x: number, y: number) => {
      try {
        const res = compiled.evaluate({ x, y, X: x, Y: y });
        if (typeof res === 'number') {
          return Number.isFinite(res) ? res : NaN;
        }
        return NaN;
      } catch {
        return NaN;
      }
    };

    return { evalFn, error: null };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Invalid implicit expression';
    return { evalFn: null, error: msg };
  }
}

/**
 * Detects if string contains implicit y^2, x^2 + y^2, or both x and y
 */
export function isImplicitEquation(rawInput: string): boolean {
  const lower = rawInput.toLowerCase();
  if (lower.includes('y^2') || lower.includes('y^3') || lower.includes('sin(y)') || lower.includes('cos(y)')) {
    return true;
  }
  if (lower.includes('x') && lower.includes('y') && lower.includes('=')) {
    const lhs = lower.split('=')[0].trim();
    if (lhs !== 'y' && lhs !== 'f(x)') {
      return true;
    }
  }
  return false;
}

/**
 * Computes symbolic derivative string using math.js if possible
 */
export function getDerivativeText(rawInput: string, varName: string = 'x'): string | null {
  try {
    const sanitized = sanitizeMathString(rawInput);
    const derivNode = math.derivative(sanitized, varName);
    return derivNode.toString();
  } catch {
    return null;
  }
}
