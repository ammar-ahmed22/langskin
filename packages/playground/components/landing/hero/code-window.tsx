import {
  createSpec,
  createTextMateGrammar,
  PartialLangskinSpec,
} from "langskin";
import { IRawGrammar } from "vscode-textmate";
import CodeMirror, { basicSetup } from "@uiw/react-codemirror";
import { noFocusOutline } from "@/lib/code-mirror/extensions";
import { json } from "@codemirror/lang-json";
import { customTheme } from "@/lib/code-mirror/customTheme";
import CustomCodeBlock from "../../ui/custom-code/code-block";
import { cn } from "@/lib/utils";
import type { HeroCodeWindowProps } from "./types";

export function HeroCodeWindow({
  id,
  code,
  specString,
  visible,
  maxSpecLines = 0,
}: HeroCodeWindowProps) {
  const spec = createSpec(
    JSON.parse(specString) as PartialLangskinSpec,
  );
  const grammar = createTextMateGrammar(spec);
  const parsed = JSON.parse(grammar) as IRawGrammar;

  let stringPartialSpec: string = specString;
  if (stringPartialSpec.split("\n").length < maxSpecLines) {
    const paddingLines =
      maxSpecLines - stringPartialSpec.split("\n").length;
    stringPartialSpec += "\n".repeat(paddingLines);
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
        <CodeMirror
          value={stringPartialSpec}
          extensions={[
            basicSetup({
              lineNumbers: true,
              searchKeymap: false,
              highlightActiveLine: false,
              highlightActiveLineGutter: false,
              foldGutter: false,
            }),
            noFocusOutline(),
            json(),
          ]}
          basicSetup={false}
          theme={customTheme}
          editable={false}
          className="w-[40%] shrink-0 overflow-x-auto p-4 text-sm"
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
          {id} spec
        </span>
      </div>
    </div>
  );
}
