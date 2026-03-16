import { cn } from "@/lib/utils";

export function Panel({
  title,
  children,
  className,
  headerRight,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between border-b border-white/10 bg-neutral-900/60 px-3 py-1.5">
        <span className="font-mono text-sm text-neutral-500">
          {title}
        </span>
        {headerRight}
      </div>
      <pre className="flex-1 overflow-x-auto p-4 font-mono leading-[1.65rem]">
        {children}
      </pre>
    </div>
  );
}
