'use client';

import React, { useEffect, useRef } from 'react';
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
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
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
    }
  }, [latex, displayMode]);

  return <span ref={containerRef} className={`inline-block ${className}`} />;
}
