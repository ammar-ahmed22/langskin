import { vscodeDarkInit } from "@uiw/codemirror-themes-all";

export const customTheme = vscodeDarkInit({
  settings: {
    background: "transparent",
    backgroundImage: "",
    foreground: "var(--color-muted-foreground)",
    caret: "var(--color-foreground)",
    selection:
      "color-mix(in oklab, var(--color-sky-500) 10%, transparent)",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBorder: "transparent",
    gutterBackground: "var(--color-background)",
    gutterForeground: "var(--color-neutral-600)",
    gutterActiveForeground: "var(--color-neutral-400)",
    fontFamily: "var(--font-mono)",
  },
});
