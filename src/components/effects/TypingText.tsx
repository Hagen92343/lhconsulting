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
  // SSR renders the FULL text so the LCP candidate is the finished headline
  // — not the empty span we'd otherwise produce. After hydration we reset
  // to "" and replay the typewriter for the visual effect.
  const [displayedText, setDisplayedText] = useState(text);
  const [isComplete, setIsComplete] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const containerRef = useRef<HTMLSpanElement>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Blink the cursor
  useEffect(() => {
    const id = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(id);
  }, []);

  // After mount: replay the typing animation (skip under reduced motion)
  useEffect(() => {
    if (reducedMotion) return;

    setDisplayedText("");
    setIsComplete(false);

    let typingId: ReturnType<typeof setInterval> | null = null;
    let index = 0;

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

    return () => {
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
