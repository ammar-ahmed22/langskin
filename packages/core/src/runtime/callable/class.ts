import { Callable } from "./base";
import { Token } from "../../lex/token";
import { Interpreter } from "../interpreter";
import { Literal } from "../literal";
import { LangFunction } from "./function";
import { LangInstance } from "./instance";

export class LangClass extends Callable {
  constructor(
    public name: string,
    public methods: Map<string, LangFunction>,
    public superclass: LangClass | undefined,
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
    // TODO : Spec should be used here to interpolate the user's keyword for "init"
    const initializer = this.findMethod("init");
    if (initializer) {
      initializer
        .bindInstance(instance)
        .call(interpreter, args, paren);
    }
    return Literal.instance(instance);
  }

  arity(): number {
    // TODO: Spec should be used here to interpolate the user's keyword for "init"
    const initializer = this.findMethod("init");
    if (initializer) {
      return initializer.arity();
    }
    return 0;
  }

  toString(): string {
    return this.name;
  }
}
