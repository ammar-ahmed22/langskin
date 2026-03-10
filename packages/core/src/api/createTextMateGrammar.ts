import { DEFAULT_SPEC } from "../spec/defaultSpec";
import { KeywordName, LangskinSpec } from "../spec/types";
import defaultGrammarJSON from "../textmate/default.tmLanguage.json" assert { type: "json" };

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

const REGEX_FIELD_KEYS = new Set([
  "match",
  "begin",
  "end",
  "while",
  "firstLineMatch",
]);

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildKeywordReplacementMap(
  spec: LangskinSpec,
): Map<string, string> {
  const replacements = new Map<string, string>();
  for (const keywordName of Object.keys(
    DEFAULT_SPEC.keywords,
  ) as KeywordName[]) {
    const defaultKeyword = DEFAULT_SPEC.keywords[keywordName];
    const targetKeyword = spec.keywords[keywordName];
    if (targetKeyword !== defaultKeyword) {
      replacements.set(defaultKeyword, targetKeyword);
    }
  }
  return replacements;
}

function createRegexTokenReplacer(
  replacements: Map<string, string>,
): (value: string) => string {
  if (replacements.size === 0) {
    return (value: string) => value;
  }
  const tokenAlternation = [...replacements.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|");

  const tokenPattern = new RegExp(
    `(^|[^A-Za-z0-9_]|\\\\b)(${tokenAlternation})(?=$|[^A-Za-z0-9_]|\\\\b)`,
    "g",
  );

  return (value: string) =>
    value.replace(
      tokenPattern,
      (_match, prefix: string, token: string) =>
        `${prefix}${replacements.get(token) ?? token}`,
    );
}

function rewriteRegexFields(
  node: JsonValue,
  replaceToken: (value: string) => string,
): void {
  if (Array.isArray(node)) {
    for (const child of node) {
      rewriteRegexFields(child, replaceToken);
    }
    return;
  }

  if (node === null || typeof node !== "object") {
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (typeof value === "string" && REGEX_FIELD_KEYS.has(key)) {
      node[key] = replaceToken(value);
      continue;
    }

    if (value !== null && typeof value === "object") {
      rewriteRegexFields(value, replaceToken);
    }
  }
}

export function createTextMateGrammar(spec: LangskinSpec): string {
  const grammar = deepClone(defaultGrammarJSON) as JsonValue;
  const replacements = buildKeywordReplacementMap(spec);
  const replaceToken = createRegexTokenReplacer(replacements);
  rewriteRegexFields(grammar, replaceToken);
  return JSON.stringify(grammar, null, 2);
}
