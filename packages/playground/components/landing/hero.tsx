"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Terminal } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { KeywordCycler } from "./keyword-cycler";
import {
  createSpec,
  createTextMateGrammar,
  PartialLangskinSpec,
} from "langskin";
import { IRawGrammar } from "vscode-textmate";
import CustomCodeBlock from "../ui/custom-code/code-block";
import { themes } from "prism-react-renderer";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import CodeBlock from "../ui/code-block";

const phraseSpecs: Record<
  string,
  { file: string; spec: PartialLangskinSpec; name: string }
> = {
  langskin: {
    name: "langskin",
    file: "langskin.ls",
    spec: {
      keywords: {},
    },
  },
  "español.": {
    name: "español",
    file: "espanol.ls",
    spec: {
      keywords: {
        var: "sea",
        fun: "funcion",
        print: "imprimir",
        return: "retornar",
      },
    },
  },
  "français.": {
    name: "français.",
    file: "francais.ls",
    spec: {
      keywords: {
        var: "soit",
        fun: "fonction",
        print: "afficher",
        return: "retour",
      },
    },
  },
  "your own words.": {
    name: "custom",
    file: "custom.ls",
    spec: {
      keywords: {
        var: "define",
        fun: "proc",
        print: "log",
        return: "emit",
      },
    },
  },
};

function HeroCodeWindow({
  phrase,
  code,
  visible,
}: {
  phrase: string;
  code: string;
  visible: boolean;
}) {
  const { spec: partialSpec, name } = phraseSpecs[phrase];
  const spec = createSpec(partialSpec);
  const grammar = createTextMateGrammar(spec);
  const parsed = JSON.parse(grammar) as IRawGrammar;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const json2lines = (obj: any) =>
    JSON.stringify(obj, null, 2).split("\n");
  const allSpecs = Object.values(phraseSpecs).map(({ spec }) => spec);
  const maxSpecLines = Math.max(
    ...allSpecs.map((spec) => json2lines(spec).length),
  );
  let stringPartialSpec: string;
  if (json2lines(partialSpec).length < maxSpecLines) {
    const paddingLines =
      maxSpecLines - json2lines(partialSpec).length;
    stringPartialSpec =
      JSON.stringify(partialSpec, null, 2) +
      "\n".repeat(paddingLines);
  } else {
    stringPartialSpec = JSON.stringify(partialSpec, null, 2);
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/60 w-full",
      )}
    >
      {/* Title bar */}
      <div className="flex items-center border-b border-white/10 bg-neutral-900 px-4 py-2.5">
        <div className="flex gap-1.5 mr-5">
          <div className="h-3 w-3 rounded-full bg-red-500/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <div className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
      </div>

      {/* Split panels */}
      <div
        className={cn(
          "transition-opacity duration-250 ease-in-out flex divide-x divide-white/10 bg-neutral-950 overflow-hidden",
          visible ? "opacity-100" : "opacity-0",
        )}
      >
        {/* Left — spec.json */}
        <CodeBlock
          code={stringPartialSpec}
          language="json"
          theme={themes.oneDark}
          className="w-[40%] shrink-0 overflow-x-auto p-4 text-sm leading-6 font-mono bg-zinc-950"
        />
        {/* Right — hello.ls */}
        <CustomCodeBlock
          grammar={parsed}
          scopeName="source.langskin"
          value={code}
          showLineNumbers
          className="flex-1 overflow-x-auto"
        />
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-zinc-900 px-4 py-2">
        <span className="font-mono text-sm text-neutral-600">
          {name} spec
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  const phrases = Object.keys(phraseSpecs);
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0]);
  const [codeMap, setCodeMap] = useState<Record<string, string>>({});
  const [contentVisible, setContentVisible] = useState(true);

  // Fetch all code files once on mount
  useEffect(() => {
    Promise.all(
      Object.entries(phraseSpecs).map(([key, { file }]) =>
        fetch("/" + file)
          .then((res) => res.text())
          .then((code) => [key, code] as const),
      ),
    )
      .then((entries) => {
        setCodeMap(Object.fromEntries(entries));
      })
      .catch((err) =>
        console.error("Failed to load code files:", err),
      );
  }, []);

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
              <span className="ml-0.5 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10px] text-sky-400">
                v0.3.2
              </span>
            </a>

            {/* Headline */}
            <div>
              <h1 className="text-5xl font-semibold tracking-tight text-zinc-50 sm:text-6xl lg:text-7xl">
                Write code <br className="hidden xl:block" />
                in{" "}
                <KeywordCycler
                  phrases={phrases}
                  onCycle={setCurrentPhrase}
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
              phrase={currentPhrase}
              code={codeMap[currentPhrase] ?? ""}
              visible={contentVisible}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
