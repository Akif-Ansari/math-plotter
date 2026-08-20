export type MathFunctionType = 'cartesian' | 'implicit' | 'x_of_y' | 'polar' | 'parametric';
export type LineStyleType = 'solid' | 'dashed' | 'dotted';

export interface Point2D {
  x: number;
  y: number;
}

export interface SnapPoint {
  x: number;
  y: number;
  label: string;
  type: 'root' | 'y-intercept' | 'extrema' | 'asymptote' | 'intersection';
  color?: string;
  expressionId?: string;
}

export interface MathExpression {
  id: string;
  label?: string;      // Custom name/label for the expression
  latex: string;       // E.g., "y = x^2 - 2" or "y^2 = x"
  rawText: string;     // E.g., "x^2 - 2" or "y^2 = x"
  color: string;
  lineStyle?: LineStyleType;
  lineWidth?: number;
  visible: boolean;
  type: MathFunctionType;
  // For parametric equations
  parametricX?: string; // x(t)
  parametricY?: string; // y(t)
  domainMin?: number;
  domainMax?: number;
}

export interface Asymptote {
  type: 'vertical' | 'horizontal';
  value: number; // x = value or y = value
  label: string;
}

export interface CriticalPointAnalysis {
  x: number;
  label: string;
  type: 'discontinuity' | 'non-differentiable' | 'root' | 'extrema';
  reason: string;
}

export interface InflectionPoint {
  x: number;
  y: number;
  /** Whether concavity changes from up→down or down→up */
  changeType: 'up-to-down' | 'down-to-up';
}

export interface ConcavityInterval {
  from: number;
  to: number;
  direction: 'up' | 'down';
  label: string;
}

export interface NumericalRootResult {
  method: 'bisection' | 'newton' | 'secant';
  root: number | null;
  iterations: number;
  converged: boolean;
  error?: string;
  steps: { iter: number; x: number; fx: number }[];
}

export interface PointCalculusReport {
  x: number;
  fX: string;
  leftLimit: string;
  rightLimit: string;
  limitValue: string;
  limitExists: boolean;
  isContinuous: boolean;
  discontinuityType: string;
  isDifferentiable: boolean;
  nonDiffReason: string;
  leftDerivative?: string;
  rightDerivative?: string;
}

export interface AnalysisResult {
  expressionId: string;
  rawText: string;
  domain: string;
  range: string;
  roots: Point2D[];
  rootCount: number;
  yIntercept?: Point2D;
  extrema: Point2D[];
  asymptotes: Asymptote[];
  derivativeText?: string;
  isEvaluatable: boolean;
  error?: string;
  criticalPoints?: CriticalPointAnalysis[];
  inflectionPoints?: InflectionPoint[];
  concavityIntervals?: ConcavityInterval[];
}

export interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface TangentInfo {
  expressionId: string;
  expressionColor: string;
  rawText: string;
  x: number;
  y: number;
  slope: number;
  equation: string;
  angleDegrees: number;
}

export interface IntegralConfig {
  enabled: boolean;
  expressionId: string;
  expressionId2?: string | null;
  a: number;
  b: number;
  method: 'exact' | 'left' | 'right' | 'midpoint' | 'trapezoidal';
  n: number;
}
