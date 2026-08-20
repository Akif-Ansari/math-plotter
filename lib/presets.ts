import { MathExpression, Viewport } from '@/types/math';

export interface PresetData {
  expressions: MathExpression[];
  viewport: Viewport;
}

const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

// 1. Standard Overview
const PROMPT_EXPRESSIONS: MathExpression[] = [
  {
    id: '1',
    label: 'Parabola',
    latex: 'y = x^2 - 2',
    rawText: 'x^2 - 2',
    color: '#1DB954',
    visible: true,
    type: 'cartesian',
  },
  {
    id: '2',
    label: 'Sine Wave',
    latex: 'y = 3\\sin(2x)',
    rawText: '3 * sin(2 * x)',
    color: '#006241',
    visible: true,
    type: 'cartesian',
  },
  {
    id: '3',
    label: 'Polar Spiral',
    latex: 'r = 3\\theta',
    rawText: '3 * theta',
    color: '#1DB954',
    visible: true,
    type: 'polar',
  },
];

// 2. Calculus & Polynomials
const CALCULUS_EXPRESSIONS: MathExpression[] = [
  {
    id: 'c1',
    label: 'Cubic Polynomial',
    latex: 'y = x^3 - 3x',
    rawText: 'x^3 - 3*x',
    color: '#1DB954',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'c2',
    label: 'Quadratic',
    latex: 'y = x^2 - 4',
    rawText: 'x^2 - 4',
    color: '#006241',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'c3',
    label: 'Secant Line',
    latex: 'y = 2x - 2',
    rawText: '2 * x - 2',
    color: '#3B82F6',
    lineStyle: 'dashed',
    visible: true,
    type: 'cartesian',
  },
];

// 3. Riemann & Dirichlet Waves
const RIEMANN_EXPRESSIONS: MathExpression[] = [
  {
    id: 'rm1',
    label: 'Dirichlet Sinc Kernel',
    latex: 'y = \\frac{\\sin(\\pi x)}{\\pi x}',
    rawText: 'sin(pi * x) / (pi * x)',
    color: '#1DB954',
    lineWidth: 3,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'rm2',
    label: 'Sinc Derivative',
    latex: 'y = \\frac{\\pi x \\cos(\\pi x) - \\sin(\\pi x)}{\\pi x^2}',
    rawText: '(pi * x * cos(pi * x) - sin(pi * x)) / (pi * (x^2))',
    color: '#3B82F6',
    lineStyle: 'dashed',
    lineWidth: 1.5,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'rm3',
    label: 'Dirichlet η Critical Harmonic',
    latex: 'y = \\frac{\\cos(x\\ln 2)}{\\sqrt{2}} - \\frac{\\cos(x\\ln 3)}{\\sqrt{3}} + \\frac{\\cos(x\\ln 4)}{\\sqrt{4}}',
    rawText: 'cos(x * log(2)) / sqrt(2) - cos(x * log(3)) / sqrt(3) + cos(x * log(4)) / sqrt(4)',
    color: '#A855F7',
    lineWidth: 2,
    visible: true,
    type: 'cartesian',
  },
];

// 4. Laplace & System Dynamics
const LAPLACE_EXPRESSIONS: MathExpression[] = [
  {
    id: 'lp1',
    label: 'Laplace Distribution (Double Exp)',
    latex: 'y = 3e^{-|x|}',
    rawText: '3 * exp(-abs(x))',
    color: '#1DB954',
    lineWidth: 2.5,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'lp2',
    label: 'Underdamped Impulse Response',
    latex: 'y = 6x e^{-0.7x} \\sin(3x)',
    rawText: '6 * x * exp(-0.7 * x) * sin(3 * x)',
    color: '#06B6D4',
    lineWidth: 2.5,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'lp3',
    label: 'Critically Damped Impulse',
    latex: 'y = 5x e^{-x}',
    rawText: '5 * x * exp(-x)',
    color: '#F59E0B',
    lineWidth: 2,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'lp4',
    label: 'Overdamped Step Response',
    latex: 'y = 4(e^{-0.3x} - e^{-1.5x})',
    rawText: '4 * (exp(-0.3 * x) - exp(-1.5 * x))',
    color: '#EC4899',
    lineWidth: 2,
    visible: true,
    type: 'cartesian',
  },
];

