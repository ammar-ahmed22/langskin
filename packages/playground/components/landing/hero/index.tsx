"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { useHero } from "./use-hero";
import { HeroCodeWindow } from "./code-window";
import { KeywordCycler } from "./keyword-cycler";
import type { HeroProps } from "./types";

export type { HeroProps };

export function Hero(props: HeroProps) {
  const {
    id,
    code,
    spec,
    phrases,
    maxSpecLines,
    contentVisible,
    setContentVisible,
    handleCycle,
  } = useHero(props);

  return (
    <section className="relative min-h-screen overflow-hidden grid-bg hero-glow pt-14">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
      <div className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 xl:grid-cols-[1fr_1.5fr] xl:gap-16">
          {/* Left: text */}
          <div className="flex flex-col gap-7">
            {/* Version badge */}
            <a
              href="https://www.npmjs.com/package/langskin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-neutral-400 transition-colors hover:border-white/20 hover:text-neutral-300"
            >
              <Terminal className="size-3 text-sky-400" />
              <span className="text-zinc-500">npm install</span>
              <span className="text-zinc-200">langskin</span>
              <span className="ml-0.5 rounded bg-sky-500/15 px-1.5 py-0.5 text-xs text-sky-400">
                v{props.latestVersion}
              </span>
            </a>

            {/* Headline */}
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
                Write code <br className="hidden xl:block" />
                in{" "}
                <KeywordCycler
                  phrases={phrases}
                  onCycle={handleCycle}
                  onVisibilityChange={setContentVisible}
                  duration={3500}
                />
              </h1>
            </div>

            {/* Subtext */}
            <p className="xl:max-w-md text-base leading-7 text-zinc-400 sm:text-lg">
              Langskin is a fully-featured programming language
              interpreter where every keyword is yours to define. One
              JSON file. Any syntax you imagine.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-10 px-5 text-sm" asChild>
                <Link href="#install">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-10 px-5 text-sm"
                asChild
              >
                <Link
                  href="https://github.com/ammar-ahmed22/langskin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SiGithub className="size-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>

            {/* Small proof points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {[
                "MIT License",
                "TypeScript",
                "22 Keywords",
                "CLI + API",
              ].map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 text-xs text-zinc-500"
                >
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right: code window */}
          <div className="w-full min-w-0">
            <HeroCodeWindow
              id={id}
              code={code}
              specString={spec}
              visible={contentVisible}
              maxSpecLines={maxSpecLines}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
