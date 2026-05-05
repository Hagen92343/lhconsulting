'use client';

import { useEffect, useRef, useCallback } from 'react';

interface CyberGridProps {
  className?: string;
  style?: React.CSSProperties;
}

interface GlowCell {
  col: number;
  row: number;
  opacity: number;
  decay: number;
}

export default function CyberGrid({ className, style }: CyberGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const scrollOffsetRef = useRef<number>(0);
  const glowCellsRef = useRef<GlowCell[]>([]);
  const nextGlowRef = useRef<number>(0);
  const reducedMotionRef = useRef<boolean>(false);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, delta: number) => {
    const reduced = reducedMotionRef.current;

    ctx.clearRect(0, 0, w, h);

    // Vanishing point
    const vpX = w * 0.5;
    const vpY = h * 0.18;

    // Grid parameters
    const horizonY = vpY;
    const bottomY = h + 40;
    const numVerticalLines = 30;
    const numHorizontalLines = 24;
    const gridSpreadAtBottom = w * 1.8;

    // Scroll the horizontal lines toward the viewer
    if (!reduced) {
      scrollOffsetRef.current += delta * 0.03;
      if (scrollOffsetRef.current > 1) scrollOffsetRef.current -= 1;
    }

    // Draw vertical grid lines
    for (let i = 0; i <= numVerticalLines; i++) {
      const t = i / numVerticalLines;
      const bottomX = vpX - gridSpreadAtBottom / 2 + gridSpreadAtBottom * t;

      ctx.beginPath();
      ctx.moveTo(vpX, horizonY);
      ctx.lineTo(bottomX, bottomY);

      // Brighter toward center
      const centerDist = Math.abs(t - 0.5) * 2;
      const alpha = 0.06 + (1 - centerDist) * 0.08;
      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Draw horizontal lines with perspective
    for (let i = 0; i < numHorizontalLines; i++) {
      // Apply scroll offset for movement illusion
      let rawT = (i + scrollOffsetRef.current) / numHorizontalLines;
      if (rawT > 1) rawT -= 1;

      // Exponential distribution for perspective effect
      const perspT = Math.pow(rawT, 2.8);
      const y = horizonY + (bottomY - horizonY) * perspT;

      if (y < horizonY || y > bottomY) continue;

      // Width at this y position
      const yFraction = (y - horizonY) / (bottomY - horizonY);
      const lineHalfWidth = (gridSpreadAtBottom / 2) * yFraction;

      // Opacity: brighter closer to viewer
      const alpha = 0.03 + yFraction * 0.12;

      ctx.beginPath();
      ctx.moveTo(vpX - lineHalfWidth, y);
      ctx.lineTo(vpX + lineHalfWidth, y);
      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx.lineWidth = 0.8 + yFraction * 0.6;
      ctx.stroke();
    }

    // Manage glowing cells
    if (!reduced) {
      nextGlowRef.current -= delta;
      if (nextGlowRef.current <= 0) {
        nextGlowRef.current = 300 + Math.random() * 800;
        const col = Math.floor(Math.random() * numVerticalLines);
        const row = Math.floor(Math.random() * numHorizontalLines);
        glowCellsRef.current.push({ col, row, opacity: 0.6 + Math.random() * 0.4, decay: 0.0008 + Math.random() * 0.001 });
      }

      // Draw and update glow cells
      glowCellsRef.current = glowCellsRef.current.filter((cell) => {
        cell.opacity -= cell.decay * delta;
        if (cell.opacity <= 0) return false;

        const rowT = Math.pow((cell.row + 0.5) / numHorizontalLines, 2.8);
        const cy = horizonY + (bottomY - horizonY) * rowT;
        const yFraction = (cy - horizonY) / (bottomY - horizonY);
        const lineHalfWidth = (gridSpreadAtBottom / 2) * yFraction;

        const colT = cell.col / numVerticalLines;
        const nextColT = (cell.col + 1) / numVerticalLines;
        const cx1 = vpX - lineHalfWidth + lineHalfWidth * 2 * colT;
        const cx2 = vpX - lineHalfWidth + lineHalfWidth * 2 * nextColT;
        const cx = (cx1 + cx2) / 2;

        const cellSize = Math.max(4, yFraction * 30);

        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, cellSize);
        gradient.addColorStop(0, `rgba(0, 200, 255, ${cell.opacity * 0.3})`);
        gradient.addColorStop(0.5, `rgba(123, 47, 255, ${cell.opacity * 0.1})`);
        gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(cx - cellSize, cy - cellSize, cellSize * 2, cellSize * 2);

        return true;
      });
    }

    // Bottom gradient overlay (solid dark at bottom, transparent at top)
    const gradOverlay = ctx.createLinearGradient(0, h, 0, h * 0.5);
    gradOverlay.addColorStop(0, 'rgba(10, 10, 10, 0.95)');
    gradOverlay.addColorStop(0.4, 'rgba(10, 10, 10, 0.3)');
    gradOverlay.addColorStop(1, 'rgba(10, 10, 10, 0)');
    ctx.fillStyle = gradOverlay;
    ctx.fillRect(0, h * 0.5, w, h * 0.5);

    // Top gradient overlay for horizon glow
    const topGlow = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, h * 0.4);
    topGlow.addColorStop(0, 'rgba(0, 200, 255, 0.03)');
    topGlow.addColorStop(0.5, 'rgba(123, 47, 255, 0.01)');
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 0, w, h);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion preference
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
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    // If reduced motion, draw once static
    if (reducedMotionRef.current) {
      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height, 0);
    }

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(time - lastTimeRef.current, 50);
      lastTimeRef.current = time;

      const rect = canvas.parentElement?.getBoundingClientRect() ?? canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, rect.width, rect.height, delta);

      if (!reducedMotionRef.current) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Pause animation when canvas is fully off-screen — saves CPU after the
    // user scrolls past the hero. Re-starts when scrolled back into view.
    let isVisible = true;
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (!wasVisible && isVisible && !reducedMotionRef.current) {
          lastTimeRef.current = 0;
          animFrameRef.current = requestAnimationFrame(animate);
        } else if (wasVisible && !isVisible) {
          cancelAnimationFrame(animFrameRef.current);
        }
      },
      { threshold: 0 }
    );
    visibilityObserver.observe(canvas);

    if (!reducedMotionRef.current) {
      animFrameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
      motionQuery.removeEventListener('change', handleMotionChange);
      visibilityObserver.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
