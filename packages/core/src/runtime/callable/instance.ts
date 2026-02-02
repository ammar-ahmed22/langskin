import { LangError } from "../../errors/error";
import { Token } from "../../lex/token";
import { Literal } from "../literal";
import { LangClass } from "./class";

export class LangInstance {
  constructor(
    public langClass: LangClass,
    public fields: Map<string, Literal> = new Map(),
  ) {}

  toString(): string {
    return `<instanceof ${this.langClass.name}>`;
  }

  get(name: Token): Literal {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme)!;
    }

    const method = this.langClass.findMethod(name.lexeme);
    if (method) {
      return Literal.callable(method.bindInstance(this));
    }

    throw LangError.runtimeError(
      `Undefined property '${name.lexeme}'.`,
      name,
    );
  }

  set(name: Token, value: Literal): void {
    this.fields.set(name.lexeme, value);
  }
}
