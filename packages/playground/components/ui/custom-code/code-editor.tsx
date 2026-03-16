import { IRawGrammar } from "vscode-textmate";
import { defaultTheme, ThemeRule } from "./theme";
import { useTokenized } from "./use-tokenized";
import { cn } from "@/lib/utils";
import { LineNumbers } from "./line-numbers";
import { useMemo } from "react";
import { HighlightedLine } from "./highlighted-line";

export type CustomCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
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

function PlainText({
  code,
  inline = false,
}: {
  code: string;
  inline?: boolean;
}) {
  if (!inline) {
    return (
      <>
        {code.split("\n").map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </>
    );
  }
  return <>{code}</>;
}

export default function CustomCodeEditor({
  value,
  onChange,
  grammar,
  scopeName,
  className,
  theme = defaultTheme,
  showLineNumbers = false,
  lineNumberStart = 1,
}: CustomCodeEditorProps) {
  const lineCount = useMemo(() => value.split("\n").length, [value]);
  const [lines, isLoading] = useTokenized({
    code: value,
    grammar,
    scopeName,
    theme,
  });

  const editorWithOverlay = useMemo(() => {
    return (
      <div
        className={cn("grid", showLineNumbers && "min-w-0 flex-1")}
      >
        <code
          aria-hidden="true"
          className="col-start-1 row-start-1 pointer-events-none"
        >
          {isLoading ? (
            <PlainText code={value} inline={!showLineNumbers} />
          ) : (
            lines.map((line, lineIndex) => (
              <HighlightedLine
                key={lineIndex}
                line={line}
                inline={!showLineNumbers}
                isLast={lineIndex === lines.length - 1}
              />
            ))
          )}
        </code>
        <textarea
          className="col-start-1 row-start-1 m-0 min-h-[1.6em] w-full resize-none overflow-hidden whitespace-pre bg-transparent p-0 text-transparent outline-none caret-foreground"
          spellCheck={false}
          wrap="off"
          rows={Math.max(lineCount, 1)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();
              const textarea = event.currentTarget;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;
              const newValue =
                value.substring(0, start) +
                "\t" +
                value.substring(end);
              onChange(newValue);
              // Move the cursor after the inserted tab
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                  start + 1;
              }, 0);
            }

            const autoClose: Record<string, string> = {
              "(": ")",
              "[": "]",
              "{": "}",
              '"': '"',
              "'": "'",
            };
            if (Object.keys(autoClose).includes(event.key)) {
              event.preventDefault();
              const textarea = event.currentTarget;
              const start = textarea.selectionStart;
              const end = textarea.selectionEnd;

              const pair = event.key + autoClose[event.key];

              const newValue =
                value.substring(0, start) +
                pair +
                value.substring(end);
              onChange(newValue);

              // Move the cursor between the inserted braces
              setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd =
                  start + 1;
              });
            }
          }}
        ></textarea>
      </div>
    );
  }, [isLoading, lineCount, lines, onChange, showLineNumbers, value]);

  return (
    <pre
      className={cn(
        // TODO: Use tailwindy classes here
        "m-0 overflow-x-auto whitespace-pre font-mono text-[0.9rem] leading-[1.6] p-4 border",
        className,
      )}
    >
      {showLineNumbers ? (
        <div className="flex">
          <LineNumbers count={lineCount} start={lineNumberStart} />
          {editorWithOverlay}
        </div>
      ) : (
        editorWithOverlay
      )}
    </pre>
  );
}
