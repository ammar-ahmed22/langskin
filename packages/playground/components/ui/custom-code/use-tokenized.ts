import { IRawGrammar } from "vscode-textmate";
import { ThemeRule } from "./theme";
import { useEffect, useState } from "react";
import { RenderLine, tokenizeCode } from "./tokenize";

export type UseTokenizedParams = {
  code: string;
  grammar: IRawGrammar;
  scopeName: string;
  theme: {
    name?: string;
    settings: ThemeRule[];
  };
};
export function useTokenized({
  code,
  grammar,
  scopeName,
  theme,
}: UseTokenizedParams) {
  const [lines, setLines] = useState<RenderLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const tokenized = await tokenizeCode(
          code,
          grammar,
          scopeName,
          theme,
        );
        if (!cancelled) {
          setLines(tokenized);
        }
      } catch (error) {
        console.warn("Failed to tokenize code:", error);
        if (!cancelled) {
          setLines(
            code.split("\n").map((line) => [
              {
                content: line,
                scopes: [],
                style: {},
              },
            ]),
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [code, grammar, scopeName, theme]);

  return [lines, isLoading] as const;
}
