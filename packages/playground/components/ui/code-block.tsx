import { cn } from "@/lib/utils";
import { Highlight, PrismTheme } from "prism-react-renderer";

export type CodeBlockProps = {
  code: string;
  language: string;
  theme?: PrismTheme;
  className?: string;
  showLineNumbers?: boolean;
  lineNumberStart?: number;
  lineNumberClassName?: string;
};
export default function CodeBlock({
  code,
  language,
  theme,
  className,
  showLineNumbers = true,
  lineNumberStart = 1,
  lineNumberClassName,
}: CodeBlockProps) {
  return (
    <Highlight code={code} language={language} theme={theme}>
      {({
        className: prismClassName,
        tokens,
        getLineProps,
        getTokenProps,
      }) => (
        <pre className={cn(prismClassName, className)}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })} className="flex">
              <>
                {showLineNumbers && (
                  <span
                    className={cn(
                      "mr-4 w-4 shrink-0 select-none text-right text-neutral-600",
                      lineNumberClassName,
                    )}
                  >
                    {i + lineNumberStart}
                  </span>
                )}
                {line.map((token, key) => (
                  <span
                    key={key}
                    {...getTokenProps({ token })}
                  ></span>
                ))}
              </>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}
