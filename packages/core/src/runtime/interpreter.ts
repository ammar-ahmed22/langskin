import { Environment } from "./environment";
import { Expr, ExprVisitor, Stmt, StmtVisitor } from "../ast";
import {
  ArrayLiteral,
  BoolLiteral,
  CallableLiteral,
  InstanceLiteral,
  Literal,
  NilLiteral,
  NumberLiteral,
  StringLiteral,
} from "./literal";
import { Token, TokenType } from "../lex/token";
import { LangError } from "../errors/error";
import { LangClass } from "./callable/class";
import { LangFunction, ReturnValue } from "./callable";
import { Reporter } from "../reporter/reporter";

export class Interpreter
  implements ExprVisitor<Literal>, StmtVisitor<void>
{
  public globals: Environment;
  public environment: Environment;
  // NOTE: Have to be careful here, getting values must be the same reference
  public locals: Map<Expr.Expression, number> = new Map();
  private reporter: Reporter | undefined;

  constructor(reporter?: Reporter) {
    this.globals = new Environment();
    this.environment = this.globals;
    this.reporter = reporter;
  }

  public interpret(statements: Stmt.Statement[]): void {
    for (const statement of statements) {
      this.execute(statement);
    }
  }

  private evaluate(expr: Expr.Expression): Literal {
    return expr.accept(this);
  }

  private execute(stmt: Stmt.Statement): void {
    stmt.accept(this);
  }

  executeBlock(statements: Stmt.Statement[], env: Environment): void {
    const previous = this.environment;
    this.environment = env;
    for (const statement of statements) {
      try {
        this.execute(statement);
      } catch (error) {
        this.environment = previous;
        throw error;
      }
    }
    this.environment = previous;
  }

  resolve(expr: Expr.Expression, depth: number): void {
    this.locals.set(expr, depth);
  }

  private lookupVariable(
    name: Token,
    expr: Expr.Expression,
  ): Literal {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }

  private isUint(literal: Literal): boolean {
    return (
      literal instanceof NumberLiteral &&
      literal.value >= 0 &&
      Number.isInteger(literal.value)
    );
  }

  private evaluateIndex(
    indexExpr: Expr.Expression,
    bracket: Token,
  ): Literal {
    const index = this.evaluate(indexExpr);
    if (!(index instanceof NumberLiteral)) {
      throw LangError.runtimeError(
        "Index must be a number.",
        bracket,
      );
    }

    if (!this.isUint(index)) {
      throw LangError.runtimeError(
        "Index must be a non-negative integer.",
        bracket,
      );
    }

    return index;
  }

  private isTruthy(literal: Literal): boolean {
    if (literal instanceof BoolLiteral) {
      return literal.value;
    }

    if (literal instanceof NilLiteral) {
      return false;
    }

    if (literal instanceof NumberLiteral) {
      return literal.value !== 0;
    }

    if (literal instanceof ArrayLiteral) {
      return literal.value.length > 0;
    }

    return true;
  }

  private isEqual(left: Literal, right: Literal): boolean {
    // nil is only equal to nil
    if (left instanceof NilLiteral && right instanceof NilLiteral) {
      return true;
    }
    if (left instanceof NilLiteral || right instanceof NilLiteral) {
      return false;
    }

    // Compare primitive values
    if (
      left instanceof NumberLiteral &&
      right instanceof NumberLiteral
    ) {
      return left.value === right.value;
    }
    if (
      left instanceof StringLiteral &&
      right instanceof StringLiteral
    ) {
      return left.value === right.value;
    }
    if (left instanceof BoolLiteral && right instanceof BoolLiteral) {
      return left.value === right.value;
    }

    // For arrays, functions, instances - use reference equality
    return left === right;
  }

  // Expression visitors
  visitLiteralExpr(expr: Expr.LiteralExpr): Literal {
    return expr.value;
  }

  visitArrayExpr(expr: Expr.ArrayExpr): Literal {
    const elements = expr.values.map((value) => this.evaluate(value));
    return Literal.array(elements);
  }

  visitGroupingExpr(expr: Expr.Grouping): Literal {
    return this.evaluate(expr.expression);
  }

  visitUnaryExpr(expr: Expr.Unary): Literal {
    const right = this.evaluate(expr.right);
    if (expr.operator.type === TokenType.Minus) {
      if (right instanceof NumberLiteral) {
        return Literal.number(-right.value);
      } else {
        throw LangError.runtimeError(
          "Operand must be a number.",
          expr.operator,
        );
      }
    } else if (expr.operator.type === TokenType.Bang) {
      return this.isTruthy(right)
        ? Literal.bool(false)
        : Literal.bool(true);
    } else {
      throw LangError.runtimeError(
        "Unknown unary operator.",
        expr.operator,
      );
    }
  }

  visitBinaryExpr(expr: Expr.Binary): Literal {
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);
    switch (expr.operator.type) {
      case TokenType.Minus:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.number(left.value - right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.Plus:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.number(left.value + right.value);
        } else if (
          left instanceof StringLiteral &&
          right instanceof StringLiteral
        ) {
          return Literal.string(left.value + right.value);
        } else if (
          left instanceof ArrayLiteral &&
          right instanceof ArrayLiteral
        ) {
          return Literal.array([...left.value, ...right.value]);
        } else {
          throw LangError.runtimeError(
            "Operands must both be numbers, strings or arrays.",
            expr.operator,
          );
        }
      case TokenType.Slash:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          if (right.value === 0) {
            throw LangError.runtimeError(
              "Division by zero.",
              expr.operator,
            );
          }
          return Literal.number(left.value / right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.Star:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.number(left.value * right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.Modulo:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.number(left.value % right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.Greater:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.bool(left.value > right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.GreaterEqual:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.bool(left.value >= right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.Less:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.bool(left.value < right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.LessEqual:
        if (
          left instanceof NumberLiteral &&
          right instanceof NumberLiteral
        ) {
          return Literal.bool(left.value <= right.value);
        } else {
          throw LangError.runtimeError(
            "Operands must be numbers.",
            expr.operator,
          );
        }
      case TokenType.EqualEqual:
        return Literal.bool(this.isEqual(left, right));
      case TokenType.BangEqual:
        return Literal.bool(!this.isEqual(left, right));
      default:
        throw LangError.runtimeError(
          "Unknown binary operator.",
          expr.operator,
        );
    }
  }

  visitVariableExpr(expr: Expr.Variable): Literal {
    return this.lookupVariable(expr.name, expr);
  }

  visitAssignExpr(expr: Expr.Assign): Literal {
    const resolvedValue = this.evaluate(expr.value);
    const distance = this.locals.get(expr);
    if (distance) {
      this.environment.assignAt(distance, expr.name, resolvedValue);
    } else {
      this.globals.assign(expr.name, resolvedValue);
    }
    return resolvedValue;
  }

  // NOTE: Not sure if this is correct
  visitLogicalExpr(expr: Expr.Logical): Literal {
    const left = this.evaluate(expr.left);
    // OR
    if (expr.operator.type === TokenType.Or) {
      // Left is truthy, short circuit
      if (this.isTruthy(left)) return Literal.bool(true);
    } else if (expr.operator.type === TokenType.And) {
      // AND
      // Left is falsy, short circuit
      if (!this.isTruthy(left)) return Literal.bool(false);
    }
    // For OR, left is falsy, check right
    // For AND, left is truth, check right
    return this.evaluate(expr.right);
  }

  visitCallExpr(expr: Expr.Call): Literal {
    const callee = this.evaluate(expr.callee);
    const args: Literal[] = [];
    for (const argument of expr.args) {
      args.push(this.evaluate(argument));
    }

    if (callee instanceof CallableLiteral) {
      if (args.length !== callee.value.arity()) {
        throw LangError.runtimeError(
          `Expected ${callee.value.arity()} arguments but got ${args.length}.`,
          expr.paren,
        );
      }
      return callee.value.call(this, args, expr.paren);
    }
    throw LangError.runtimeError(
      "Can only call functions and classes.",
      expr.paren,
    );
  }

  visitGetExpr(expr: Expr.Get): Literal {
    const object = this.evaluate(expr.object);
    if (object instanceof InstanceLiteral) {
      return object.value.get(expr.name);
    }
    throw LangError.runtimeError(
      "Only instances have properties.",
      expr.name,
    );
  }

  visitSetExpr(expr: Expr.Set): Literal {
    const object = this.evaluate(expr.object);
    if (object instanceof InstanceLiteral) {
      const value = this.evaluate(expr.value);
      object.value.set(expr.name, value);
      return value;
    }
    throw LangError.runtimeError(
      "Only instances have fields.",
      expr.name,
    );
  }

  visitThisExpr(expr: Expr.This): Literal {
    return this.lookupVariable(expr.keyword, expr);
  }

  visitSuperExpr(expr: Expr.Super): Literal {
    const distance = this.locals.get(expr);
    if (!distance) {
      // TODO: Spec should be used here to interpolate the user's keyword for "super"
      throw LangError.runtimeError(
        "Undefined 'super' reference.",
        expr.keyword,
      );
    }
    let superclass;
    // TODO: Spec should be used here to interpolate the user's keyword for "super"
    if (
      this.environment.getAt(distance, "super") instanceof
      CallableLiteral
    ) {
      superclass = this.environment.getAt(
        distance,
        "super",
      ) as CallableLiteral;
    } else {
      // TODO: Spec should be used here to interpolate the user's keyword for "super"
      throw LangError.runtimeError(
        "Undefined 'super' reference.",
        expr.keyword,
      );
    }

    let object;
    // TODO: Spec should be used here to interpolate the user's keyword for "this"
    if (
      this.environment.getAt(distance - 1, "this") instanceof
      InstanceLiteral
    ) {
      object = this.environment.getAt(
        distance - 1,
        "this",
      ) as InstanceLiteral;
    } else {
      // TODO: Spec should be used here to interpolate the user's keyword for "this"
      throw LangError.runtimeError(
        "Undefined 'this' reference.",
        expr.keyword,
      );
    }

    if (!(superclass.value instanceof LangClass)) {
      throw LangError.runtimeError(
        "Superclass is not a class.",
        expr.keyword,
      );
    }
    const actualMethod = superclass.value.findMethod(
      expr.method.lexeme,
    );
    if (!actualMethod) {
      throw LangError.runtimeError(
        `Undefined property '${expr.method.lexeme}'.`,
        expr.method,
      );
    }
    return Literal.callable(actualMethod.bindInstance(object.value));
  }

  visitGetIndexedExpr(expr: Expr.GetIndexed): Literal {
    const object = this.evaluate(expr.object);
    const indexLiteral = this.evaluateIndex(expr.index, expr.bracket);
    if (!(indexLiteral instanceof NumberLiteral)) {
      throw LangError.runtimeError(
        "Index must be a number.",
        expr.bracket,
      );
    }
    const index = indexLiteral.value;
    if (object instanceof ArrayLiteral) {
      if (index < 0 || index >= object.value.length) {
        throw LangError.runtimeError(
          "Index out of bounds.",
          expr.bracket,
        );
      }
      return object.value[index]!;
    }

    if (object instanceof StringLiteral) {
      if (index < 0 || index >= object.value.length) {
        throw LangError.runtimeError(
          "Index out of bounds.",
          expr.bracket,
        );
      }
      return Literal.string(object.value.charAt(index));
    }

    throw LangError.runtimeError(
      "Only arrays and strings can be indexed.",
      expr.bracket,
    );
  }

  visitSetIndexedExpr(expr: Expr.SetIndexed): Literal {
    const object = this.evaluate(expr.object);
    const value = this.evaluate(expr.value);
    if (object instanceof ArrayLiteral) {
      const indexLiteral = this.evaluateIndex(
        expr.index,
        expr.bracket,
      );
      if (!(indexLiteral instanceof NumberLiteral)) {
        throw LangError.runtimeError(
          "Index must be a number.",
          expr.bracket,
        );
      }
      const index = indexLiteral.value;
      if (index < 0 || index >= object.value.length) {
        throw LangError.runtimeError(
          "Index out of bounds.",
          expr.bracket,
        );
      }
      object.value[index] = value;
      return value;
    }

    throw LangError.runtimeError(
      "Only arrays can be indexed.",
      expr.bracket,
    );
  }

  // Statement visitors
  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.evaluate(stmt.expression);
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    const value = this.evaluate(stmt.expression);
    if (this.reporter) {
      this.reporter.write(value.toString());
    } else {
      console.log(value.toString());
    }
  }

  visitVarStmt(stmt: Stmt.Var): void {
    let value: Literal = Literal.nil();
    if (stmt.initializer) {
      value = this.evaluate(stmt.initializer);
    }
    this.environment.define(stmt.name.lexeme, value);
  }

  visitBlockStmt(stmt: Stmt.Block): void {
    this.executeBlock(
      stmt.statements,
      new Environment(this.environment),
    );
  }

  visitIfStmt(stmt: Stmt.If): void {
    const condition = this.evaluate(stmt.condition);
    if (this.isTruthy(condition)) {
      this.execute(stmt.thenBranch);
    } else if (stmt.elseBranch) {
      this.execute(stmt.elseBranch);
    }
  }

  visitWhileStmt(stmt: Stmt.While): void {
    while (this.isTruthy(this.evaluate(stmt.condition))) {
      this.execute(stmt.body);
    }
  }

  visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    const func = new LangFunction(stmt, this.environment, false);
    this.environment.define(stmt.name.lexeme, Literal.callable(func));
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    let value: Literal = Literal.nil();
    if (stmt.value) {
      value = this.evaluate(stmt.value);
    }
    throw new ReturnValue(value);
  }

  visitClassStmt(stmt: Stmt.Class): void {
    let superclass = null;
    if (stmt.superclass) {
      const superclassLiteral = this.evaluate(stmt.superclass);
      if (
        !(superclassLiteral instanceof CallableLiteral) ||
        !(superclassLiteral.value instanceof LangClass)
      ) {
        // TODO: Spec should be used here to interpolate the user's keyword for "super" and "class" is
        throw LangError.runtimeError(
          "Superclass must be a class.",
          stmt.name,
        );
      }
      superclass = superclassLiteral.value;
    }

    this.environment.define(stmt.name.lexeme, Literal.nil());
    if (superclass) {
      this.environment = new Environment(this.environment);
      // TODO: Spec should be used here to interpolate the user's keyword for "super"
      this.environment.define("super", Literal.callable(superclass));
    }
    const methods: Map<string, LangFunction> = new Map();
    for (const method of stmt.methods) {
      if (method instanceof Stmt.FunctionStmt) {
        // TODO: Spec should be used here to interpolate the user's keyword for "init"
        const func = new LangFunction(
          method,
          this.environment,
          method.name.lexeme === "init",
        );
        methods.set(method.name.lexeme, func);
      } else {
        throw LangError.runtimeError(
          "Only functions can be methods.",
          stmt.name,
        );
      }
    }

    const langClass = new LangClass(
      stmt.name.lexeme,
      methods,
      superclass || undefined,
    );
    if (superclass) {
      this.environment = this.environment.enclosing!;
    }
    this.environment.assign(stmt.name, Literal.callable(langClass));
  }
}
