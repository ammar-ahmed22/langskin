import { cn } from "@/lib/utils";
import type { OutputState } from "./types";

export const OUTPUT_LINE_LIMIT = 40;

export function OutputTitle({ state }: { state: OutputState }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "inline-block size-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px] shadow-emerald-400/50",
          state === "idle" && "bg-neutral-400 shadow-neutral-400/50",
          state === "running" &&
            "bg-emerald-400 shadow-emerald-400/50",
          state === "error" && "bg-red-400 shadow-red-400/50",
          state === "success" && "bg-green-400 shadow-green-400/50",
        )}
      />
      <span>output</span>
    </div>
  );
}

export function OutputPanel({
  state,
  output,
  errors,
}: {
  state: OutputState;
  output: string[];
  errors: string[];
}) {
  const lines = state === "error" ? errors : output;
  const truncated = lines.length > OUTPUT_LINE_LIMIT;
  const visibleLines = truncated
    ? lines.slice(0, OUTPUT_LINE_LIMIT)
    : lines;

  return (
    <pre
      className={cn(
        "px-4 font-mono text-sm leading-relaxed whitespace-pre-wrap wrap-break-word",
        state === "error" ? "text-red-400/90" : "text-emerald-300/90",
      )}
    >
      {(state === "error" || state === "success") &&
        visibleLines.length > 0 &&
        visibleLines.map((line, i) => (
          <div key={i}>
            <span className="mr-3 select-none text-neutral-600">
              $
            </span>
            {line}
          </div>
        ))}
      {truncated && (
        <div className="mt-2 text-neutral-500">
          Output limited to {OUTPUT_LINE_LIMIT} lines — see full
          output in the browser console.
        </div>
      )}
    </pre>
  );
}
