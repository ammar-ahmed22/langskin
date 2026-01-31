export enum ErrorPhase {
  Lexical = "Lexical",
  Syntax = "Syntax",
  Runtime = "Runtime",
}

export interface LangError {
  phase: ErrorPhase;
  message: string;
  line: number;
  column: number;
  lexeme?: string;
}
