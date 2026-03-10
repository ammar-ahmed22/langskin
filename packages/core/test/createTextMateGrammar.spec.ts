import { describe, it, expect } from "vitest";
import { createSpec } from "@langskin/api/createSpec";
import { createTextMateGrammar } from "@langskin/api/createTextMateGrammar";
import defaultGrammarJSON from "@langskin/textmate/default.tmLanguage.json" assert { type: "json" };

const REGEX_FIELD_KEYS = new Set([
  "match",
  "begin",
  "end",
  "while",
  "firstLineMatch",
]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsToken(regexText: string, token: string): boolean {
  return new RegExp(`\\b${escapeRegExp(token)}\\b`).test(regexText);
}

function collectRegexFields(
  node: unknown,
  results: string[] = [],
): string[] {
  if (Array.isArray(node)) {
    for (const child of node) {
      collectRegexFields(child, results);
    }
    return results;
  }

  if (node === null || typeof node !== "object") {
    return results;
  }

  for (const [key, value] of Object.entries(node)) {
    if (typeof value === "string" && REGEX_FIELD_KEYS.has(key)) {
      results.push(value);
      continue;
    }

    if (value !== null && typeof value === "object") {
      collectRegexFields(value, results);
    }
  }

  return results;
}

describe("createTextMateGrammar", () => {
  it("returns the default grammar when no keywords are overridden", () => {
    const spec = createSpec();
    const grammar = JSON.parse(createTextMateGrammar(spec));
    expect(grammar).toEqual(defaultGrammarJSON);
  });

  it("returns valid JSON", () => {
    const spec = createSpec({ keywords: { class: "clazz" } });
    const grammar = createTextMateGrammar(spec);
    expect(() => JSON.parse(grammar)).not.toThrow();
  });

  it("replaces overridden class keyword across regex-bearing fields", () => {
    const spec = createSpec({ keywords: { class: "clazz" } });
    const grammar = JSON.parse(createTextMateGrammar(spec)) as Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >;

    const regexBlob = collectRegexFields(grammar).join("\n");
    expect(containsToken(regexBlob, "clazz")).toBe(true);
    expect(containsToken(regexBlob, "class")).toBe(false);
    expect(grammar.repository["class-declaration"].begin).toContain(
      "\\b(clazz)\\b",
    );
    expect(grammar.repository.keywords.patterns[2].match).toBe(
      "\\bclazz\\b",
    );
  });

  it("handles overlapping keyword replacements without substring corruption", () => {
    const spec = createSpec({
      keywords: {
        if: "si",
        elif: "sinosi",
        or: "o",
        for: "para",
      },
    });

    const grammar = JSON.parse(createTextMateGrammar(spec));
    const regexBlob = collectRegexFields(grammar).join("\n");

    expect(containsToken(regexBlob, "if")).toBe(false);
    expect(containsToken(regexBlob, "elif")).toBe(false);
    expect(containsToken(regexBlob, "or")).toBe(false);
    expect(containsToken(regexBlob, "for")).toBe(false);

    expect(containsToken(regexBlob, "si")).toBe(true);
    expect(containsToken(regexBlob, "sinosi")).toBe(true);
    expect(containsToken(regexBlob, "o")).toBe(true);
    expect(containsToken(regexBlob, "para")).toBe(true);

    // unchanged token remains
    expect(containsToken(regexBlob, "while")).toBe(true);
  });

  it("supports replacements where a new token equals another default keyword literal", () => {
    const spec = createSpec({
      keywords: {
        var: "print",
        print: "echo",
      },
    });

    const grammar = JSON.parse(createTextMateGrammar(spec)) as Record<
      string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      any
    >;

    // var keyword pattern
    expect(grammar.repository.keywords.patterns[0].match).toBe(
      "\\bprint\\b",
    );
    // builtin print keyword pattern
    expect(grammar.repository.keywords.patterns[6].match).toBe(
      "\\becho\\b",
    );

    const functionCallsPattern =
      grammar.repository["function-calls"].match;
    expect(containsToken(functionCallsPattern, "print")).toBe(true);
    expect(containsToken(functionCallsPattern, "echo")).toBe(true);
    expect(containsToken(functionCallsPattern, "let")).toBe(false);
  });
});
