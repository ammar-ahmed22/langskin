import { Callable } from "./base";
import { Token } from "../../lex/token";
import { Interpreter } from "../interpreter";
import { Literal } from "../literal";
import { LangFunction } from "./function";
import { LangInstance } from "./instance";
import { LangskinSpec } from "../../spec/types";
import { DEFAULT_SPEC } from "../../spec/defaultSpec";

export class LangClass extends Callable {
  constructor(
    public name: string,
    public methods: Map<string, LangFunction>,
    public superclass: LangClass | undefined,
    public spec: LangskinSpec = DEFAULT_SPEC,
  ) {
    super();
  }

  findMethod(name: string): LangFunction | undefined {
    if (this.methods.has(name)) {
      return this.methods.get(name);
    }

    if (this.superclass) {
      return this.superclass.findMethod(name);
    }

    return undefined;
  }

  call(
    interpreter: Interpreter,
    args: Literal[],
    paren: Token,
  ): Literal {
    const instance = new LangInstance(this);
    const initializer = this.findMethod(this.spec.keywords.init);
    if (initializer) {
      initializer
        .bindInstance(instance, this.spec)
        .call(interpreter, args, paren);
    }
    return Literal.instance(instance);
  }

  arity(): number {
    const initializer = this.findMethod(this.spec.keywords.init);
    if (initializer) {
      return initializer.arity();
    }
    return 0;
  }

  toString(): string {
    return this.name;
  }
}
