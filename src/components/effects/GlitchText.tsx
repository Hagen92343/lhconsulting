'use client';

import { useState, useCallback } from 'react';

interface GlitchTextProps {
  children: string;
  continuous?: boolean;
  className?: string;
}

export default function GlitchText({
  children,
  continuous = false,
  className = '',
}: GlitchTextProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  const shouldGlitch = continuous || isHovering;

  return (
    <span
      className={`${shouldGlitch ? 'glitch' : ''} ${className}`}
      data-text={children}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}
    </span>
  );
}
