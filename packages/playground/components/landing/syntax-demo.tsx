"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// ─── Shared helpers ───────────────────────────────────────────────────────────

function Line({
  n,
  children,
}: {
  n: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <span className="mr-4 w-5 shrink-0 select-none text-right text-xs text-zinc-700">
        {n}
      </span>
      <span className="text-xs">{children}</span>
    </div>
  );
}

function Blank({ n }: { n: number }) {
  return <Line n={n}>&nbsp;</Line>;
}

function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="border-b border-white/10 bg-zinc-900/60 px-3 py-1.5">
        <span className="font-mono text-[11px] text-zinc-500">
          {title}
        </span>
      </div>
      <pre className="flex-1 overflow-x-auto p-4 font-mono leading-[1.65rem]">
        {children}
      </pre>
    </div>
  );
}

// ─── Default (English) ────────────────────────────────────────────────────────

function DefaultSpec() {
  return (
    <Panel title="spec.json" className="h-full">
      <Line n={1}>
        <span className="text-zinc-500">{"{"}</span>
      </Line>
      <Line n={2}>
        <span className="text-zinc-400">{"  "}</span>
        <span className="text-zinc-400">"keywords"</span>
        <span className="text-zinc-500">{": {"}</span>
      </Line>
      <Line n={3}>
        <span>{"    "}</span>
        <span className="text-violet-400">"var"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-violet-300">"let"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={4}>
        <span>{"    "}</span>
        <span className="text-emerald-400">"fun"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-emerald-300">"fun"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={5}>
        <span>{"    "}</span>
        <span className="text-sky-400">"print"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-sky-300">"print"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={6}>
        <span>{"    "}</span>
        <span className="text-rose-400">"if"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-rose-300">"if"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={7}>
        <span>{"    "}</span>
        <span className="text-orange-400">"else"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-orange-300">"else"</span>
      </Line>
      <Line n={8}>
        <span className="text-zinc-500">{"  }"}</span>
      </Line>
      <Line n={9}>
        <span className="text-zinc-500">{"}"}</span>
      </Line>
    </Panel>
  );
}

