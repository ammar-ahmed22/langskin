import { BookOpen, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { customTheme } from "@/lib/code-mirror/customTheme";
import { basicSetup } from "@uiw/react-codemirror";
import { noFocusOutline } from "@/lib/code-mirror/extensions";
import { IRawGrammar } from "vscode-textmate";
import CustomCodeEditor from "../../ui/custom-code/code-editor";
import { Panel } from "./panel";
import { OutputTitle, OutputPanel } from "./output";
import type { OutputState } from "./types";

type DemoTabContentProps = {
  spec: string;
  specErrors: string[];
  grammar: IRawGrammar | null;
  code: string;
  outputState: OutputState;
  output: string[];
  outputErrors: string[];
  running: boolean;
  onSpecChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onRun: () => void;
};

export function DemoTabContent({
  spec,
  specErrors,
  grammar,
  code,
  outputState,
  output,
  outputErrors,
  running,
  onSpecChange,
  onCodeChange,
  onRun,
}: DemoTabContentProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/11 bg-neutral-950 shadow-xl shadow-black/40 lg:grid lg:grid-cols-[2fr_3fr_2fr]">
      {/* Spec editor */}
      <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
        <Panel
          title="spec.json"
          className="h-full"
          headerRight={
            // TODO: Change this link to point the web docs once they're up, pointing specifically to the spec reference
            <Button
              size="sm"
              variant="ghost"
              asChild
              className="h-auto gap-1.5 px-2.5 py-0.5 font-mono text-[11px] font-medium text-sky-400 hover:bg-sky-500/20 hover:text-sky-400"
            >
              <a
                href="https://github.com/ammar-ahmed22/langskin/tree/main/packages/core#readme"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="size-2.5" />
                Docs
              </a>
            </Button>
          }
        >
          <CodeMirror
            value={spec}
            extensions={[
              basicSetup({
                lineNumbers: true,
                searchKeymap: false,
              }),
              noFocusOutline(),
              json(),
            ]}
            basicSetup={false}
            theme={customTheme}
            onChange={onSpecChange}
          />
        </Panel>
      </div>

      {/* Code editor */}
      <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
        <Panel
          title="code.ls"
          headerRight={
            <Button
              size="sm"
              variant="ghost"
              onClick={onRun}
              disabled={running || specErrors.length > 0 || !grammar}
              className="h-auto gap-1.5 px-2.5 py-0.5 font-mono text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-400"
            >
              {running ? (
                <>
                  <Loader2 className="size-2.5 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="size-2.5 fill-current" />
                  Run
                </>
              )}
            </Button>
          }
        >
          {!grammar && specErrors.length > 0 && (
            <div className="text-red-400/90 whitespace-pre-wrap wrap-break-word">
              {specErrors.map((err, i) => (
                <div key={i}>
                  <span className="mr-3 select-none text-neutral-600">
                    $
                  </span>
                  {err}
                </div>
              ))}
            </div>
          )}
          {grammar && !specErrors.length && (
            <CustomCodeEditor
              value={code}
              onChange={onCodeChange}
              grammar={grammar}
              scopeName="source.langskin"
              showLineNumbers
              className="border-none p-0 leading-[1.4]"
            />
          )}
        </Panel>
      </div>

      {/* Output */}
      <Panel
        title={<OutputTitle state={outputState} />}
        className="h-full"
      >
        <OutputPanel
          state={outputState}
          output={output}
          errors={outputErrors}
        />
      </Panel>
    </div>
  );
}
