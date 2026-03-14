import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/[0.06] bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-base font-semibold tracking-tight text-zinc-100"
        >
          langskin
          <span className="ml-1.5 inline-block rounded bg-sky-500/15 px-1 py-0.5 font-mono text-[10px] text-sky-400">
            v0.3.2
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="#features"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Features
          </Link>
          <Link
            href="/playground"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Playground
          </Link>
          <Link
            href="#install"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Install
          </Link>
          <Link
            href="https://github.com/ammar-ahmed22/langskin/tree/main/packages/core#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Docs
          </Link>
        </nav>

        {/* CTA */}
        <Button variant="outline" size="sm" asChild>
          <Link
            href="https://github.com/ammar-ahmed22/langskin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="size-3.5" />
            GitHub
          </Link>
        </Button>
      </div>
    </header>
  );
}
