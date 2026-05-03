"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

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
  cursorColor = "#00c8ff",
  onComplete,
}: TypingTextProps) {
  const reducedMotion = useReducedMotion();
  const [displayedText, setDisplayedText] = useState(reducedMotion ? text : "");
  const [isComplete, setIsComplete] = useState(reducedMotion);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Blink the cursor
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // Type when the element becomes visible (skip entirely under reduced motion)
  useEffect(() => {
    if (reducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    let typingId: ReturnType<typeof setInterval> | null = null;
    let index = 0;

    const startTyping = () => {
      typingId = setInterval(() => {
        if (index < text.length) {
          index++;
          setDisplayedText(text.slice(0, index));
        } else {
          if (typingId) clearInterval(typingId);
          setIsComplete(true);
          onCompleteRef.current?.();
        }
      }, speed);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startTyping();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (typingId) clearInterval(typingId);
    };
  }, [text, speed, reducedMotion]);

  return (
    <span ref={containerRef} className={className} aria-label={text}>
      {displayedText}
      <span
        aria-hidden="true"
        style={{
          display: "inline-block",
          width: "0.6em",
          height: "1.1em",
          marginLeft: "2px",
          verticalAlign: "text-bottom",
          backgroundColor:
            cursorVisible || isComplete ? cursorColor : "transparent",
          opacity: isComplete && !cursorVisible ? 0 : 0.9,
          transition: "opacity 0.1s",
        }}
      />
    </span>
  );
}
