import { Callable, ReturnValue } from "./base";
import { Stmt } from "../../ast";
import { LangError } from "../../errors/error";
import { Token } from "../../lex/token";
import { Environment } from "../environment";
import { Interpreter } from "../interpreter";
import { Literal } from "../literal";
import { LangInstance } from "./instance";

export class LangFunction extends Callable {
  constructor(
    public declaration: Stmt.Statement,
    public closure: Environment,
    public isInitializer: boolean,
  ) {
    super();
  }

  public bindInstance(instance: LangInstance): LangFunction {
    const env = new Environment(this.closure);
    // TODO: Spec should be used here to interpolate the user's keyword for "this"
    env.define("this", Literal.instance(instance));
    return new LangFunction(
      this.declaration,
      env,
      this.isInitializer,
    );
  }

  call(
    interpreter: Interpreter,
    args: Literal[],
    paren: Token,
  ): Literal {
    const env = new Environment(this.closure);
    if (this.declaration instanceof Stmt.FunctionStmt) {
      for (let i = 0; i < this.declaration.params.length; i++) {
        const param = this.declaration.params[i]!;
        env.define(param?.lexeme, args[i]!);
      }

      try {
        interpreter.executeBlock(this.declaration.body, env);
      } catch (returnValue: unknown) {
        if (returnValue instanceof ReturnValue) {
          if (this.isInitializer) {
            // TODO: Spec should be used here to interpolate the user's keyword for "this"
            return this.closure.getAt(0, "this");
          }
          return returnValue.value;
        } else {
          throw returnValue;
        }
      }

      if (this.isInitializer) {
        // TODO: Spec should be used here to interpolate the user's keyword for "this"
        return this.closure.getAt(0, "this");
      }
      // If no return statement is encountered, return nil
      return Literal.nil();
    } else {
      throw LangError.runtimeError("Can only call functions", paren);
    }
  }

  arity(): number {
    if (this.declaration instanceof Stmt.FunctionStmt) {
      return this.declaration.params.length;
    }
    return 0;
  }

  toString(): string {
    if (this.declaration instanceof Stmt.FunctionStmt) {
      const paramsStr = this.declaration.params
        .map((p) => p.lexeme)
        .join(", ");
      return `<fn ${this.declaration.name.lexeme}(${paramsStr})>`;
    }
    return "<fn>";
  }
}
