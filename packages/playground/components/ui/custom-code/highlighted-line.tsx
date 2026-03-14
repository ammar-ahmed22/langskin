import { RenderLine } from "./tokenize";

export type HighlightedLineProps = {
  line: RenderLine;
  inline?: boolean;
  isLast?: boolean;
};

function Line({ line }: { line: RenderLine }) {
  return (
    <>
      {line.map((token, tokenIndex) => (
        <span
          key={tokenIndex}
          style={token.style}
          title={token.scopes.join(" ")}
        >
          {token.content || "\u200b"}
        </span>
      ))}
    </>
  );
}

export function HighlightedLine({
  line,
  inline = false,
  isLast = false,
}: HighlightedLineProps) {
  if (inline) {
    return (
      <>
        <Line line={line} />
        {!isLast ? "\n" : null}
      </>
    );
  }
  return (
    <span className="block">
      <Line line={line} />
    </span>
  );
}
