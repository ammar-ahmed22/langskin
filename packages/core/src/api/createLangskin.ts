import { LangError } from "../errors/error";
import { Lexer } from "../lex/lexer";
import { Parser } from "../parse/parser";
import { Reporter } from "../reporter/reporter";
import { Interpreter } from "../runtime/interpreter";
import { Resolver } from "../runtime/resolver";

class Langskin {
  // TODO: Define a proper spec type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public spec: any) {}

  public run(source: string): Reporter {
    const reporter = new Reporter();
    const lexer = new Lexer(source, reporter);
    const tokens = lexer.scanTokens();
    const parser = new Parser(tokens);
    try {
      const statements = parser.parse();
      const interpreter = new Interpreter(reporter);
      const resolver = new Resolver(interpreter);
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
}

// TODO: Define a proper spec type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLangskin(spec: any) {
  return new Langskin(spec);
}
