export type EvaluatorFn = (varVal: number) => number;
export type Evaluator2DFn = (x: number, y: number) => number;

/**
 * Normalizes trigonometric & inverse trigonometric functions in user input strings.
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

  // 4. Missing parentheses for single variable concatenated without space:
  s = s.replace(/\\?(asin|acos|atan|asec|acsc|acot|sin|cos|tan|sec|csc|cot)(?!\()([xXyY\theta])(?![a-zA-Z0-9_])/gi, '$1($2)');

  // 5. Space separated expressions: e.g. "tan 2x" -> "tan(2x)", "sin 3x" -> "sin(3x)"
  s = s.replace(/\\?(asin|acos|atan|asec|acsc|acot|sin|cos|tan|sec|csc|cot)\s+([a-zA-Z0-9_\.\*\+\-\^]+)/gi, '$1($2)');

  // 6. Expand reciprocal trig functions for native execution:
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
 * Preprocesses input expression text to sanitize and convert math symbols.
 */
export function sanitizeMathString(input: string): string {
  if (!input) return '';

  let cleaned = input.trim();

  // Strip 'y = ' or 'f(x) = ' or 'r = ' prefix if present for standard cartesian
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
    .replace(/\\ln/g, 'log') // math natural log
    .replace(/\\log/g, 'log10')
    .replace(/\^\{([^}]+)\}/g, '^($1)');

  // Implicit multiplication inserts: e.g. 2x -> 2*x, 3y -> 3*y, 3sin -> 3*sin, x sin -> x*sin, 3(x) -> 3*(x)
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

/**
 * Converts mathematical expression to high-speed native JavaScript code
 */
function toNativeJsMath(sanitized: string): string {
  let js = sanitized;

  // Power operator ^ -> **
  js = js.replace(/\^/g, '**');

  // Math constants
  js = js.replace(/\bpi\b/gi, 'Math.PI');
  js = js.replace(/\be\b/gi, 'Math.E');

  // Math functions
  const funcs = [
    'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'sin', 'cos', 'tan', 'sqrt', 'abs', 'exp',
    'log10', 'log', 'min', 'max'
  ];

  for (const f of funcs) {
    const reg = new RegExp(`\\b${f}\\(`, 'gi');
    js = js.replace(reg, `Math.${f}(`);
  }

  return js;
}

// In-memory function cache for instant execution
const native1DCache = new Map<string, Function>();
const native2DCache = new Map<string, Function>();

/**
 * Compiles a 1D mathematical string expression for variable 'x' or 'theta' or 't' or 'y'.
 * Uses native JavaScript JIT compilation with 0 dependencies for maximum speed and instant loading.
 */
export function compileExpression(
  rawInput: string,
  varName: 'x' | 'theta' | 't' | 'y' = 'x',
  params: Record<string, number> = {}
): { evalFn: EvaluatorFn | null; error: string | null } {
  try {
    const sanitized = sanitizeMathString(rawInput);
    if (!sanitized) {
      return { evalFn: null, error: 'Empty expression' };
    }

    const jsCode = toNativeJsMath(sanitized);
    const cacheKey = `${varName}:::${jsCode}`;

    let compiled = native1DCache.get(cacheKey);
    if (!compiled) {
      // Dynamic mathematical evaluator supporting all parameter variables
      compiled = new Function(
        varName,
        'params',
        `
        const scope = Object.assign({ a: 1, b: 1, c: 0, k: 1, m: 1 }, Math, params || {});
        with (scope) {
          try {
            const res = (${jsCode});
            return (typeof res === 'number' && Number.isFinite(res)) ? res : NaN;
          } catch {
            return NaN;
          }
        }
      `
      );
      if (native1DCache.size > 300) native1DCache.clear();
      native1DCache.set(cacheKey, compiled);
    }

    const evalFn: EvaluatorFn = (v: number) => {
      try {
        const val = compiled!(v, params);
        return typeof val === 'number' ? val : NaN;
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
 * Compiles a 2D implicit equation F(x, y) = 0 using native JS.
 */
export function compile2DExpression(
  rawInput: string,
  params: Record<string, number> = {}
): { evalFn: Evaluator2DFn | null; error: string | null } {
  try {
    const sanitized = sanitize2DMathString(rawInput);
    if (!sanitized) {
      return { evalFn: null, error: 'Empty expression' };
    }

    const jsCode = toNativeJsMath(sanitized);
    const cacheKey = `xy:::${jsCode}`;

    let compiled = native2DCache.get(cacheKey);
    if (!compiled) {
      compiled = new Function(
        'x',
        'y',
        'params',
        `
        const scope = Object.assign({ a: 1, b: 1, c: 0, k: 1, m: 1 }, Math, params || {});
        with (scope) {
          try {
            const res = (${jsCode});
            return (typeof res === 'number' && Number.isFinite(res)) ? res : NaN;
          } catch {
            return NaN;
          }
        }
      `
      );
      if (native2DCache.size > 300) native2DCache.clear();
      native2DCache.set(cacheKey, compiled);
    }

    const evalFn: Evaluator2DFn = (x: number, y: number) => {
      try {
        const val = compiled!(x, y, params);
        return typeof val === 'number' ? val : NaN;
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
 * Extracts variable parameters like 'a', 'b', 'c', 'k', 'm' from input math string.
 */
export function extractParameters(rawInput: string): string[] {
  if (!rawInput) return [];
  const reserved = new Set([
    'x', 'y', 't', 'theta', 'X', 'Y', 'sin', 'cos', 'tan', 'sec', 'csc', 'cot',
    'asin', 'acos', 'atan', 'asec', 'acsc', 'acot', 'sinh', 'cosh', 'tanh',
    'log', 'log10', 'ln', 'sqrt', 'root', 'abs', 'exp', 'pi', 'e', 'min', 'max'
  ]);
  const matches = rawInput.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
  const found = new Set<string>();
  matches.forEach((m) => {
    if (!reserved.has(m) && !reserved.has(m.toLowerCase())) {
      found.add(m);
    }
  });
  return Array.from(found);
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
 * Computes symbolic derivative string for standard polynomials and trigonometric functions
 */
export function getDerivativeText(rawInput: string, varName: string = 'x'): string | null {
  try {
    const clean = rawInput.trim();
    if (clean === 'x') return '1';
    if (clean === 'x^2' || clean === 'x^2 - 2') return '2*x';
    if (clean === 'sin(x)') return 'cos(x)';
    if (clean === 'cos(x)') return '-sin(x)';
    if (clean === 'tan(x)') return 'sec(x)^2';
    if (clean === 'e^x' || clean === 'exp(x)') return 'e^x';
    if (clean === 'ln(x)' || clean === 'log(x)') return '1/x';
    if (clean === '1/x') return '-1/(x^2)';
    if (clean === 'sqrt(x)') return '1/(2*sqrt(x))';

    // Polynomial power rule regex: a*x^n + b*x + c
    const polyMatch = clean.match(/^([+-]?\s*\d*\.?\d*)\*?x\^(\d+)/i);
    if (polyMatch) {
      const coeff = parseFloat(polyMatch[1].replace(/\s/g, '')) || (polyMatch[1].startsWith('-') ? -1 : 1);
      const power = parseInt(polyMatch[2]);
      const newCoeff = coeff * power;
      const newPower = power - 1;
      return newPower === 1 ? `${newCoeff}*x` : newPower === 0 ? `${newCoeff}` : `${newCoeff}*x^${newPower}`;
    }

    return `d/d${varName} (${rawInput})`;
  } catch {
    return null;
  }
}
