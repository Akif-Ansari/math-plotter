'use client';

import React from 'react';
import Header from '@/components/Header';
import ExpressionList from '@/components/ExpressionList';
import GraphCanvas from '@/components/GraphCanvas';
import AnalysisModal from '@/components/AnalysisModal';
import TableModal from '@/components/TableModal';
import IntegralControlModal from '@/components/IntegralControlModal';
import ParameterSlidersBar from '@/components/ParameterSlidersBar';
import Footer from '@/components/Footer';
import { MathExpression, Viewport, AnalysisResult, IntegralConfig } from '@/types/math';
import { extractParameters } from '@/lib/math-engine/parser';


const INITIAL_EXPRESSIONS: MathExpression[] = [
  {
    id: '1',
    label: 'Default Parabola',
    latex: 'y = x^2 - 2',
    rawText: 'x^2 - 2',
    color: '#1DB954',
    lineStyle: 'solid',
    lineWidth: 2.5,
    visible: true,
    type: 'cartesian',
  },
];

const DEFAULT_VIEWPORT: Viewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

export default function Home() {
  const [expressions, setExpressions] = React.useState<MathExpression[]>(INITIAL_EXPRESSIONS);
  const [viewport, setViewport] = React.useState<Viewport>(DEFAULT_VIEWPORT);
  const [isDarkTheme, setIsDarkTheme] = React.useState<boolean>(true);
  const [analyses, setAnalyses] = React.useState<Record<string, AnalysisResult>>({});
  const [selectedAnalysisId, setSelectedAnalysisId] = React.useState<string | null>(null);
  const [isTableOpen, setIsTableOpen] = React.useState<boolean>(false);
  const [tableExpressionId, setTableExpressionId] = React.useState<string | null>(null);

  // Dynamic parameters state (a, b, c, k, m)
  const [parameters, setParameters] = React.useState<Record<string, number>>({
    a: 1,
    b: 1,
    c: 0,
    k: 1,
    m: 1,
  });

  // Definite Integral & Riemann Sums state
  const [integralConfig, setIntegralConfig] = React.useState<IntegralConfig>({
    enabled: false,
    expressionId: '1',
    a: 0,
    b: 2,
    method: 'exact',
    n: 10,
  });
  const [isIntegralOpen, setIsIntegralOpen] = React.useState<boolean>(false);

  // Detect active parameters across visible expressions
  const detectedParams = React.useMemo(() => {
    const found = new Set<string>();
    expressions.forEach((expr) => {
      if (expr.visible) {
        const p = extractParameters(expr.rawText);
        p.forEach((param) => found.add(param));
      }
    });
    return Array.from(found);
  }, [expressions]);

  const handleParameterChange = React.useCallback((name: string, val: number) => {
    setParameters((prev) => ({ ...prev, [name]: val }));
  }, []);

  const handleParameterReset = React.useCallback((name: string) => {
    setParameters((prev) => ({ ...prev, [name]: name === 'c' ? 0 : 1 }));
  }, []);

  // Memoized analysis update to prevent React render loops
  const handleAnalysisUpdate = React.useCallback((newAnalyses: Record<string, AnalysisResult>) => {
    setAnalyses(newAnalyses);
  }, []);

  // Expression actions
  const handleAddExpression = () => {
    const newExpr: MathExpression = {
      id: Date.now().toString(),
      latex: 'y = x',
      rawText: 'x',
      color: expressions.length % 2 === 0 ? '#1DB954' : '#006241',
      lineStyle: 'solid',
      lineWidth: 2.5,
      visible: true,
      type: 'cartesian',
    };
    setExpressions((prev) => [...prev, newExpr]);
  };

  const handleUpdateExpression = (id: string, updated: Partial<MathExpression>) => {
    setExpressions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const handleDeleteExpression = (id: string) => {
    setExpressions((prev) => prev.filter((e) => e.id !== id));
    if (selectedAnalysisId === id) setSelectedAnalysisId(null);
  };

  const handleDuplicateExpression = (id: string) => {
    const target = expressions.find((e) => e.id === id);
    if (!target) return;
    const duplicated: MathExpression = {
      ...target,
      id: Date.now().toString(),
      label: target.label ? `${target.label} (Copy)` : undefined,
    };
    setExpressions((prev) => [...prev, duplicated]);
  };

  // Presets selector handler
  const handleSelectPreset = (presetName: string) => {
    switch (presetName) {
      case 'prompt':
        setExpressions([
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
        ]);
        setViewport(DEFAULT_VIEWPORT);
        break;
      case 'calculus':
        setExpressions([
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
        ]);
        setViewport({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
        break;
      case 'riemann':
        setExpressions([
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
        ]);
        setViewport({ xMin: -10, xMax: 10, yMin: -2, yMax: 2 });
        break;
      case 'laplace':
        setExpressions([
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
        ]);
        setViewport({ xMin: -2, xMax: 12, yMin: -3, yMax: 5 });
        break;
      case 'bessel':
        setExpressions([
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
        ]);
        setViewport({ xMin: -15, xMax: 15, yMin: -2.5, yMax: 2.5 });
        break;
      case 'exotic':
        setExpressions([
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
        ]);
        setViewport({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
        break;
      case 'asymptotes':
        setExpressions([
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
        ]);
        setViewport({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
        break;
      case 'polar':
        setExpressions([
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
        ]);
        setViewport({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
        break;
      case 'fourier':
        setExpressions([
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
        ]);
        setViewport({ xMin: -8, xMax: 8, yMin: -6, yMax: 6 });
        break;
      case 'growth':
        setExpressions([
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
        ]);
        setViewport({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
        break;
      case 'physics':
        setExpressions([
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
        ]);
        setViewport({ xMin: -1, xMax: 15, yMin: -5, yMax: 5 });
        break;
      case 'statistics':
        setExpressions([
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
        ]);
        setViewport({ xMin: -5, xMax: 5, yMin: -1, yMax: 5 });
        break;
      case 'parametric':
        setExpressions([
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
        ]);
        setViewport({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
        break;
      case 'conics':
        setExpressions([
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
        ]);
        setViewport({ xMin: -8, xMax: 8, yMin: -8, yMax: 8 });
        break;
    }
  };

  // Export Canvas Image PNG
  const handleExportImage = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mathplotter_graph.png';
    a.click();
  };

  const selectedExpression = expressions.find((e) => e.id === selectedAnalysisId);
  const selectedAnalysis = selectedAnalysisId ? analyses[selectedAnalysisId] : null;



  return (
    <div className={`flex flex-col h-screen w-screen font-sans overflow-hidden transition-colors duration-200 ${isDarkTheme ? 'bg-zinc-950 text-white' : 'bg-slate-100 text-zinc-900'
      }`}>
      {/* Top Navigation Bar */}
      <Header
        onResetView={() => setViewport(DEFAULT_VIEWPORT)}
        onSelectPreset={handleSelectPreset}
        onExportImage={handleExportImage}
        isDarkTheme={isDarkTheme}
        onToggleTheme={() => setIsDarkTheme((prev) => !prev)}
        onOpenTable={() => {
          setTableExpressionId(null);
          setIsTableOpen(true);
        }}
        onOpenIntegral={() => setIsIntegralOpen(true)}
      />

      {/* Main Graphing Interface */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Expression List & Keypad */}
        <ExpressionList
          expressions={expressions}
          onAddExpression={handleAddExpression}
          onUpdateExpression={handleUpdateExpression}
          onDeleteExpression={handleDeleteExpression}
          onDuplicateExpression={handleDuplicateExpression}
          onOpenAnalysis={(id) => setSelectedAnalysisId(id)}
          onOpenTable={(id) => {
            setTableExpressionId(id || null);
            setIsTableOpen(true);
          }}
          onOpenIntegral={(id) => {
            setIntegralConfig((prev) => ({ ...prev, expressionId: id, enabled: true }));
            setIsIntegralOpen(true);
          }}
          analyses={analyses}
          isDarkTheme={isDarkTheme}
        />

        {/* Right Pane: Interactive 60FPS Graph Canvas */}
        <GraphCanvas
          expressions={expressions}
          viewport={viewport}
          onViewportChange={setViewport}
          isDarkTheme={isDarkTheme}
          onAnalysisUpdate={handleAnalysisUpdate}
          parameters={parameters}
          integralConfig={integralConfig}
          onOpenIntegralModal={() => setIsIntegralOpen(true)}
        />

        {/* Floating Parameter Sliders Bar */}
        <ParameterSlidersBar
          parameters={parameters}
          onChangeParameter={handleParameterChange}
          onResetParameter={handleParameterReset}
          detectedParams={detectedParams}
          isDarkTheme={isDarkTheme}
        />
      </main>

      {/* Deep Calculus Analysis Modal */}
      {selectedAnalysisId && (
        <AnalysisModal
          analysis={selectedAnalysis}
          expressionColor={selectedExpression?.color}
          onClose={() => setSelectedAnalysisId(null)}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Interactive Table of Values Modal */}
      {isTableOpen && (
        <TableModal
          expressions={expressions}
          initialExpressionId={tableExpressionId}
          viewport={viewport}
          onClose={() => setIsTableOpen(false)}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Definite Integral & Riemann Sums Control Modal */}
      {isIntegralOpen && (
        <IntegralControlModal
          expressions={expressions}
          config={integralConfig}
          onChangeConfig={setIntegralConfig}
          onClose={() => setIsIntegralOpen(false)}
          parameters={parameters}
          isDarkTheme={isDarkTheme}
        />
      )}

      {/* Bottom Corner Tech Stack Hints */}
      <Footer isDarkTheme={isDarkTheme} />
    </div>
  );
}
