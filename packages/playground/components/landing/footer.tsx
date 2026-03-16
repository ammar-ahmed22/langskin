import Link from "next/link";
import { Github } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = [
  {
    label: "GitHub",
    href: "https://github.com/ammar-ahmed22/langskin",
    external: true,
  },
  {
    label: "npm",
    href: "https://www.npmjs.com/package/langskin",
    external: true,
  },
  {
    label: "Docs",
    href: "https://github.com/ammar-ahmed22/langskin/tree/main/packages/core#readme",
    external: true,
  },
  { label: "Features", href: "#features", external: false },
  { label: "Demo", href: "#demo", external: false },
  { label: "Install", href: "#install", external: false },
];

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-zinc-950/60">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-base font-semibold text-zinc-100">
              langskin
            </span>
            <p className="max-w-xs text-sm text-zinc-500">
              A customizable programming language interpreter.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map(({ label, href, external }) =>
              external ? (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  {label}
                </Link>
              ),
            )}
          </nav>
        </div>

        <Separator className="my-8 bg-white/[0.06]" />

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-zinc-600">
            MIT License &middot; Made with care by{" "}
            <a
              href="https://github.com/ammar-ahmed22"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ammar-ahmed22
            </a>
          </p>
          <a
            href="https://github.com/ammar-ahmed22/langskin"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-zinc-600 transition-colors hover:text-zinc-400"
          >
            <Github className="size-3.5" />
            View on GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
