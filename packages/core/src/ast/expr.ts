import { Token } from "../lex/token";
import { Literal } from "../runtime/literal";
import { ExprVisitor } from "./exprVisitor";

export abstract class Expression {
  abstract accept<T>(visitor: ExprVisitor<T>): T;
}

export class Assign extends Expression {
  constructor(
    public name: Token,
    public value: Expression,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

export class Binary extends Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping extends Expression {
  constructor(public expression: Expression) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class LiteralExpr extends Expression {
  constructor(public value: Literal) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary extends Expression {
  constructor(
    public operator: Token,
    public right: Expression,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable extends Expression {
  constructor(public name: Token) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}

export class Logical extends Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }
}

export class Call extends Expression {
  constructor(
    public callee: Expression,
    public paren: Token,
    public args: Expression[],
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}

export class Get extends Expression {
  constructor(
    public object: Expression,
    public name: Token,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetExpr(this);
  }
}

export class Set extends Expression {
  constructor(
    public object: Expression,
    public name: Token,
    public value: Expression,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetExpr(this);
  }
}

export class This extends Expression {
  constructor(public keyword: Token) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitThisExpr(this);
  }
}

export class Super extends Expression {
  constructor(
    public keyword: Token,
    public method: Token,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSuperExpr(this);
  }
}

export class ArrayExpr extends Expression {
  constructor(public values: Expression[]) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitArrayExpr(this);
  }
}

export class GetIndexed extends Expression {
  constructor(
    public object: Expression,
    public index: Expression,
    public bracket: Token,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetIndexedExpr(this);
  }
}

export class SetIndexed extends Expression {
  constructor(
    public object: Expression,
    public index: Expression,
    public value: Expression,
    public bracket: Token,
  ) {
    super();
  }

  accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSetIndexedExpr(this);
  }
}
