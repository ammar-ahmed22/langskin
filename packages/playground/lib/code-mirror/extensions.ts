import { EditorView } from "codemirror";

export const noFocusOutline = () =>
  EditorView.theme({
    "&.cm-editor": {
      outline: "none",
      border: "none",
    },
  });

export const lineHeight = (lineHeight: number | string) => {
  return EditorView.theme({
    ".cm-content": {
      lineHeight:
        typeof lineHeight === "number"
          ? `${lineHeight}px`
          : lineHeight,
    },
    ".cm-line": {
      lineHeight:
        typeof lineHeight === "number"
          ? `${lineHeight}px`
          : lineHeight,
    },
  });
};
