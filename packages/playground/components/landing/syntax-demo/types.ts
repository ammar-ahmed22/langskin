export type OutputState = "idle" | "running" | "success" | "error";

export type SyntaxDemoProps = {
  ids: string[];
  labelsById: Record<string, string>;
  codeMap: Record<string, string>;
  specMap: Record<string, string>;
};
