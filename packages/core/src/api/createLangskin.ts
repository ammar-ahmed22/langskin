import { LangError } from "../errors/error";
import { Lexer } from "../lex/lexer";
import { Parser } from "../parse/parser";
import { Reporter, ReporterOptions } from "../reporter/reporter";
import { Interpreter } from "../runtime/interpreter";
import { Resolver } from "../runtime/resolver";
import { LangskinSpec, PartialLangskinSpec } from "../spec/types";
import { createSpec } from "./createSpec";

export class LangskinSession {
  private interpreter: Interpreter;
  private reporter: Reporter;
  private history: string[] = [];

  constructor(spec: LangskinSpec, reporterOptions?: ReporterOptions) {
    this.reporter = new Reporter(reporterOptions);
    this.interpreter = new Interpreter(this.reporter, spec);
    this.spec = spec;
  }

  private spec: LangskinSpec;

  public run(source: string): Reporter {
    this.reporter.clear();
    const reporter = this.reporter;
    const lexer = new Lexer(source, reporter, this.spec);
    const tokens = lexer.scanTokens();
    const parser = new Parser(tokens, this.spec);
    try {
      const statements = parser.parse();
      const resolver = new Resolver(this.interpreter, this.spec);
      try {
        resolver.resolveStmts(statements);
        try {
          this.interpreter.interpret(statements);
          this.history.push(source);
          return reporter;
        } catch (e: unknown) {
          if (e instanceof LangError) {
            reporter.report(e);
            return reporter;
          }
          throw e;
        }
      } catch (e: unknown) {
        if (e instanceof LangError) {
          reporter.report(e);
          return reporter;
        }
        throw e;
      }
    } catch (e: unknown) {
      if (e instanceof LangError) {
        reporter.report(e);
        return reporter;
      }
      throw e;
    }
  }

  public getHistory(): string[] {
    return [...this.history];
  }
}

class Langskin {
  constructor(public spec: LangskinSpec) {}

  public run(source: string): Reporter {
    const reporter = new Reporter();
    const lexer = new Lexer(source, reporter, this.spec);
    const tokens = lexer.scanTokens();
    const parser = new Parser(tokens, this.spec);
    try {
      const statements = parser.parse();
      const interpreter = new Interpreter(reporter, this.spec);
      const resolver = new Resolver(interpreter, this.spec);
      try {
        resolver.resolveStmts(statements);
        try {
          interpreter.interpret(statements);
          return reporter;
        } catch (e: unknown) {
          if (e instanceof LangError) {
            reporter.report(e);
            return reporter;
          }
          throw e;
        }
      } catch (e: unknown) {
        if (e instanceof LangError) {
          reporter.report(e);
          return reporter;
        }
        throw e;
      }
    } catch (e: unknown) {
      if (e instanceof LangError) {
        reporter.report(e);
        return reporter;
      }
      throw e;
    }
  }

  public createSession(
    reporterOptions?: ReporterOptions,
  ): LangskinSession {
    return new LangskinSession(this.spec, reporterOptions);
  }
}

/**
 * Creates a new Langskin interpreter instance with the given spec.
 * If no spec is provided, uses the default keywords.
 *
 * @param partialSpec - Optional partial spec to customize keywords
 * @returns A Langskin instance
 */
export function createLangskin(
  partialSpec?: PartialLangskinSpec,
): Langskin {
  const spec = createSpec(partialSpec);
  return new Langskin(spec);
}
