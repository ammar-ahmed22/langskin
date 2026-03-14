import { cn } from "@/lib/utils";

export type LineNumbersProps = {
  count: number;
  start?: number;
  className?: string;
};
export function LineNumbers({
  count,
  className,
  start = 1,
}: LineNumbersProps) {
  const width = Math.max(
    2,
    String(Math.max(start, start + count - 1)).length,
  );
  return (
    <code
      aria-hidden="true"
      className={cn(
        "mr-4 select-none text-right text-neutral-600",
        className,
      )}
    >
      {Array.from({ length: Math.max(count, 1) }, (_, lineIndex) => (
        <span
          key={lineIndex}
          className="block"
          style={{ width: `${width}ch` }}
        >
          {start + lineIndex}
        </span>
      ))}
    </code>
  );
}
