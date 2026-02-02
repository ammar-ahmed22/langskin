import { ErrorPhase, LangErrorProps } from "../errors/types";
import { LangError } from "../errors/error";

export type ErrorCallback = (error: LangError) => void;
export type OutputCallback = (value: string) => void;

export interface ReporterOptions {
  onError?: ErrorCallback;
  onOutput?: OutputCallback;
}

export class Reporter {
  private errors: LangError[] = [];
  private output: string[] = [];
  private errorCallback: ErrorCallback | undefined;
  private outputCallback: OutputCallback | undefined;

  constructor(options?: ReporterOptions) {
    this.errorCallback = options?.onError;
    this.outputCallback = options?.onOutput;
  }

  // Error methods
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
    if (this.errorCallback) {
      this.errorCallback(error);
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

  clearErrors(): void {
    this.errors = [];
  }

  // Output methods
  write(value: string): void {
    this.output.push(value);
    if (this.outputCallback) {
      this.outputCallback(value);
    }
  }

  getOutput(): string[] {
    return [...this.output];
  }

  clearOutput(): void {
    this.output = [];
  }

  // Status methods
  succeeded(): boolean {
    return !this.hasErrors();
  }

  failed(): boolean {
    return this.hasErrors();
  }

  // Clear all
  clear(): void {
    this.clearErrors();
    this.clearOutput();
  }
}
