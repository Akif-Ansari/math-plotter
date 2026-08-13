import * as math from 'mathjs';

function normalizeTrigExpressions(input: string): string {
  if (!input) return '';
  let s = input;

  s = s
    .replace(/\\?acosec/gi, 'acsc')
    .replace(/\\?cosec/gi, 'csc');

  s = s
    .replace(/\\?sin\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'asin($2)')
    .replace(/\\?cos\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'acos($2)')
    .replace(/\\?tan\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'atan($2)')
    .replace(/\\?sec\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'asec($2)')
    .replace(/\\?csc\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'acsc($2)')
    .replace(/\\?cot\^(\{-1\}|-1)\s*\(?([a-zA-Z0-9_\.\+\*\-\/]+)\)?/gi, 'acot($2)');

  s = s
    .replace(/\\?arcsin/gi, 'asin')
    .replace(/\\?arccos/gi, 'acos')
    .replace(/\\?arctan/gi, 'atan')
    .replace(/\\?arcsec/gi, 'asec')
    .replace(/\\?arccsc/gi, 'acsc')
    .replace(/\\?arccot/gi, 'acot');

  // 4. Missing parentheses for single variable concatenated without space (e.g. "tanx" -> "tan(x)", "cotx" -> "cot(x)")
  // MUST NOT be followed by '('
  s = s.replace(/\\?(asin|acos|atan|asec|acsc|acot|sin|cos|tan|sec|csc|cot)(?!\()([xXyY\theta])(?![a-zA-Z0-9_])/gi, '$1($2)');

  // 5. Space separated expressions: e.g. "tan 2x" -> "tan(2x)", "sin 3x" -> "sin(3x)"
  s = s.replace(/\\?(asin|acos|atan|asec|acsc|acot|sin|cos|tan|sec|csc|cot)\s+([a-zA-Z0-9_\.\*\+\-\^]+)/gi, '$1($2)');

  // 6. Expand reciprocal trig functions for mathjs execution:
  s = s
    .replace(/\bsec\s*\(([^()]+)\)/gi, '(1 / cos($1))')
    .replace(/\bcsc\s*\(([^()]+)\)/gi, '(1 / sin($1))')
    .replace(/\bcot\s*\(([^()]+)\)/gi, '(1 / tan($1))')
    .replace(/\basec\s*\(([^()]+)\)/gi, 'acos(1 / ($1))')
    .replace(/\bacsc\s*\(([^()]+)\)/gi, 'asin(1 / ($1))')
    .replace(/\bacot\s*\(([^()]+)\)/gi, 'atan(1 / ($1))');

  return s;
}

function sanitizeMathString(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();

  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    const lhs = parts[0].trim().toLowerCase();
    if (['y', 'f(x)', 'r', 'g(x)'].includes(lhs)) {
      cleaned = parts[1].trim();
    } else {
      cleaned = `(${parts[0].trim()}) - (${parts[1].trim()})`;
    }
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
    .replace(/\\theta/g, 'theta')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, '*')
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

const inputs = ['tan(x)', 'tanx', 'tan x', 'cot(x)', 'cotx', 'cot x', 'sec(x)', 'cosec(x)'];

for (const raw of inputs) {
  const sanitized = sanitizeMathString(raw);
  console.log(`Raw: "${raw.padEnd(10)}" -> Sanitized: "${sanitized.padEnd(20)}"`);
  try {
    const compiled = math.compile(sanitized);
    const val = compiled.evaluate({ x: 0.5 });
    console.log(`  SUCCESS! val at x=0.5: ${val}`);
  } catch (err: any) {
    console.log(`  ERROR: ${err.message}`);
  }
}
