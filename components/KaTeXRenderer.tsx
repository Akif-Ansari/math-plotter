'use client';

import React from 'react';
import katex from 'katex';

interface KaTeXRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export default function KaTeXRenderer({
  latex,
  displayMode = false,
  className = '',
}: KaTeXRendererProps) {
  const containerRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    try {
      katex.render(latex, containerRef.current, {
        displayMode,
        throwOnError: false,
      });
    } catch {
      if (containerRef.current) {
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} suppressHydrationWarning />;
}
