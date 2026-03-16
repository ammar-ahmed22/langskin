import { useState } from "react";
import type { HeroProps } from "./types";

function invertMap(
  map: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).map(([key, value]) => [value, key] as const),
  );
}

export function useHero({
  ids,
  phrasesById,
  codeMap,
  specMap,
}: HeroProps) {
  const idsByPhrase = invertMap(phrasesById);
  const phrases = Object.keys(idsByPhrase);
  const maxSpecLines = Math.max(
    ...Object.values(specMap).map((s) => s.split("\n").length),
  );

  const [id, setId] = useState(ids[0]);
  const [contentVisible, setContentVisible] = useState(true);

  const code = codeMap[id] ?? "";
  const spec = specMap[id] ?? "";

  function handleCycle(phrase: string) {
    setId(idsByPhrase[phrase]);
  }

  return {
    id,
    code,
    spec,
    phrases,
    maxSpecLines,
    contentVisible,
    setContentVisible,
    handleCycle,
  };
}
