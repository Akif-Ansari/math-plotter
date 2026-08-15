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
    color: '#10B981', // Green
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
      color: '#3B82F6',
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
            color: '#10B981',
            visible: true,
            type: 'cartesian',
          },
          {
            id: '2',
            label: 'Sine Wave',
            latex: 'y = 3\\sin(2x)',
            rawText: '3 * sin(2 * x)',
            color: '#3B82F6',
            visible: true,
            type: 'cartesian',
          },
          {
            id: '3',
            label: 'Polar Spiral',
            latex: 'r = 3\\theta',
            rawText: '3 * theta',
            color: '#EF4444',
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
            latex: 'y = x^3 - 3x',
            rawText: 'x^3 - 3*x',
            color: '#10B981',
            visible: true,
            type: 'cartesian',
          },
          {
            id: 'c2',
            latex: 'y = x^2 - 4',
            rawText: 'x^2 - 4',
            color: '#3B82F6',
            visible: true,
            type: 'cartesian',
          },
        ]);
        setViewport({ xMin: -5, xMax: 5, yMin: -5, yMax: 5 });
        break;
      case 'asymptotes':
        setExpressions([
          {
            id: 'a1',
            latex: 'y = 1 / x',
            rawText: '1 / x',
            color: '#EF4444',
            visible: true,
            type: 'cartesian',
          },
          {
            id: 'a2',
            latex: 'y = \\tan(x)',
            rawText: 'tan(x)',
            color: '#8B5CF6',
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
            latex: 'r = 2(1 - \\cos\\theta)',
            rawText: '2 * (1 - cos(theta))',
            color: '#EC4899',
            visible: true,
            type: 'polar',
          },
          {
            id: 'p2',
            latex: 'r = 3 \\sin(4\\theta)',
            rawText: '3 * sin(4 * theta)',
            color: '#06B6D4',
            visible: true,
            type: 'polar',
          },
        ]);
        setViewport({ xMin: -6, xMax: 6, yMin: -6, yMax: 6 });
        break;
      case 'conics':
        setExpressions([
          {
            id: 'cn1',
            latex: 'x(t) = 4\\cos(t), y(t) = 4\\sin(t)',
            rawText: '4*cos(t)',
            parametricX: '4*cos(t)',
            parametricY: '4*sin(t)',
            color: '#F59E0B',
            visible: true,
            type: 'parametric',
            domainMin: 0,
            domainMax: 6.28,
          },
          {
            id: 'cn2',
            latex: 'y = 0.5x^2',
            rawText: '0.5 * x^2',
            color: '#10B981',
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
    <div className="flex flex-col h-screen w-screen bg-zinc-950 font-sans overflow-hidden">
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
        />
      </main>

      {/* Deep Calculus Analysis Modal */}
      {selectedAnalysisId && (
        <AnalysisModal
          analysis={selectedAnalysis}
          expressionColor={selectedExpression?.color}
          onClose={() => setSelectedAnalysisId(null)}
        />
      )}

      {/* Interactive Table of Values Modal */}
      {isTableOpen && (
        <TableModal
          expressions={expressions}
          initialExpressionId={tableExpressionId}
          viewport={viewport}
          onClose={() => setIsTableOpen(false)}
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
        />
      )}

      {/* Bottom Corner Tech Stack Hints */}
      <Footer />
    </div>
  );
}