// 5. Bessel & Wave Optics
const BESSEL_EXPRESSIONS: MathExpression[] = [
  {
    id: 'bs1',
    label: 'Bessel J₀ Diffraction',
    latex: 'y = \\frac{\\sin(x)}{x}',
    rawText: 'sin(x) / x',
    color: '#1DB954',
    lineWidth: 3,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'bs2',
    label: 'Bessel J₁ 1st Order',
    latex: 'y = \\frac{\\sin(x) - x\\cos(x)}{x^2}',
    rawText: '(sin(x) - x * cos(x)) / (x^2)',
    color: '#3B82F6',
    lineWidth: 2,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'bs3',
    label: 'Standing Wave Nodes',
    latex: 'y = 2\\cos(3x)\\sin(2x)',
    rawText: '2 * cos(3 * x) * sin(2 * x)',
    color: '#8B5CF6',
    lineStyle: 'dashed',
    lineWidth: 1.5,
    visible: true,
    type: 'cartesian',
  },
];

// 6. Transcendental & Butterfly
const EXOTIC_EXPRESSIONS: MathExpression[] = [
  {
    id: 'ex1',
    label: 'Butterfly Curve (Temple Fay)',
    latex: 'r = e^{\\sin\\theta} - 2\\cos(4\\theta) + \\sin^5\\left(\\frac{2\\theta-\\pi}{24}\\right)',
    rawText: 'exp(sin(theta)) - 2*cos(4*theta) + sin((2*theta - pi)/24)^5',
    color: '#EC4899',
    lineWidth: 2.5,
    visible: true,
    type: 'polar',
  },
  {
    id: 'ex2',
    label: 'Lemniscate of Bernoulli',
    latex: 'r = 4\\sqrt{|\\cos(2\\theta)|}',
    rawText: '4 * sqrt(abs(cos(2 * theta)))',
    color: '#1DB954',
    lineWidth: 2.5,
    visible: true,
    type: 'polar',
  },
  {
    id: 'ex3',
    label: 'Deltoid (3-Cusp Hypocycloid)',
    latex: 'x(t) = 2\\cos(t) + \\cos(2t), y(t) = 2\\sin(t) - \\sin(2t)',
    rawText: '2*cos(t) + cos(2*t)',
    parametricX: '2*cos(t) + cos(2*t)',
    parametricY: '2*sin(t) - sin(2*t)',
    color: '#3B82F6',
    lineWidth: 2.5,
    visible: true,
    type: 'parametric',
    domainMin: 0,
    domainMax: 6.283,
  },
];

// 7. Rational & Asymptotes
const ASYMPTOTE_EXPRESSIONS: MathExpression[] = [
  {
    id: 'a1',
    label: 'Hyperbola (1/x)',
    latex: 'y = 1 / x',
    rawText: '1 / x',
    color: '#1DB954',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'a2',
    label: 'Tangent Curve',
    latex: 'y = \\tan(x)',
    rawText: 'tan(x)',
    color: '#006241',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'a3',
    label: 'Rational Function',
    latex: 'y = (x^2 - 1)/(x^2 - 4)',
    rawText: '(x^2 - 1) / (x^2 - 4)',
    color: '#06B6D4',
    visible: true,
    type: 'cartesian',
  },
];

// 8. Polar Curves & Roses
const POLAR_EXPRESSIONS: MathExpression[] = [
  {
    id: 'p1',
    label: 'Cardioid',
    latex: 'r = 2(1 - \\cos\\theta)',
    rawText: '2 * (1 - cos(theta))',
    color: '#1DB954',
    visible: true,
    type: 'polar',
  },
  {
    id: 'p2',
    label: 'Rose 4-Petal',
    latex: 'r = 3 \\sin(4\\theta)',
    rawText: '3 * sin(4 * theta)',
    color: '#8B5CF6',
    visible: true,
    type: 'polar',
  },
  {
    id: 'p3',
    label: 'Archimedean Spiral',
    latex: 'r = 0.5\\theta',
    rawText: '0.5 * theta',
    color: '#EC4899',
    visible: true,
    type: 'polar',
  },
];

// 9. Wave Harmonics & Fourier
const FOURIER_EXPRESSIONS: MathExpression[] = [
  {
    id: 'f1',
    label: 'Fundamental Harmonic',
    latex: 'y = 3\\sin(x)',
    rawText: '3 * sin(x)',
    color: '#3B82F6',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'f2',
    label: '3rd Harmonic',
    latex: 'y = \\sin(3x)',
    rawText: 'sin(3 * x)',
    color: '#8B5CF6',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'f3',
    label: '5th Harmonic',
    latex: 'y = 0.6\\sin(5x)',
    rawText: '0.6 * sin(5 * x)',
    color: '#F59E0B',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'f4',
    label: 'Fourier Summation',
    latex: 'y = 3\\sin(x) + \\sin(3x) + 0.6\\sin(5x)',
    rawText: '3 * sin(x) + sin(3 * x) + 0.6 * sin(5 * x)',
    color: '#1DB954',
    lineWidth: 3,
    visible: true,
    type: 'cartesian',
  },
];

