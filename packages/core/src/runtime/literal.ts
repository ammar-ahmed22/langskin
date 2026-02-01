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
}

export class NumberLiteral extends Literal {
  constructor(public value: number) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }
}

export class StringLiteral extends Literal {
  constructor(public value: string) {
    super();
  }

  toString(): string {
    return this.value;
  }
}

export class BoolLiteral extends Literal {
  constructor(public value: boolean) {
    super();
  }

  toString(): string {
    return this.value.toString();
  }
}

export class NilLiteral extends Literal {
  value: null = null;
  toString(): string {
    return "nil";
  }
}
