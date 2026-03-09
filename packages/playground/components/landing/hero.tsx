import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Github, Terminal } from "lucide-react"
import { KeywordCycler } from "./keyword-cycler"

// ─── color constants (fully-specified so Tailwind JIT picks them up) ──────────
// var → violet, fun → emerald, print → sky, return → amber

// TODO: make this a real code editor with syntax highlighting, line numbers, and a blinking cursor. For now it's just a static mockup.
function HeroCodeWindow() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/60">
      {/* Title bar */}
      <div className="flex items-center border-b border-white/10 bg-zinc-900 px-4 py-2.5">
        <div className="flex gap-1.5 mr-5">
          <div className="h-3 w-3 rounded-full bg-red-500/70" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
          <div className="h-3 w-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex items-center gap-0 text-sm font-mono">
          <span className="rounded-t border border-b-0 border-white/10 bg-zinc-950 px-3 py-1 text-zinc-200">
            spec.json
          </span>
          <span className="px-3 py-1 text-zinc-500">hello.ls</span>
        </div>
      </div>

      {/* Split panels */}
      <div className="flex divide-x divide-white/10 bg-zinc-950">
        {/* Left — spec.json */}
        <pre className="w-[45%] shrink-0 overflow-x-auto p-4 text-sm leading-6 font-mono">
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">1</span>
            <span className="text-zinc-500">{"{"}</span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">2</span>
            <span>
              <span className="text-zinc-300">{"  "}</span>
              <span className="text-zinc-400">&quot;keywords&quot;</span>
              <span className="text-zinc-500">{": {"}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">3</span>
            <span>
              <span>{"    "}</span>
              <span className="text-violet-400">&quot;var&quot;</span>
              <span className="text-zinc-500">{": "}</span>
              <span className="text-violet-300">&quot;variable&quot;</span>
              <span className="text-zinc-500">{","}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">4</span>
            <span>
              <span>{"    "}</span>
              <span className="text-emerald-400">&quot;fun&quot;</span>
              <span className="text-zinc-500">{": "}</span>
              <span className="text-emerald-300">&quot;funcion&quot;</span>
              <span className="text-zinc-500">{","}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">5</span>
            <span>
              <span>{"    "}</span>
              <span className="text-sky-400">&quot;print&quot;</span>
              <span className="text-zinc-500">{": "}</span>
              <span className="text-sky-300">&quot;imprimir&quot;</span>
              <span className="text-zinc-500">{","}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">6</span>
            <span>
              <span>{"    "}</span>
              <span className="text-amber-400">&quot;return&quot;</span>
              <span className="text-zinc-500">{": "}</span>
              <span className="text-amber-300">&quot;retornar&quot;</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">7</span>
            <span className="text-zinc-500">{"  }"}</span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">8</span>
            <span className="text-zinc-500">{"}"}</span>
          </div>
        </pre>

        {/* Right — hello.ls */}
        <pre className="flex-1 overflow-x-auto p-4 text-sm leading-6 font-mono">
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">1</span>
            <span>
              <span className="text-violet-400">variable</span>
              <span className="text-zinc-300">{" saludo = "}</span>
              <span className="text-green-300">{"\"¡Hola, Mundo!\""}</span>
              <span className="text-zinc-500">{";"}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">2</span>
            <span>
              <span className="text-sky-400">imprimir</span>
              <span className="text-zinc-300">{" saludo"}</span>
              <span className="text-zinc-500">{";"}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">3</span>
            <span>&nbsp;</span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">4</span>
            <span>
              <span className="text-emerald-400">funcion</span>
              <span className="text-zinc-300">{" sumar"}</span>
              <span className="text-zinc-500">{"(a, b) {"}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">5</span>
            <span>
              <span>{"  "}</span>
              <span className="text-amber-400">retornar</span>
              <span className="text-zinc-300">{" a + b"}</span>
              <span className="text-zinc-500">{";"}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">6</span>
            <span className="text-zinc-500">{"}"}</span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">7</span>
            <span>&nbsp;</span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">8</span>
            <span>
              <span className="text-violet-400">variable</span>
              <span className="text-zinc-300">{" resultado = sumar("}</span>
              <span className="text-amber-300">{"3"}</span>
              <span className="text-zinc-500">{", "}</span>
              <span className="text-amber-300">{"4"}</span>
              <span className="text-zinc-500">{")"}</span>
              <span className="text-zinc-500">{";"}</span>
            </span>
          </div>
          <div className="flex">
            <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">9</span>
            <span>
              <span className="text-sky-400">imprimir</span>
              <span className="text-zinc-300">{" resultado"}</span>
              <span className="text-zinc-500">{";"}</span>
            </span>
          </div>
        </pre>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between border-t border-white/10 bg-zinc-900 px-4 py-2">
        <span className="font-mono text-[10px] text-zinc-600">langskin · español spec</span>
        <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-600">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
            var
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            fun
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
            print
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            return
          </span>
        </div>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden grid-bg hero-glow pt-14">
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background/80 pointer-events-none" />
      <div className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          {/* Left: text */}
          <div className="flex flex-col gap-7">
            {/* Version badge */}
            <a
              href="https://www.npmjs.com/package/langskin"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-300"
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
                Write code
                <br />
                in{" "}
                <KeywordCycler />
              </h1>
            </div>

            {/* Subtext */}
            <p className="max-w-md text-base leading-7 text-zinc-400 sm:text-lg">
              Langskin is a fully-featured programming language interpreter where
              every keyword is yours to define. One JSON file. Any syntax you
              imagine.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-10 px-5 text-sm" asChild>
                <Link href="#install">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-10 px-5 text-sm" asChild>
                <Link
                  href="https://github.com/ammar-ahmed22/langskin"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="size-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>

            {/* Small proof points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              {["MIT License", "TypeScript", "22 Keywords", "CLI + API"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 text-xs text-zinc-500"
                  >
                    <span className="h-1 w-1 rounded-full bg-zinc-700" />
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Right: code window */}
          <div className="w-full">
            <HeroCodeWindow />
          </div>
        </div>
      </div>
    </section>
  )
}
