"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { CopyButton } from "@/components/ui/copy-button";
import CodeMirror, { basicSetup } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { customTheme } from "@/lib/code-mirror/customTheme";

const pkgCommands: Record<string, string> = {
  npm: "npm install langskin",
  pnpm: "pnpm add langskin",
  yarn: "yarn add langskin",
  npx: "npx langskin repl",
};

function InstallBlock({ cmd }: { cmd: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/10 bg-neutral-950 px-4 py-3">
      <pre className="font-mono text-sm text-neutral-200">{cmd}</pre>
      <CopyButton text={cmd} />
    </div>
  );
}

type InstallProps = {
  code: string;
};
export function Install({ code }: InstallProps) {
  return (
    <section id="install" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
          {/* Left column */}
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-sky-400">
              Get Started
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-neutral-50 sm:text-4xl">
              Up and running
              <br />
              in seconds.
            </h2>
            <p className="mt-4 max-w-sm text-neutral-400">
              Install as a library, or try the interactive REPL
              instantly — no setup required.
            </p>

            {/* Install tabs */}
            <div className="mt-8">
              <Tabs defaultValue="npm">
                <TabsList className="mb-3 h-8">
                  {["npm", "pnpm", "yarn"].map((pm) => (
                    <TabsTrigger
                      key={pm}
                      value={pm}
                      className="px-3 text-xs"
                    >
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
              <p className="mb-2 text-xs text-neutral-600">
                or try without installing
              </p>
              <InstallBlock cmd={pkgCommands.npx} />
            </div>
          </div>

          {/* Right column — quick start */}
          <div>
            <div className="overflow-hidden rounded-xl border border-white/10 bg-neutral-950 shadow-xl shadow-black/40">
              {/* file tab bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-neutral-900 px-3 py-2">
                <span className="rounded-t border border-b-0 border-white/10 bg-neutral-950 px-3 py-1 font-mono text-[11px] text-neutral-300">
                  quickstart.ts
                </span>
                <CopyButton text={code} />
              </div>
              <CodeMirror
                value={code}
                editable={false}
                basicSetup={false}
                extensions={[
                  javascript({ typescript: true }),
                  basicSetup({
                    lineNumbers: true,
                    highlightActiveLine: false,
                    highlightActiveLineGutter: false,
                    foldGutter: false,
                  }),
                ]}
                theme={customTheme}
                className="text-sm px-3 py-2"
              />
            </div>

            {/* Docs link */}
            <p className="mt-4 text-sm text-neutral-500">
              See the{" "}
              <a
                href="https://github.com/ammar-ahmed22/langskin/tree/main/packages/core#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-300 underline underline-offset-4 hover:text-neutral-100"
              >
                full API documentation
              </a>{" "}
              for all language features and options.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
