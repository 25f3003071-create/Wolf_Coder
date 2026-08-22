'use client';

import React, { useMemo } from 'react';

export const QRCodeGenerator: React.FC<{ value: string; size?: number; className?: string }> = ({ value, size = 180, className = '' }) => {
  const cells = useMemo(() => {
    const grid = 21;
    const matrix: boolean[][] = Array.from({ length: grid }, () => Array(grid).fill(false));

    const drawFinder = (sr: number, sc: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            matrix[sr + r][sc + c] = true;
          }
        }
      }
    };

    drawFinder(0, 0); drawFinder(0, grid - 7); drawFinder(grid - 7, 0);
    for (let i = 8; i < grid - 8; i++) { if (i % 2 === 0) { matrix[6][i] = true; matrix[i][6] = true; } }

    let hash = 0;
    for (let i = 0; i < value.length; i++) hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;

    let seed = Math.abs(hash);
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        if (!(r < 8 && c < 8) && !(r < 8 && c >= grid - 8) && !(r >= grid - 8 && c < 8) && r !== 6 && c !== 6) {
          seed += 1;
          const x = Math.sin(seed + r * 31 + c) * 10000;
          matrix[r][c] = (x - Math.floor(x)) > 0.45;
        }
      }
    }
    return matrix;
  }, [value]);

  return (
    <div className={`p-3 bg-white rounded-2xl shadow-xl border border-slate-700/50 inline-block ${className}`} style={{ width: size + 24, height: size + 24 }}>
      <svg viewBox="0 0 21 21" className="w-full h-full" shapeRendering="crispEdges" aria-label={`QR Code for ${value}`}>
        <rect width={21} height={21} fill="#FFFFFF" />
        {cells.map((row, r) => row.map((dark, c) => dark && <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0F172A" />))}
      </svg>
    </div>
  );
};