// 10. Exponential & Logistic Growth
const GROWTH_EXPRESSIONS: MathExpression[] = [
  {
    id: 'g1',
    label: 'Natural Exponential',
    latex: 'y = e^x',
    rawText: 'exp(x)',
    color: '#3B82F6',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'g2',
    label: 'Natural Logarithm',
    latex: 'y = \\ln(x)',
    rawText: 'log(x)',
    color: '#F59E0B',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'g3',
    label: 'Logistic Sigmoid',
    latex: 'y = 6 / (1 + e^{-x}) - 3',
    rawText: '6 / (1 + exp(-x)) - 3',
    color: '#1DB954',
    lineWidth: 3,
    visible: true,
    type: 'cartesian',
  },
];

// 11. Damped Oscillations
const PHYSICS_EXPRESSIONS: MathExpression[] = [
  {
    id: 'ph1',
    label: 'Underdamped Oscillator',
    latex: 'y = 4e^{-0.2x}\\cos(2x)',
    rawText: '4 * exp(-0.2 * x) * cos(2 * x)',
    color: '#1DB954',
    lineWidth: 3,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'ph2',
    label: 'Upper Decay Envelope',
    latex: 'y = 4e^{-0.2x}',
    rawText: '4 * exp(-0.2 * x)',
    color: '#EF4444',
    lineStyle: 'dashed',
    lineWidth: 1.5,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'ph3',
    label: 'Lower Decay Envelope',
    latex: 'y = -4e^{-0.2x}',
    rawText: '-4 * exp(-0.2 * x)',
    color: '#EF4444',
    lineStyle: 'dashed',
    lineWidth: 1.5,
    visible: true,
    type: 'cartesian',
  },
];

// 12. Probability Distributions
const STATISTICS_EXPRESSIONS: MathExpression[] = [
  {
    id: 'st1',
    label: 'Gaussian Bell Curve',
    latex: 'y = 4e^{-x^2 / 2}',
    rawText: '4 * exp(-(x^2) / 2)',
    color: '#1DB954',
    lineWidth: 3,
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'st2',
    label: 'Cauchy Distribution',
    latex: 'y = 4 / (1 + x^2)',
    rawText: '4 / (1 + x^2)',
    color: '#3B82F6',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'st3',
    label: 'Laplace Distribution',
    latex: 'y = 3e^{-|x|}',
    rawText: '3 * exp(-abs(x))',
    color: '#8B5CF6',
    visible: true,
    type: 'cartesian',
  },
];

// 13. Parametric & Lissajous
const PARAMETRIC_EXPRESSIONS: MathExpression[] = [
  {
    id: 'pr1',
    label: 'Lissajous Knot (3:2)',
    latex: 'x(t) = 4\\sin(3t), y(t) = 4\\cos(2t)',
    rawText: '4*sin(3*t)',
    parametricX: '4*sin(3*t)',
    parametricY: '4*cos(2*t)',
    color: '#1DB954',
    visible: true,
    type: 'parametric',
    domainMin: 0,
    domainMax: 6.283,
  },
  {
    id: 'pr2',
    label: 'Astroid Curve',
    latex: 'x(t) = 3\\cos^3(t), y(t) = 3\\sin^3(t)',
    rawText: '3*cos(t)^3',
    parametricX: '3*cos(t)^3',
    parametricY: '3*sin(t)^3',
    color: '#EC4899',
    visible: true,
    type: 'parametric',
    domainMin: 0,
    domainMax: 6.283,
  },
];

// 14. Conics & Circles
const CONICS_EXPRESSIONS: MathExpression[] = [
  {
    id: 'cn1',
    label: 'Ellipse (5, 3)',
    latex: 'x(t) = 5\\cos(t), y(t) = 3\\sin(t)',
    rawText: '5*cos(t)',
    parametricX: '5*cos(t)',
    parametricY: '3*sin(t)',
    color: '#1DB954',
    visible: true,
    type: 'parametric',
    domainMin: 0,
    domainMax: 6.283,
  },
  {
    id: 'cn2',
    label: 'Parabola',
    latex: 'y = 0.25x^2 - 3',
    rawText: '0.25 * x^2 - 3',
    color: '#3B82F6',
    visible: true,
    type: 'cartesian',
  },
  {
    id: 'cn3',
    label: 'Hyperbola Branch',
    latex: 'y = \\sqrt{x^2 + 4}',
    rawText: 'sqrt(x^2 + 4)',
    color: '#F59E0B',
    visible: true,
    type: 'cartesian',
  },
];

