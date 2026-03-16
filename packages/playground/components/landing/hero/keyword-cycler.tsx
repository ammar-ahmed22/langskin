import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export type KeywordCyclerProps = {
  phrases: string[];
  duration?: number;
  onCycle?: (newPhrase: string) => void;
  onVisibilityChange?: (visible: boolean) => void;
};

export function KeywordCycler({
  phrases,
  duration = 2800,
  onCycle,
  onVisibilityChange,
}: KeywordCyclerProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (onCycle) {
      onCycle(phrases[index]);
    }
  }, [index, onCycle, phrases]);

  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange(visible);
    }
  }, [visible, onVisibilityChange]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      const switchTimer = setTimeout(() => {
        setIndex((i) => {
          const next = (i + 1) % phrases.length;
          return next;
        });
        setVisible(true);
      }, 250);
      return () => clearTimeout(switchTimer);
    }, duration);
    return () => clearInterval(timer);
  }, [duration, phrases, phrases.length]);

  return (
    <span
      className={cn(
        "text-sky-400 transition-opacity duration-250 ease-in-out",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      {phrases[index]}
    </span>
  );
}