function DefaultCode() {
  return (
    <Panel title="greet.ls">
      <Line n={1}>
        <span className="text-violet-400">let</span>
        <span className="text-zinc-300">{" greet = "}</span>
        <span className="text-emerald-400">fun</span>
        <span className="text-zinc-500">{"(name) {"}</span>
      </Line>
      <Line n={2}>
        <span>{"  "}</span>
        <span className="text-rose-400">if</span>
        <span className="text-zinc-500">{" (name != "}</span>
        <span className="text-zinc-500">null</span>
        <span className="text-zinc-500">{") {"}</span>
      </Line>
      <Line n={3}>
        <span>{"    "}</span>
        <span className="text-sky-400">print</span>
        <span className="text-zinc-300"> </span>
        <span className="text-green-300">{'"Hello, "'}</span>
        <span className="text-zinc-500">{" + name"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Line n={4}>
        <span>{"  } "}</span>
        <span className="text-orange-400">else</span>
        <span className="text-zinc-500">{" {"}</span>
      </Line>
      <Line n={5}>
        <span>{"    "}</span>
        <span className="text-sky-400">print</span>
        <span className="text-zinc-300"> </span>
        <span className="text-green-300">{'"Hello, World!"'}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Line n={6}>
        <span className="text-zinc-500">{"  }"}</span>
      </Line>
      <Line n={7}>
        <span className="text-zinc-500">{"}"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Blank n={8} />
      <Line n={9}>
        <span className="text-zinc-300">{"greet("}</span>
        <span className="text-green-300">{'"Langskin"'}</span>
        <span className="text-zinc-300">{")"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
    </Panel>
  );
}

// ─── Español ─────────────────────────────────────────────────────────────────

function SpanishSpec() {
  return (
    <Panel title="spec.json" className="h-full">
      <Line n={1}>
        <span className="text-zinc-500">{"{"}</span>
      </Line>
      <Line n={2}>
        <span className="text-zinc-400">{"  "}</span>
        <span className="text-zinc-400">"keywords"</span>
        <span className="text-zinc-500">{": {"}</span>
      </Line>
      <Line n={3}>
        <span>{"    "}</span>
        <span className="text-violet-400">"var"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-violet-300">"variable"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={4}>
        <span>{"    "}</span>
        <span className="text-emerald-400">"fun"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-emerald-300">"funcion"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={5}>
        <span>{"    "}</span>
        <span className="text-sky-400">"print"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-sky-300">"imprimir"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={6}>
        <span>{"    "}</span>
        <span className="text-rose-400">"if"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-rose-300">"si"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={7}>
        <span>{"    "}</span>
        <span className="text-orange-400">"else"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-orange-300">"sino"</span>
      </Line>
      <Line n={8}>
        <span className="text-zinc-500">{"  }"}</span>
      </Line>
      <Line n={9}>
        <span className="text-zinc-500">{"}"}</span>
      </Line>
    </Panel>
  );
}

function SpanishCode() {
  return (
    <Panel title="saludar.ls">
      <Line n={1}>
        <span className="text-violet-400">variable</span>
        <span className="text-zinc-300">{" saludar = "}</span>
        <span className="text-emerald-400">funcion</span>
        <span className="text-zinc-500">{"(nombre) {"}</span>
      </Line>
      <Line n={2}>
        <span>{"  "}</span>
        <span className="text-rose-400">si</span>
        <span className="text-zinc-500">{" (nombre != "}</span>
        <span className="text-zinc-500">null</span>
        <span className="text-zinc-500">{") {"}</span>
      </Line>
      <Line n={3}>
        <span>{"    "}</span>
        <span className="text-sky-400">imprimir</span>
        <span className="text-zinc-300"> </span>
        <span className="text-green-300">{'"Hola, "'}</span>
        <span className="text-zinc-500">{" + nombre"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Line n={4}>
        <span>{"  } "}</span>
        <span className="text-orange-400">sino</span>
        <span className="text-zinc-500">{" {"}</span>
      </Line>
      <Line n={5}>
        <span>{"    "}</span>
        <span className="text-sky-400">imprimir</span>
        <span className="text-zinc-300"> </span>
        <span className="text-green-300">{'"Hola, Mundo!"'}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Line n={6}>
        <span className="text-zinc-500">{"  }"}</span>
      </Line>
      <Line n={7}>
        <span className="text-zinc-500">{"}"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Blank n={8} />
      <Line n={9}>
        <span className="text-zinc-300">{"saludar("}</span>
        <span className="text-green-300">{'"Langskin"'}</span>
        <span className="text-zinc-300">{")"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
    </Panel>
  );
}

// ─── Custom DSL ───────────────────────────────────────────────────────────────

function CustomSpec() {
  return (
    <Panel title="spec.json" className="h-full">
      <Line n={1}>
        <span className="text-zinc-500">{"{"}</span>
      </Line>
      <Line n={2}>
        <span className="text-zinc-400">{"  "}</span>
        <span className="text-zinc-400">"keywords"</span>
        <span className="text-zinc-500">{": {"}</span>
      </Line>
      <Line n={3}>
        <span>{"    "}</span>
        <span className="text-violet-400">"var"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-violet-300">"init"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={4}>
        <span>{"    "}</span>
        <span className="text-emerald-400">"fun"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-emerald-300">"proc"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={5}>
        <span>{"    "}</span>
        <span className="text-sky-400">"print"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-sky-300">"emit"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={6}>
        <span>{"    "}</span>
        <span className="text-rose-400">"if"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-rose-300">"when"</span>
        <span className="text-zinc-500">{","}</span>
      </Line>
      <Line n={7}>
        <span>{"    "}</span>
        <span className="text-orange-400">"else"</span>
        <span className="text-zinc-500">{": "}</span>
        <span className="text-orange-300">"fallback"</span>
      </Line>
      <Line n={8}>
        <span className="text-zinc-500">{"  }"}</span>
      </Line>
      <Line n={9}>
        <span className="text-zinc-500">{"}"}</span>
      </Line>
    </Panel>
  );
}

function CustomCode() {
  return (
    <Panel title="greet.ls">
      <Line n={1}>
        <span className="text-violet-400">init</span>
        <span className="text-zinc-300">{" greet = "}</span>
        <span className="text-emerald-400">proc</span>
        <span className="text-zinc-500">{"(name) {"}</span>
      </Line>
      <Line n={2}>
        <span>{"  "}</span>
        <span className="text-rose-400">when</span>
        <span className="text-zinc-500">{" (name != "}</span>
        <span className="text-zinc-500">null</span>
        <span className="text-zinc-500">{") {"}</span>
      </Line>
      <Line n={3}>
        <span>{"    "}</span>
        <span className="text-sky-400">emit</span>
        <span className="text-zinc-300"> </span>
        <span className="text-green-300">{'"Hello, "'}</span>
        <span className="text-zinc-500">{" + name"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Line n={4}>
        <span>{"  } "}</span>
        <span className="text-orange-400">fallback</span>
        <span className="text-zinc-500">{" {"}</span>
      </Line>
      <Line n={5}>
        <span>{"    "}</span>
        <span className="text-sky-400">emit</span>
        <span className="text-zinc-300"> </span>
        <span className="text-green-300">{'"Hello, World!"'}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Line n={6}>
        <span className="text-zinc-500">{"  }"}</span>
      </Line>
      <Line n={7}>
        <span className="text-zinc-500">{"}"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
      <Blank n={8} />
      <Line n={9}>
        <span className="text-zinc-300">{"greet("}</span>
        <span className="text-green-300">{'"Langskin"'}</span>
        <span className="text-zinc-300">{")"}</span>
        <span className="text-zinc-500">{";"}</span>
      </Line>
    </Panel>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function SyntaxDemo() {
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
        <Tabs defaultValue="default">
          <TabsList className="mb-6 h-9">
            <TabsTrigger value="default" className="px-4 text-sm">
              Default
            </TabsTrigger>
            <TabsTrigger value="spanish" className="px-4 text-sm">
              Español
            </TabsTrigger>
            <TabsTrigger value="custom" className="px-4 text-sm">
              Custom DSL
            </TabsTrigger>
          </TabsList>

          {/* Legend */}
          <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1">
            {[
              { color: "bg-violet-400", label: "var" },
              { color: "bg-emerald-400", label: "fun" },
              { color: "bg-sky-400", label: "print" },
              { color: "bg-rose-400", label: "if" },
              { color: "bg-orange-400", label: "else" },
            ].map(({ color, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 font-mono text-xs text-zinc-500"
              >
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${color}`}
                />
                {label}
              </span>
            ))}
          </div>

          {/* Tab content panels */}
          {[
            {
              value: "default",
              Spec: DefaultSpec,
              Code: DefaultCode,
            },
            {
              value: "spanish",
              Spec: SpanishSpec,
              Code: SpanishCode,
            },
            { value: "custom", Spec: CustomSpec, Code: CustomCode },
          ].map(({ value, Spec, Code }) => (
            <TabsContent key={value} value={value}>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-xl shadow-black/40 sm:grid sm:grid-cols-[2fr_3fr]">
                {/* spec panel */}
                <div className="border-b border-white/10 sm:border-b-0 sm:border-r">
                  <Spec />
                </div>
                {/* code panel */}
                <Code />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
