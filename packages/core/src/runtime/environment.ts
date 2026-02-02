import { LangError } from "../errors/reporter";
import { Token } from "../lex/token";
import { Literal } from "./literal";

export class Environment {
  public enclosing: Environment | undefined;
  private values: Map<string, Literal> = new Map();

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing;
  }

  public define(name: string, value: Literal): void {
    this.values.set(name, value);
  }

  public assign(name: Token, value: Literal): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
    }

    throw LangError.runtimeError(
      `Undefined variable '${name.lexeme}'.`,
      name,
    );
  }

  public get(name: Token): Literal {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }

    if (this.enclosing) {
      return this.enclosing.get(name);
    }

    throw LangError.runtimeError(
      `Undefined variable '${name.lexeme}'.`,
      name,
    );
  }

  static ancestor(root: Environment, distance: number): Environment {
    let environment = root;
    for (let i = 0; i < distance; i++) {
      if (environment.enclosing) {
        environment = environment.enclosing;
      } else {
        throw new Error(
          "No enclosing environment found at the given distance.",
        );
      }
    }
    return environment;
  }

  public getAt(distance: number, name: string): Literal {
    const environment = Environment.ancestor(this, distance);
    if (environment.values.has(name)) {
      return environment.values.get(name)!;
    }
    throw new Error(
      `Undefined variable '${name}' at distance ${distance}.`,
    );
  }

  public assignAt(
    distance: number,
    name: Token,
    value: Literal,
  ): void {
    const environment = Environment.ancestor(this, distance);
    environment.values.set(name.lexeme, value);
  }
}
