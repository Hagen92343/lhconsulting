'use client';

import { useEffect, useRef, useCallback } from 'react';

interface DataStreamProps {
  className?: string;
  style?: React.CSSProperties;
  density?: 'low' | 'medium' | 'high';
}

interface Column {
  x: number;
  chars: { char: string; y: number; opacity: number }[];
  speed: number;
  active: boolean;
  nextActivation: number;
  charSize: number;
  headY: number;
  trailLength: number;
}

// Character sets: binary, ascii subset, katakana-like
const CHAR_SETS = [
  '01',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}[]|/\\',
  '\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8',
];

const DENSITY_CONFIG = {
  low: { columnGap: 40, activeRatio: 0.25, trailMin: 6, trailMax: 14 },
  medium: { columnGap: 28, activeRatio: 0.4, trailMin: 8, trailMax: 20 },
  high: { columnGap: 18, activeRatio: 0.6, trailMin: 10, trailMax: 26 },
};

function randomChar(): string {
  const set = CHAR_SETS[Math.floor(Math.random() * CHAR_SETS.length)];
  return set[Math.floor(Math.random() * set.length)];
}

export default function DataStream({ className, style, density = 'low' }: DataStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const columnsRef = useRef<Column[]>([]);
  const reducedMotionRef = useRef<boolean>(false);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const config = DENSITY_CONFIG[density];

  const initColumns = useCallback((w: number, h: number) => {
    const cols: Column[] = [];
    const numCols = Math.floor(w / config.columnGap);

    for (let i = 0; i < numCols; i++) {
      const x = i * config.columnGap + config.columnGap / 2 + (Math.random() - 0.5) * 8;
      const active = Math.random() < config.activeRatio;
      cols.push({
        x,
        chars: [],
        speed: 0.04 + Math.random() * 0.06,
        active,
        nextActivation: active ? 0 : 2000 + Math.random() * 6000,
        charSize: 12 + Math.floor(Math.random() * 4),
        headY: active ? -(Math.random() * h) : -50,
        trailLength: config.trailMin + Math.floor(Math.random() * (config.trailMax - config.trailMin)),
      });
    }
    return cols;
  }, [config]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, delta: number) => {
    const reduced = reducedMotionRef.current;
    const columns = columnsRef.current;

    ctx.clearRect(0, 0, w, h);

    if (reduced) {
      // Static state: draw a few frozen columns
      ctx.font = '13px "JetBrains Mono", monospace';
      for (const col of columns) {
        if (!col.active) continue;
        for (let i = 0; i < col.trailLength; i++) {
          const y = h * 0.3 + i * col.charSize * 1.2;
          if (y > h) break;
          const progress = i / col.trailLength;
          const alpha = (1 - progress) * 0.4;
          ctx.fillStyle = i === 0
            ? `rgba(0, 200, 255, 0.8)`
            : `rgba(0, 200, 255, ${alpha})`;
          ctx.fillText(randomChar(), col.x, y);
        }
      }
      return;
    }

    ctx.textAlign = 'center';

    for (const col of columns) {
      // Handle activation/deactivation
      if (!col.active) {
        col.nextActivation -= delta;
        if (col.nextActivation <= 0) {
          col.active = true;
          col.headY = -50;
          col.speed = 0.04 + Math.random() * 0.06;
          col.trailLength = config.trailMin + Math.floor(Math.random() * (config.trailMax - config.trailMin));
        }
        continue;
      }

      // Move head down
      col.headY += col.speed * delta;

      // Draw characters in the trail
      ctx.font = `${col.charSize}px "JetBrains Mono", "Fira Code", monospace`;
      const charSpacing = col.charSize * 1.3;

      for (let i = 0; i < col.trailLength; i++) {
        const y = col.headY - i * charSpacing;
        if (y < -charSpacing || y > h + charSpacing) continue;

        const progress = i / col.trailLength;

        if (i === 0) {
          // Leading character: bright white/cyan
          ctx.fillStyle = 'rgba(220, 255, 255, 0.95)';
          ctx.shadowColor = 'rgba(0, 200, 255, 0.8)';
          ctx.shadowBlur = 12;
        } else if (i === 1) {
          ctx.fillStyle = 'rgba(0, 200, 255, 0.8)';
          ctx.shadowColor = 'rgba(0, 200, 255, 0.4)';
          ctx.shadowBlur = 6;
        } else {
          // Fade out along trail
          const alpha = Math.max(0, (1 - progress) * 0.5);
          ctx.fillStyle = `rgba(0, 200, 255, ${alpha})`;
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }

        // Occasionally change characters mid-stream
        const char = (Math.random() > 0.97) ? randomChar() : randomChar();
        ctx.fillText(char, col.x, y);
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      // Deactivate when trail fully passed the bottom
      if (col.headY - col.trailLength * charSpacing > h) {
        col.active = false;
        col.nextActivation = 1000 + Math.random() * 5000;
      }
    }
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener('change', handleMotionChange);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: rect.width, h: rect.height };
      columnsRef.current = initColumns(rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    if (reducedMotionRef.current) {
      draw(ctx, sizeRef.current.w, sizeRef.current.h, 0);
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;

      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, sizeRef.current.w, sizeRef.current.h, delta);

      if (!reducedMotionRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    if (!reducedMotionRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [draw, initColumns]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
