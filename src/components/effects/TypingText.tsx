'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursorColor?: string;
  onComplete?: () => void;
}

export default function TypingText({
  text,
  speed = 50,
  className,
  cursorColor = '#00c8ff',
  onComplete,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLSpanElement>(null);
  const indexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cursorIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reducedMotionRef = useRef(false);

  // Blink the cursor
  useEffect(() => {
    cursorIntervalRef.current = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);

    return () => {
      if (cursorIntervalRef.current) clearInterval(cursorIntervalRef.current);
    };
  }, []);

  // Check reduced motion
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = motionQuery.matches;

    if (motionQuery.matches) {
      // Show full text immediately
      setDisplayedText(text);
      setIsComplete(true);
      onComplete?.();
    }

    const handler = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    motionQuery.addEventListener('change', handler);
    return () => motionQuery.removeEventListener('change', handler);
  }, [text, onComplete]);

  // IntersectionObserver — only start typing when visible
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Typing effect
  const startTyping = useCallback(() => {
    if (reducedMotionRef.current) return;

    indexRef.current = 0;
    setDisplayedText('');
    setIsComplete(false);

    intervalRef.current = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);
  }, [text, speed, onComplete]);

  useEffect(() => {
    if (isVisible && !reducedMotionRef.current) {
      startTyping();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isVisible, startTyping]);

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {displayedText}
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '0.6em',
          height: '1.1em',
          marginLeft: '2px',
          verticalAlign: 'text-bottom',
          backgroundColor: cursorVisible || isComplete ? cursorColor : 'transparent',
          opacity: isComplete && !cursorVisible ? 0 : 0.9,
          transition: 'opacity 0.1s',
        }}
      />
    </span>
  );
}