export const PRESET_DATA_MAP: Record<string, PresetData> = {
  // 1. Standard Overview
  prompt: { expressions: PROMPT_EXPRESSIONS, viewport: DEFAULT_VIEWPORT },
  'prompt:parabola': { expressions: [PROMPT_EXPRESSIONS[0]], viewport: DEFAULT_VIEWPORT },
  'prompt:sine': { expressions: [PROMPT_EXPRESSIONS[1]], viewport: DEFAULT_VIEWPORT },
  'prompt:spiral': { expressions: [PROMPT_EXPRESSIONS[2]], viewport: DEFAULT_VIEWPORT },

  // 2. Calculus & Polynomials
  calculus: { expressions: CALCULUS_EXPRESSIONS, viewport: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },
  'calculus:cubic': { expressions: [CALCULUS_EXPRESSIONS[0]], viewport: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },
  'calculus:quadratic': { expressions: [CALCULUS_EXPRESSIONS[1]], viewport: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },
  'calculus:secant': { expressions: [CALCULUS_EXPRESSIONS[2]], viewport: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },

  // 3. Riemann & Dirichlet Waves
  riemann: { expressions: RIEMANN_EXPRESSIONS, viewport: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 } },
  'riemann:sinc': { expressions: [RIEMANN_EXPRESSIONS[0]], viewport: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 } },
  'riemann:sinc_deriv': { expressions: [RIEMANN_EXPRESSIONS[1]], viewport: { xMin: -10, xMax: 10, yMin: -2, yMax: 2 } },
  'riemann:critical_strip': { expressions: [RIEMANN_EXPRESSIONS[2]], viewport: { xMin: -15, xMax: 15, yMin: -2.5, yMax: 2.5 } },

  // 4. Laplace & System Dynamics
  laplace: { expressions: LAPLACE_EXPRESSIONS, viewport: { xMin: -2, xMax: 12, yMin: -3, yMax: 5 } },
  'laplace:double_exp': { expressions: [LAPLACE_EXPRESSIONS[0]], viewport: { xMin: -5, xMax: 5, yMin: -1, yMax: 4 } },
  'laplace:underdamped': { expressions: [LAPLACE_EXPRESSIONS[1]], viewport: { xMin: -1, xMax: 10, yMin: -3, yMax: 5 } },
  'laplace:critically_damped': { expressions: [LAPLACE_EXPRESSIONS[2]], viewport: { xMin: -1, xMax: 8, yMin: -1, yMax: 3 } },
  'laplace:overdamped': { expressions: [LAPLACE_EXPRESSIONS[3]], viewport: { xMin: -1, xMax: 8, yMin: -1, yMax: 3 } },

  // 5. Bessel & Wave Optics
  bessel: { expressions: BESSEL_EXPRESSIONS, viewport: { xMin: -15, xMax: 15, yMin: -2.5, yMax: 2.5 } },
  'bessel:j0': { expressions: [BESSEL_EXPRESSIONS[0]], viewport: { xMin: -15, xMax: 15, yMin: -2, yMax: 2 } },
  'bessel:j1': { expressions: [BESSEL_EXPRESSIONS[1]], viewport: { xMin: -15, xMax: 15, yMin: -2, yMax: 2 } },
  'bessel:standing_wave': { expressions: [BESSEL_EXPRESSIONS[2]], viewport: { xMin: -10, xMax: 10, yMin: -3, yMax: 3 } },

  // 6. Transcendental & Butterfly
  exotic: { expressions: EXOTIC_EXPRESSIONS, viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'exotic:butterfly': { expressions: [EXOTIC_EXPRESSIONS[0]], viewport: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },
  'exotic:lemniscate': { expressions: [EXOTIC_EXPRESSIONS[1]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'exotic:deltoid': { expressions: [EXOTIC_EXPRESSIONS[2]], viewport: { xMin: -4, xMax: 4, yMin: -4, yMax: 4 } },

  // 7. Rational & Asymptotes
  asymptotes: { expressions: ASYMPTOTE_EXPRESSIONS, viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'asymptotes:hyperbola': { expressions: [ASYMPTOTE_EXPRESSIONS[0]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'asymptotes:tan': { expressions: [ASYMPTOTE_EXPRESSIONS[1]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'asymptotes:rational': { expressions: [ASYMPTOTE_EXPRESSIONS[2]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },

  // 8. Polar Curves & Roses
  polar: { expressions: POLAR_EXPRESSIONS, viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'polar:cardioid': { expressions: [POLAR_EXPRESSIONS[0]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'polar:rose': { expressions: [POLAR_EXPRESSIONS[1]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'polar:archimedes': { expressions: [POLAR_EXPRESSIONS[2]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },

  // 9. Wave Harmonics & Fourier
  fourier: { expressions: FOURIER_EXPRESSIONS, viewport: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 } },
  'fourier:fundamental': { expressions: [FOURIER_EXPRESSIONS[0]], viewport: { xMin: -8, xMax: 8, yMin: -5, yMax: 5 } },
  'fourier:harmonic3': { expressions: [FOURIER_EXPRESSIONS[1]], viewport: { xMin: -8, xMax: 8, yMin: -5, yMax: 5 } },
  'fourier:harmonic5': { expressions: [FOURIER_EXPRESSIONS[2]], viewport: { xMin: -8, xMax: 8, yMin: -5, yMax: 5 } },
  'fourier:sum': { expressions: [FOURIER_EXPRESSIONS[3]], viewport: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 } },

  // 10. Exponential & Logistic Growth
  growth: { expressions: GROWTH_EXPRESSIONS, viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'growth:exp': { expressions: [GROWTH_EXPRESSIONS[0]], viewport: { xMin: -4, xMax: 4, yMin: -1, yMax: 10 } },
  'growth:ln': { expressions: [GROWTH_EXPRESSIONS[1]], viewport: { xMin: -1, xMax: 10, yMin: -4, yMax: 4 } },
  'growth:sigmoid': { expressions: [GROWTH_EXPRESSIONS[2]], viewport: { xMin: -6, xMax: 6, yMin: -4, yMax: 4 } },

  // 11. Damped Oscillations
  physics: { expressions: PHYSICS_EXPRESSIONS, viewport: { xMin: -1, xMax: 15, yMin: -5, yMax: 5 } },
  'physics:damped': { expressions: [PHYSICS_EXPRESSIONS[0]], viewport: { xMin: -1, xMax: 15, yMin: -5, yMax: 5 } },
  'physics:upper_env': { expressions: [PHYSICS_EXPRESSIONS[1]], viewport: { xMin: -1, xMax: 15, yMin: -5, yMax: 5 } },
  'physics:lower_env': { expressions: [PHYSICS_EXPRESSIONS[2]], viewport: { xMin: -1, xMax: 15, yMin: -5, yMax: 5 } },

  // 12. Probability Distributions
  statistics: { expressions: STATISTICS_EXPRESSIONS, viewport: { xMin: -5, xMax: 5, yMin: -1, yMax: 5 } },
  'statistics:gaussian': { expressions: [STATISTICS_EXPRESSIONS[0]], viewport: { xMin: -5, xMax: 5, yMin: -1, yMax: 5 } },
  'statistics:cauchy': { expressions: [STATISTICS_EXPRESSIONS[1]], viewport: { xMin: -5, xMax: 5, yMin: -1, yMax: 5 } },
  'statistics:laplace': { expressions: [STATISTICS_EXPRESSIONS[2]], viewport: { xMin: -5, xMax: 5, yMin: -1, yMax: 4 } },

  // 13. Parametric & Lissajous
  parametric: { expressions: PARAMETRIC_EXPRESSIONS, viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'parametric:lissajous': { expressions: [PARAMETRIC_EXPRESSIONS[0]], viewport: { xMin: -6, xMax: 6, yMin: -6, yMax: 6 } },
  'parametric:astroid': { expressions: [PARAMETRIC_EXPRESSIONS[1]], viewport: { xMin: -5, xMax: 5, yMin: -5, yMax: 5 } },

  // 14. Conics & Circles
  conics: { expressions: CONICS_EXPRESSIONS, viewport: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 } },
  'conics:ellipse': { expressions: [CONICS_EXPRESSIONS[0]], viewport: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 } },
  'conics:parabola': { expressions: [CONICS_EXPRESSIONS[1]], viewport: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 } },
  'conics:hyperbola': { expressions: [CONICS_EXPRESSIONS[2]], viewport: { xMin: -8, xMax: 8, yMin: -8, yMax: 8 } },
};
