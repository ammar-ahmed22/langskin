export enum ErrorPhase {
  Lexical = "Lexical",
  Syntax = "Syntax",
  Runtime = "Runtime",
}

export interface LangErrorProps {
  phase: ErrorPhase;
  message: string;
  line: number;
  column: number;
  lexeme?: string;
}
