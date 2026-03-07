import { Token } from "../../lex/token";
import { Callable } from "../callable";
import { Interpreter } from "../interpreter";
import { Literal } from "../literal";

export type StdFunctionParams = {
  name: string;
  func: (
    interpreter: Interpreter,
    args: Literal[],
    paren: Token,
  ) => Literal;
  arity: number;
};

export class StdFunction extends Callable {
  public name: string;
  private func: (
    interpreter: Interpreter,
    args: Literal[],
    paren: Token,
  ) => Literal;
  private arityCount: number;
  constructor(params: StdFunctionParams) {
    super();
    this.name = params.name;
    this.func = params.func;
    this.arityCount = params.arity;
  }

  call(
    interpreter: Interpreter,
    args: Literal[],
    paren: Token,
  ): Literal {
    return this.func(interpreter, args, paren);
  }

  arity(): number {
    return this.arityCount;
  }

  toString(): string {
    return `<std fn ${this.name}>`;
  }
}
