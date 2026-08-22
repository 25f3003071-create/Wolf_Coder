'use client';

import React, { useMemo } from 'react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 180,
  className = '',
}) => {
  const cells = useMemo(() => {
    const gridSize = 21; // 21x21 QR Version 1 Matrix
    const matrix: boolean[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );

    // Draw Finder Patterns (7x7 boxes at 3 corners)
    const drawFinderPattern = (startRow: number, startCol: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 ||
            c === 0 ||
            c === 6 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            matrix[startRow + r][startCol + c] = true;
          }
        }
      }
    };

    drawFinderPattern(0, 0);
    drawFinderPattern(0, gridSize - 7);
    drawFinderPattern(gridSize - 7, 0);

    // Draw Timing Patterns
    for (let i = 8; i < gridSize - 8; i++) {
      if (i % 2 === 0) {
        matrix[6][i] = true;
        matrix[i][6] = true;
      }
    }

    // Hash input string into a deterministic byte array to populate data cells
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }

    const pseudoRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    let seedOffset = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const isTopLeftFinder = r < 8 && c < 8;
        const isTopRightFinder = r < 8 && c >= gridSize - 8;
        const isBottomLeftFinder = r >= gridSize - 8 && c < 8;
        const isTiming = r === 6 || c === 6;

        if (!isTopLeftFinder && !isTopRightFinder && !isBottomLeftFinder && !isTiming) {
          seedOffset += 1;
          matrix[r][c] = pseudoRandom(seedOffset + r * 31 + c) > 0.45;
        }
      }
    }

    return matrix;
  }, [value]);

  const gridSize = cells.length;

  return (
    <div
      className={`p-3 bg-white rounded-2xl shadow-xl border border-slate-700/50 inline-block ${className}`}
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="w-full h-full"
        shapeRendering="crispEdges"
        aria-label={`QR Code for ${value}`}
      >
        <rect width={gridSize} height={gridSize} fill="#FFFFFF" />
        {cells.map((row, r) =>
          row.map(
            (isDark, c) =>
              isDark && (
                <rect
                  key={`${r}-${c}`}
                  x={c}
                  y={r}
                  width={1}
                  height={1}
                  fill="#0F172A"
                />
              )
          )
        )}
      </svg>
    </div>
  );
};
