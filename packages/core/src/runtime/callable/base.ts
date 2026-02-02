import { Token } from "../../lex/token";
import { Interpreter } from "../interpreter";
import { Literal } from "../literal";

export abstract class Callable {
  abstract call(
    interpreter: Interpreter,
    args: Literal[],
    paren: Token,
  ): Literal;
  abstract arity(): number;
  abstract toString(): string;
}

export class ReturnValue extends Error {
  constructor(public value: Literal) {
    super();
  }
}
