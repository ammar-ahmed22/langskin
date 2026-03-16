import {
  Braces,
  Code2,
  AlertCircle,
  Terminal,
  Package,
  Settings2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const features = [
  {
    icon: Braces,
    title: "22 Customizable Keywords",
    description:
      "Map variable declarations, control flow, functions, classes, and more to any identifier you choose — in any language or notation.",
  },
  {
    icon: Code2,
    title: "Full Language Support",
    description:
      "Variables, functions, classes, loops, conditionals, recursion, closures, arithmetic, and string operations — all built in.",
  },
  {
    icon: AlertCircle,
    title: "Detailed Error Reporting",
    description:
      "Lexical, syntax, and runtime errors come with precise line numbers, column positions, and human-readable messages.",
  },
  {
    icon: Terminal,
    title: "CLI Tool",
    description:
      "Run .ls files directly, launch an interactive REPL, or apply a custom spec — all instantly with npx langskin.",
  },
  {
    icon: Package,
    title: "TypeScript-First API",
    description:
      "Import createLangskin and createSpec in any JS/TS project. Full IntelliSense support with exported types included.",
  },
  {
    icon: Settings2,
    title: "Sensible Defaults",
    description:
      "Start with English-like defaults right away. Override only the keywords you care about — everything else just works.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="border-t border-white/[0.06] bg-zinc-950/50 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12 max-w-xl">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-sky-400">
            Features
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
            A full language under the hood.
          </h2>
          <p className="mt-4 text-zinc-400">
            Langskin ships with a complete interpreter. You just
            choose what words to use.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group border-white/[0.07] bg-zinc-900/40 transition-colors hover:border-white/[0.14] hover:bg-zinc-900/70"
            >
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-zinc-800/60 transition-colors group-hover:border-sky-500/30 group-hover:bg-sky-500/10">
                  <Icon className="size-4 text-zinc-400 transition-colors group-hover:text-sky-400" />
                </div>
                <CardTitle className="text-sm font-medium text-zinc-100">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm leading-6 text-zinc-500">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
