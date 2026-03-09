"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const pkgCommands: Record<string, string> = {
  npm: "npm install langskin",
  pnpm: "pnpm add langskin",
  yarn: "yarn add langskin",
  npx: "npx langskin repl",
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-200"
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </button>
  )
}

function InstallBlock({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-950 px-4 py-3">
      <pre className="font-mono text-sm text-zinc-200">{cmd}</pre>
      <CopyButton text={cmd} />
    </div>
  )
}

export function Install() {
  return (
    <section id="install" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* Left column */}
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-sky-400">
              Get Started
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
              Up and running
              <br />
              in seconds.
            </h2>
            <p className="mt-4 max-w-sm text-zinc-400">
              Install as a library, or try the interactive REPL instantly —
              no setup required.
            </p>

            {/* Install tabs */}
            <div className="mt-8">
              <Tabs defaultValue="npm">
                <TabsList className="mb-3 h-8">
                  {["npm", "pnpm", "yarn"].map((pm) => (
                    <TabsTrigger key={pm} value={pm} className="px-3 text-xs">
                      {pm}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {["npm", "pnpm", "yarn"].map((pm) => (
                  <TabsContent key={pm} value={pm}>
                    <InstallBlock cmd={pkgCommands[pm]} />
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Or try the REPL */}
            <div className="mt-4">
              <p className="mb-2 text-xs text-zinc-600">
                or try without installing
              </p>
              <InstallBlock cmd={pkgCommands.npx} />
            </div>
          </div>

          {/* Right column — quick start */}
          <div>
            <p className="mb-3 font-mono text-xs text-zinc-500">quickstart.ts</p>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl shadow-black/40">
              {/* file tab bar */}
              <div className="flex items-center border-b border-white/10 bg-zinc-900 px-3 py-2">
                <span className="rounded-t border border-b-0 border-white/10 bg-zinc-950 px-3 py-1 font-mono text-[11px] text-zinc-300">
                  quickstart.ts
                </span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12px] leading-[1.75rem]">
                {/* line 1 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">1</span>
                  <span>
                    <span className="text-violet-400">import</span>
                    <span className="text-zinc-300">{" { "}</span>
                    <span className="text-sky-300">createLangskin</span>
                    <span className="text-zinc-300">{" } "}</span>
                    <span className="text-violet-400">from</span>
                    <span className="text-green-300">{" \"langskin\""}</span>
                    <span className="text-zinc-500">;</span>
                  </span>
                </div>
                {/* line 2 - blank */}
                <div className="flex"><span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">2</span><span>&nbsp;</span></div>
                {/* line 3 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">3</span>
                  <span>
                    <span className="text-violet-400">const</span>
                    <span className="text-zinc-300">{" lang = "}</span>
                    <span className="text-sky-300">createLangskin</span>
                    <span className="text-zinc-500">{"({"}</span>
                  </span>
                </div>
                {/* line 4 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">4</span>
                  <span>
                    <span className="text-zinc-300">{"  "}</span>
                    <span className="text-sky-300">keywords</span>
                    <span className="text-zinc-500">{": {"}</span>
                  </span>
                </div>
                {/* line 5 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">5</span>
                  <span>
                    <span>{"    "}</span>
                    <span className="text-violet-400">var</span>
                    <span className="text-zinc-500">{": "}</span>
                    <span className="text-green-300">"variable"</span>
                    <span className="text-zinc-500">{","}</span>
                  </span>
                </div>
                {/* line 6 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">6</span>
                  <span>
                    <span>{"    "}</span>
                    <span className="text-violet-400">print</span>
                    <span className="text-zinc-500">{": "}</span>
                    <span className="text-green-300">"imprimir"</span>
                    <span className="text-zinc-500">{","}</span>
                  </span>
                </div>
                {/* line 7 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">7</span>
                  <span className="text-zinc-500">{"  },"}</span>
                </div>
                {/* line 8 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">8</span>
                  <span className="text-zinc-500">{"});"}</span>
                </div>
                {/* line 9 - blank */}
                <div className="flex"><span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">9</span><span>&nbsp;</span></div>
                {/* line 10 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">10</span>
                  <span>
                    <span className="text-violet-400">const</span>
                    <span className="text-zinc-300">{" result = lang."}</span>
                    <span className="text-sky-300">run</span>
                    <span className="text-zinc-500">{"(`"}</span>
                  </span>
                </div>
                {/* line 11 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">11</span>
                  <span>
                    <span className="text-zinc-300">{"  "}</span>
                    <span className="text-green-300/80">variable x = 42;</span>
                  </span>
                </div>
                {/* line 12 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">12</span>
                  <span>
                    <span className="text-zinc-300">{"  "}</span>
                    <span className="text-green-300/80">imprimir x;</span>
                  </span>
                </div>
                {/* line 13 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">13</span>
                  <span className="text-zinc-500">{"`);"}</span>
                </div>
                {/* line 14 - blank */}
                <div className="flex"><span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">14</span><span>&nbsp;</span></div>
                {/* line 15 */}
                <div className="flex">
                  <span className="mr-4 w-4 shrink-0 select-none text-right text-zinc-700">15</span>
                  <span>
                    <span className="text-sky-300">console</span>
                    <span className="text-zinc-300">.log(result.</span>
                    <span className="text-sky-300">getOutput</span>
                    <span className="text-zinc-300">())</span>
                    <span className="text-zinc-500">;</span>
                    <span className="text-zinc-600">{" // [\"42\"]"}</span>
                  </span>
                </div>
              </pre>
            </div>

            {/* Docs link */}
            <p className="mt-4 text-sm text-zinc-500">
              See the{" "}
              <a
                href="https://github.com/ammar-ahmed22/langskin/tree/main/packages/core#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 underline underline-offset-4 hover:text-zinc-100"
              >
                full API documentation
              </a>{" "}
              for all language features and options.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
