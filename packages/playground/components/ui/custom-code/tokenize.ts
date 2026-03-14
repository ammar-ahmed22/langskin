import { loadWASM, OnigScanner, OnigString } from "onigasm";
import {
  IGrammar,
  INITIAL,
  IRawGrammar,
  Registry,
} from "vscode-textmate";
import { buildTheme, getMatchingStyle, ThemeRule } from "./theme";

export type RenderToken = {
  content: string;
  scopes: string[];
  style: React.CSSProperties;
};

export type RenderLine = RenderToken[];

const onigLib = Promise.resolve({
  createOnigScanner(patterns: string[]) {
    return new OnigScanner(patterns);
  },
  createOnigString(s: string) {
    return new OnigString(s);
  },
});

let wasmLoaded: Promise<void> | null = null;

async function ensureOnigasmLoaded() {
  if (!wasmLoaded) {
    wasmLoaded = (async () => {
      const response = await fetch("/onigasm.wasm");
      const buffer = await response.arrayBuffer();
      return loadWASM(buffer);
    })();
  }
  await wasmLoaded;
}

async function createGrammar(
  grammar: IRawGrammar,
  scopeName: string,
  theme?: { name?: string; settings: ThemeRule[] },
): Promise<IGrammar | null> {
  await ensureOnigasmLoaded();

  const registry = new Registry({
    theme: buildTheme(theme),
    loadGrammar: async (requestedScopeName) => {
      if (requestedScopeName === scopeName) {
        return grammar;
      }
      return null;
    },
    onigLib,
  });

  return registry.loadGrammar(scopeName);
}

export async function tokenizeCode(
  code: string,
  grammar: IRawGrammar,
  scopeName: string,
  theme?: { name?: string; settings: ThemeRule[] },
): Promise<RenderLine[]> {
  const loadedGrammar = await createGrammar(
    grammar,
    scopeName,
    theme,
  );

  if (!loadedGrammar) {
    return code.split("\n").map((line) => [
      {
        content: line,
        scopes: [],
        style: {},
      },
    ]);
  }

  const lines = code.split("\n");
  const renderedLines: RenderLine[] = [];
  const themeRules = theme?.settings ?? [];

  let ruleStack = INITIAL;

  for (const line of lines) {
    const result = loadedGrammar.tokenizeLine(line, ruleStack);
    ruleStack = result.ruleStack;

    const renderedTokens: RenderToken[] = result.tokens.map(
      (token) => {
        const content = line.slice(token.startIndex, token.endIndex);
        const scopes = token.scopes;

        return {
          content,
          scopes,
          style: getMatchingStyle(scopes, themeRules),
        };
      },
    );

    if (renderedTokens.length === 0) {
      renderedTokens.push({
        content: "",
        scopes: [],
        style: {},
      });
    }

    renderedLines.push(renderedTokens);
  }

  return renderedLines;
}
