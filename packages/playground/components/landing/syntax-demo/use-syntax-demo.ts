import { useMemo, useState } from "react";
import {
  createLangskin,
  createSpec,
  createTextMateGrammar,
  validatePartialSpec,
  PartialLangskinSpec,
} from "langskin";
import { IRawGrammar } from "vscode-textmate";
import type { OutputState } from "./types";
import { OUTPUT_LINE_LIMIT } from "./output";

// Pure utility — no side effects. Returns the parsed grammar or null, plus any
// validation/parse errors. Callers decide what to do with the result.
function parseGrammar(specString: string): {
  grammar: IRawGrammar | null;
  errors: string[];
} {
  try {
    const parsedSpec = JSON.parse(specString) as PartialLangskinSpec;
    const { valid, errors } = validatePartialSpec(parsedSpec);
    if (!valid) {
      return { grammar: null, errors };
    }
    const fullSpec = createSpec(parsedSpec);
    const textMateGrammar = createTextMateGrammar(fullSpec);
    return {
      grammar: JSON.parse(textMateGrammar) as IRawGrammar,
      errors: [],
    };
  } catch (e) {
    return { grammar: null, errors: [`${(e as Error).message}`] };
  }
}

export function useSyntaxDemo(
  ids: string[],
  codeMap: Record<string, string>,
  specMap: Record<string, string>,
) {
  const initialId = ids[0];
  const initialSpec = specMap[initialId] ?? "";
  const initialGrammarResult = parseGrammar(initialSpec);

  const [id, setId] = useState(initialId);
  const [code, setCode] = useState(codeMap[initialId] ?? "");
  const [spec, setSpec] = useState(initialSpec);
  const [grammar, setGrammar] = useState<IRawGrammar | null>(
    initialGrammarResult.grammar,
  );
  const [specErrors, setSpecErrors] = useState<string[]>(
    initialGrammarResult.errors,
  );
  const [output, setOutput] = useState<string[]>([]);
  const [outputErrors, setOutputErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  const outputState: OutputState = useMemo(() => {
    if (running) return "running";
    if (outputErrors.length > 0) return "error";
    if (output.length > 0) return "success";
    return "idle";
  }, [running, output, outputErrors]);

  function handleTabChange(newId: string) {
    setId(newId);
    setRunning(false);
    setOutput([]);
    setOutputErrors([]);
    setCode(codeMap[newId]);
    const newSpec = specMap[newId];
    setSpec(newSpec);
    const { grammar: newGrammar, errors } = parseGrammar(newSpec);
    setGrammar(newGrammar);
    setSpecErrors(errors);
  }

  function handleSpecChange(value: string) {
    setSpec(value);
    const { grammar: newGrammar, errors } = parseGrammar(value);
    setGrammar(newGrammar);
    setSpecErrors(errors);
  }

  function handleCodeChange(value: string) {
    setCode(value);
  }

  function handleRun() {
    setRunning(true);
    setOutput([]);
    setOutputErrors([]);

    let parsedSpec: PartialLangskinSpec;
    try {
      parsedSpec = JSON.parse(spec) as PartialLangskinSpec;
    } catch (e) {
      setOutputErrors([
        `Error parsing spec JSON: ${(e as Error).message}`,
      ]);
      setRunning(false);
      return;
    }

    const { valid, errors } = validatePartialSpec(parsedSpec);
    if (!valid) {
      setOutputErrors(errors);
      setRunning(false);
      return;
    }

    const lang = createLangskin(parsedSpec);
    const result = lang.run(code);
    if (result.succeeded()) {
      const lines = result.getOutput();
      if (lines.length > OUTPUT_LINE_LIMIT) {
        console.log("[langskin] Full output:", lines.join("\n"));
      }
      setOutput(lines);
      setRunning(false);
    } else {
      const errs = result.formattedErrors();
      if (errs.length > OUTPUT_LINE_LIMIT) {
        console.error("[langskin] Full errors:", errs.join("\n"));
      }
      setOutputErrors(errs);
      setRunning(false);
    }
  }

  return {
    id,
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
  };
}
