import { Token } from "../lex/token";
import { ErrorPhase, LangErrorProps } from "./types";

export class LangError extends Error {
  public phase: ErrorPhase;
  public message: string;
  public line: number;
  public column: number;
  public lexeme: string | undefined;
  constructor({
    phase,
    message,
    line,
    column,
    lexeme,
  }: LangErrorProps) {
    super(
      `[${ErrorPhase[phase]} Error] on line ${line} at column ${column}: ${message}`,
    );
    this.phase = phase;
    this.message = message;
    this.line = line;
    this.column = column;
    this.lexeme = lexeme;
  }

  static lexerError(
    message: string,
    line: number,
    column: number,
  ): LangError {
    return new LangError({
      phase: ErrorPhase.Lexical,
      message,
      line,
      column,
    });
  }

  static syntaxError(message: string, token: Token): LangError {
    return new LangError({
      phase: ErrorPhase.Syntax,
      message,
      line: token.line,
      column: token.column,
      lexeme: token.lexeme,
    });
  }

  static runtimeError(message: string, token: Token): LangError {
    return new LangError({
      phase: ErrorPhase.Runtime,
      message,
      line: token.line,
      column: token.column,
      lexeme: token.lexeme,
    });
  }
}

export type ErrorCallback = (error: LangError) => void;

export class ErrorReporter {
  private errors: LangError[] = [];
  private callback: ErrorCallback | undefined;

  constructor(callback?: ErrorCallback) {
    this.callback = callback;
  }

  report(error: LangError): void;
  report(props: LangErrorProps): void;
  report(arg: LangError | LangErrorProps): void {
    let error: LangError;
    if (arg instanceof LangError) {
      error = arg;
    } else {
      error = new LangError(arg);
    }
    this.errors.push(error);
    if (this.callback) {
      this.callback(error);
    }
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasErrorsInPhase(phase: ErrorPhase): boolean {
    return this.errors.some((e) => e.phase === phase);
  }

  getErrors(): LangError[] {
    return [...this.errors];
  }

  clear(): void {
    this.errors = [];
  }
}
