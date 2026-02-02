import { Expr, ExprVisitor, Stmt, StmtVisitor } from "../ast";
import { LangError } from "../errors/error";
import { Token } from "../lex/token";
import { Interpreter } from "./interpreter";

enum FunctionType {
  Function,
  Method,
  Initializer,
}

enum ClassType {
  Class,
  Subclass,
}

export class Resolver
  implements ExprVisitor<void>, StmtVisitor<void>
{
  private interpreter: Interpreter;
  // TODO: Use a proper stack structure for scopes (linked list) instead of an array
  private scopes: Map<string, boolean>[] = [];
  private currentFunction: FunctionType | undefined;
  private currentClass: ClassType | undefined;

  constructor(interpreter: Interpreter) {
    this.interpreter = interpreter;
  }

  private beginScope() {
    this.scopes.push(new Map());
  }

  private endScope() {
    this.scopes.pop();
  }

  private peekScope() {
    return this.scopes[this.scopes.length - 1];
  }

  private scopeIsEmpty() {
    return this.scopes.length === 0;
  }

  private resolveStmt(stmt: Stmt.Statement) {
    stmt.accept(this);
  }

  private resolveExpr(expr: Expr.Expression) {
    expr.accept(this);
  }

  public resolveStmts(stmts: Stmt.Statement[]) {
    for (const stmt of stmts) {
      this.resolveStmt(stmt);
    }
  }

  private resolveFunction(
    stmt: Stmt.FunctionStmt,
    type: FunctionType,
  ) {
    const enclosingFunc = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (const param of stmt.params) {
      this.declare(param);
      this.define(param);
    }
    this.resolveStmts(stmt.body);
    this.endScope();
    this.currentFunction = enclosingFunc;
  }

  private declare(name: Token) {
    if (this.scopes.length === 0) return;
    const scope = this.peekScope()!;
    if (scope.has(name.lexeme)) {
      throw LangError.runtimeError(
        `Variable with name '${name.lexeme}' already declared in this scope.`,
        name,
      );
    }
    scope.set(name.lexeme, false);
  }

  private define(name: Token) {
    if (this.scopes.length === 0) return;
    const scope = this.peekScope()!;
    scope.set(name.lexeme, true);
  }

  private resolveLocalExpr(expr: Expr.Expression, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i]!.has(name.lexeme)) {
        this.interpreter.resolve(expr, this.scopes.length - 1 - i);
      }
    }
  }

  // Statement visitors
  visitBlockStmt(stmt: Stmt.Block): void {
    this.beginScope();
    this.resolveStmts(stmt.statements);
    this.endScope();
  }

  visitExpressionStmt(stmt: Stmt.Expression): void {
    this.resolveExpr(stmt.expression);
  }

  visitFunctionStmt(stmt: Stmt.FunctionStmt): void {
    this.declare(stmt.name);
    this.define(stmt.name);
    this.resolveFunction(stmt, FunctionType.Function);
  }

  visitIfStmt(stmt: Stmt.If): void {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.thenBranch);
    if (stmt.elseBranch) {
      this.resolveStmt(stmt.elseBranch);
    }
  }

  visitPrintStmt(stmt: Stmt.Print): void {
    this.resolveExpr(stmt.expression);
  }

  visitReturnStmt(stmt: Stmt.Return): void {
    if (this.currentFunction === undefined) {
      throw LangError.runtimeError(
        "Cannot return from top-level code.",
        stmt.keyword,
      );
    }

    if (stmt.value) {
      if (this.currentFunction === FunctionType.Initializer) {
        throw LangError.runtimeError(
          "Cannot return a value from an initializer.",
          stmt.keyword,
        );
      }
      this.resolveExpr(stmt.value);
    }
  }

  visitVarStmt(stmt: Stmt.Var): void {
    this.declare(stmt.name);
    if (stmt.initializer) {
      this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.name);
  }

  visitWhileStmt(stmt: Stmt.While): void {
    this.resolveExpr(stmt.condition);
    this.resolveStmt(stmt.body);
  }

  visitClassStmt(stmt: Stmt.Class): void {
    const enclosingClass = this.currentClass;
    this.currentClass = ClassType.Class;
    this.declare(stmt.name);
    this.define(stmt.name);
    if (stmt.superclass) {
      if (!(stmt.superclass instanceof Expr.Variable)) {
        throw LangError.runtimeError(
          "Superclass must be a class name.",
          stmt.name,
        );
      }
      if (stmt.name.lexeme === stmt.superclass.name.lexeme) {
        throw LangError.runtimeError(
          "A class cannot inherit from itself.",
          stmt.superclass.name,
        );
      }
      this.currentClass = ClassType.Subclass;
      this.resolveExpr(stmt.superclass);
      this.beginScope();
      // TODO: Spec should be used here to interpolate the user's keyword for "super"
      this.scopes[this.scopes.length - 1]!.set("super", true);
    }

    this.beginScope();
    this.scopes[this.scopes.length - 1]!.set("this", true);
    for (const method of stmt.methods) {
      let declaration = FunctionType.Method;
      if (!(method instanceof Stmt.FunctionStmt)) {
        // TODO: Spec should be used here to interpolate the user's keyword for "function"
        throw LangError.runtimeError(
          "Method must be a function declaration.",
          stmt.name,
        );
      }
      if (method.name.lexeme === "init") {
        declaration = FunctionType.Initializer;
      }
      this.resolveFunction(method, declaration);
    }
    this.endScope();
    if (stmt.superclass) {
      this.endScope();
    }
    this.currentClass = enclosingClass;
  }

  // Expression visitors
  visitAssignExpr(expr: Expr.Assign): void {
    this.resolveExpr(expr.value);
    this.resolveLocalExpr(expr, expr.name);
  }

  visitBinaryExpr(expr: Expr.Binary): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitCallExpr(expr: Expr.Call): void {
    this.resolveExpr(expr.callee);
    for (const arg of expr.args) {
      this.resolveExpr(arg);
    }
  }

  visitGroupingExpr(expr: Expr.Grouping): void {
    this.resolveExpr(expr.expression);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  visitLiteralExpr(_expr: Expr.LiteralExpr): void {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  visitArrayExpr(_expr: Expr.ArrayExpr): void {
    return;
  }

  visitLogicalExpr(expr: Expr.Logical): void {
    this.resolveExpr(expr.left);
    this.resolveExpr(expr.right);
  }

  visitUnaryExpr(expr: Expr.Unary): void {
    this.resolveExpr(expr.right);
  }

  visitVariableExpr(expr: Expr.Variable): void {
    if (
      !this.scopeIsEmpty() &&
      this.peekScope()!.has(expr.name.lexeme) &&
      this.peekScope()!.get(expr.name.lexeme) === false
    ) {
      throw LangError.runtimeError(
        `Cannot read local variable '${expr.name.lexeme}' in its own initializer.`,
        expr.name,
      );
    }
    this.resolveLocalExpr(expr, expr.name);
  }

  visitGetExpr(expr: Expr.Get): void {
    this.resolveExpr(expr.object);
  }

  visitSetExpr(expr: Expr.Set): void {
    this.resolveExpr(expr.value);
    this.resolveExpr(expr.object);
  }

  visitThisExpr(expr: Expr.This): void {
    if (this.currentClass === undefined) {
      // TODO: Spec should be used here to interpolate the user's keyword for "this"
      throw LangError.runtimeError(
        "Cannot use 'this' outside of a class.",
        expr.keyword,
      );
    }
    this.resolveLocalExpr(expr, expr.keyword);
  }

  visitSuperExpr(expr: Expr.Super): void {
    if (this.currentClass === undefined) {
      // TODO: Spec should be used here to interpolate the user's keyword for "super"
      throw LangError.runtimeError(
        "Cannot use 'super' outside of a class.",
        expr.keyword,
      );
    }

    if (this.currentClass !== ClassType.Subclass) {
      // TODO: Spec should be used here to interpolate the user's keyword for "super"
      throw LangError.runtimeError(
        "Cannot use 'super' in a class with no superclass.",
        expr.keyword,
      );
    }
    this.resolveLocalExpr(expr, expr.keyword);
  }

  visitGetIndexedExpr(expr: Expr.GetIndexed): void {
    this.resolveExpr(expr.object);
    this.resolveExpr(expr.index);
  }

  visitSetIndexedExpr(expr: Expr.SetIndexed): void {
    this.resolveExpr(expr.value);
    this.resolveExpr(expr.object);
    this.resolveExpr(expr.index);
  }
}
