'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ParticleFieldProps {
  className?: string;
  style?: React.CSSProperties;
  particleCount?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

const COLORS = [
  'rgba(0, 200, 255,',   // cyan
  'rgba(0, 200, 255,',   // cyan (weighted)
  'rgba(123, 47, 255,',  // purple
  'rgba(255, 255, 255,', // white
];

const CONNECTION_DISTANCE = 120;
const MOUSE_RADIUS = 150;
const MOUSE_FORCE = 0.3;

export default function ParticleField({ className, style, particleCount = 70 }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const reducedMotionRef = useRef<boolean>(false);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  const initParticles = useCallback((w: number, h: number, count: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
    return particles;
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, delta: number) => {
    const reduced = reducedMotionRef.current;
    const particles = particlesRef.current;
    const dt = delta / 16.67; // normalize to ~60fps

    ctx.clearRect(0, 0, w, h);

    // Update positions
    if (!reduced) {
      for (const p of particles) {
        // Mouse interaction
        if (mouseRef.current.active) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
            p.vx += (dx / dist) * force * dt;
            p.vy += (dy / dist) * force * dt;
          }
        }

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Dampen velocity
        p.vx *= 0.99;
        p.vy *= 0.99;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
    }

    // Draw connection lines between nearby particles
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distSq = dx * dx + dy * dy;

        if (distSq < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `${p.color} ${p.opacity})`;
      ctx.fill();

      // Subtle glow for larger particles
      if (p.size > 2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        glow.addColorStop(0, `${p.color} ${p.opacity * 0.15})`);
        glow.addColorStop(1, `${p.color} 0)`);
        ctx.fillStyle = glow;
        ctx.fill();
      }
    }
  }, []);

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

      // Reinitialize particles if none or size changed significantly
      if (particlesRef.current.length === 0) {
        particlesRef.current = initParticles(rect.width, rect.height, particleCount);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

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

    // Pause animation when canvas is fully off-screen — saves CPU once the
    // user scrolls past the hero. Connection-line drawing is O(n²), so the
    // saving compounds with particle count.
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
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      motionQuery.removeEventListener('change', handleMotionChange);
      visibilityObserver.disconnect();
    };
  }, [draw, initParticles, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
    />
  );
}
