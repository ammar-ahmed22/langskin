import { IRawTheme } from "vscode-textmate";

export type TokenStyle = {
  color?: string;
  fontStyle?: string;
};

export type ThemeRule = {
  scope: string | string[];
  settings: TokenStyle;
};

export function buildTheme(rawTheme?: {
  name?: string;
  settings: ThemeRule[];
}): IRawTheme {
  return {
    name: rawTheme?.name ?? "custom",
    settings: rawTheme?.settings ?? [],
  };
}

function normalizeScopeList(scope: string | string[]): string[] {
  return Array.isArray(scope) ? scope : [scope];
}

export function getMatchingStyle(
  scopes: string[],
  themeRules: ThemeRule[],
): React.CSSProperties {
  let chosen: TokenStyle = {};

  for (const rule of themeRules) {
    const ruleScopes = normalizeScopeList(rule.scope);

    const matches = ruleScopes.some((ruleScope) =>
      scopes.some(
        (tokenScope) =>
          tokenScope === ruleScope ||
          tokenScope.startsWith(`${ruleScope}.`),
      ),
    );

    if (matches) {
      chosen = {
        ...chosen,
        ...rule.settings,
      };
    }
  }

  const style: React.CSSProperties = {};

  if (chosen.color) {
    style.color = chosen.color;
  }

  if (chosen.fontStyle) {
    const parts = chosen.fontStyle.split(/\s+/).filter(Boolean);

    if (parts.includes("italic")) {
      style.fontStyle = "italic";
    }

    if (parts.includes("bold")) {
      style.fontWeight = 700;
    }

    if (parts.includes("underline")) {
      style.textDecoration = style.textDecoration
        ? `${style.textDecoration} underline`
        : "underline";
    }
  }

  return style;
}

export const defaultTheme: { name: string; settings: ThemeRule[] } = {
  name: "langskin-default",
  settings: [
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: {
        color: "var(--color-muted-foreground)",
        fontStyle: "italic",
      },
    },
    {
      scope: ["string", "string.quoted"],
      settings: { color: "var(--color-green-300)" },
    },
    {
      scope: ["constant.numeric"],
      settings: { color: "var(--color-orange-300)" },
    },
    {
      scope: ["storage.type", "keyword.control"],
      settings: { color: "var(--color-violet-300)" },
    },
    {
      scope: ["entity.name"],
      settings: { color: "var(--color-blue-300)" },
    },
    {
      scope: ["support.function.builtin"],
      settings: {
        color: "var(--color-red-300)",
        fontStyle: "italic",
      },
    },
    {
      scope: ["variable"],
      settings: { color: "var(--color-foreground)" },
    },
    {
      scope: ["variable.language.this"],
      settings: {
        color: "var(--color-red-300)",
      },
    },
  ],
};
