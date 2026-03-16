"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Pencil } from "lucide-react";
import { useSyntaxDemo } from "./use-syntax-demo";
import { DemoTabContent } from "./demo-tab-content";
import type { SyntaxDemoProps } from "./types";

export function SyntaxDemo({
  ids,
  labelsById,
  codeMap,
  specMap,
}: SyntaxDemoProps) {
  const {
    code,
    spec,
    grammar,
    specErrors,
    output,
    outputErrors,
    running,
    outputState,
    handleTabChange,
    handleSpecChange,
    handleCodeChange,
    handleRun,
  } = useSyntaxDemo(ids, codeMap, specMap);

  return (
    <section id="demo" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 max-w-xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-sky-400">
            Interactive Demo
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            One JSON. Infinite possibilities.
          </h2>
          <p className="mt-4 text-zinc-400">
            Map any keyword to any word. The logic stays the same —
            only the syntax changes.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={ids[0]} onValueChange={handleTabChange}>
          <div className="mb-6 flex flex-col lg:flex-row items-center justify-between gap-4">
            <TabsList className="h-9">
              {ids.map((value) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="px-4 text-sm"
                >
                  {labelsById[value] ?? value}
                </TabsTrigger>
              ))}
            </TabsList>
            <p className="flex items-center gap-1.5 font-mono text-sm text-neutral-500">
              <Pencil className="size-3" />
              Both editors are live — try making changes
            </p>
          </div>

          {ids.map((value) => (
            <TabsContent key={`${value}-content`} value={value}>
              <DemoTabContent
                spec={spec}
                specErrors={specErrors}
                grammar={grammar}
                code={code}
                outputState={outputState}
                output={output}
                outputErrors={outputErrors}
                running={running}
                onSpecChange={handleSpecChange}
                onCodeChange={handleCodeChange}
                onRun={handleRun}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
