import { IRawGrammar } from "vscode-textmate";
import { defaultTheme, ThemeRule } from "./theme";
import { useMemo } from "react";
import { useTokenized } from "./use-tokenized";
import { cn } from "@/lib/utils";
import { LineNumbers } from "./line-numbers";
import { HighlightedLine } from "./highlighted-line";

export type CustomCodeBlockProps = {
  value: string;
  grammar: IRawGrammar;
  scopeName: string;
  className?: string;
  theme?: {
    name?: string;
    settings: ThemeRule[];
  };
  showLineNumbers?: boolean;
  lineNumberStart?: number;
};
export default function CustomCodeBlock({
  value,
  grammar,
  scopeName,
  className,
  theme = defaultTheme,
  showLineNumbers = false,
  lineNumberStart = 1,
}: CustomCodeBlockProps) {
  const lineCount = useMemo(() => value.split("\n").length, [value]);
  const [lines, isLoading] = useTokenized({
    code: value,
    grammar,
    scopeName,
    theme,
  });

  const highlightedCode = useMemo(() => {
    if (showLineNumbers) {
      return (
        <div className="flex">
          <LineNumbers count={lineCount} start={lineNumberStart} />
          <code className="min-w-0 flex-1">
            {lines.map((line, index) => (
              <HighlightedLine key={index} line={line} />
            ))}
          </code>
        </div>
      );
    }

    return (
      <code>
        {lines.map((line, index) => (
          <HighlightedLine key={index} line={line} inline />
        ))}
      </code>
    );
  }, [lineCount, lineNumberStart, lines, showLineNumbers]);

  return (
    <pre
      className={cn(
        // TODO: Use tailwindy classes here
        "m-0 overflow-x-auto whitespace-pre font-mono text-[0.9rem] leading-[1.6] p-4 border",
        className,
      )}
    >
      {isLoading ? value : highlightedCode}
    </pre>
  );
}
