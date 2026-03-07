import { Callable } from "./callable";
import { LangInstance } from "./callable/instance";

export abstract class Literal {
  abstract value: unknown;
  abstract toString(): string;

  static number(value: number): NumberLiteral {
    return new NumberLiteral(value);
  }

  static string(value: string): StringLiteral {
    return new StringLiteral(value);
  }

  static bool(value: boolean): BoolLiteral {
    return new BoolLiteral(value);
  }

  static nil(): NilLiteral {
    return new NilLiteral();
  }

  static array(value: Literal[]): ArrayLiteral {
    return new ArrayLiteral(value);
  }

  static callable(value: Callable): CallableLiteral {
    return new CallableLiteral(value);
  }

  static instance(value: LangInstance): InstanceLiteral {
    return new InstanceLiteral(value);
  }
}

export class NumberLiteral extends Literal {
  constructor(public value: number) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }
}

export function isNumberLiteral(lit?: Literal): lit is NumberLiteral {
  return lit instanceof NumberLiteral;
}

export class StringLiteral extends Literal {
  constructor(public value: string) {
    super();
  }

  toString(): string {
    return this.value;
  }
}

export function isStringLiteral(lit?: Literal): lit is StringLiteral {
  return lit instanceof StringLiteral;
}

export class BoolLiteral extends Literal {
  constructor(public value: boolean) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }
}

export function isBoolLiteral(lit?: Literal): lit is BoolLiteral {
  return lit instanceof BoolLiteral;
}

export class NilLiteral extends Literal {
  value: null = null;
  toString(): string {
    return "nil";
  }
}

export function isNilLiteral(lit?: Literal): lit is NilLiteral {
  return lit instanceof NilLiteral;
}

export class ArrayLiteral extends Literal {
  constructor(public value: Literal[]) {
    super();
  }

  toString(): string {
    return `[${this.value.map((v) => v.toString()).join(", ")}]`;
  }
}

export function isArrayLiteral(lit?: Literal): lit is ArrayLiteral {
  return lit instanceof ArrayLiteral;
}

export class CallableLiteral extends Literal {
  constructor(public value: Callable) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }
}

export function isCallableLiteral(
  lit?: Literal,
): lit is CallableLiteral {
  return lit instanceof CallableLiteral;
}

export class InstanceLiteral extends Literal {
  constructor(public value: LangInstance) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }
}

export function isInstanceLiteral(
  lit?: Literal,
): lit is InstanceLiteral {
  return lit instanceof InstanceLiteral;
}
