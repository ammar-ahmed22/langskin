import { LangError, ErrorPhase } from "./types";

export type ErrorCallback = (error: LangError) => void;

export class ErrorReporter {
  private errors: LangError[] = [];
  private callback: ErrorCallback | undefined;

  constructor(callback?: ErrorCallback) {
    this.callback = callback;
  }

  report(error: LangError): void {
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
