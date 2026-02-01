import { StmtVisitor } from "./stmtVisitor";
import Expr from "./expr";
import { Token } from "../lex/token";

namespace Stmt {
  export abstract class Statement {
    abstract accept<T>(visitor: StmtVisitor<T>): T;
  }

  export class Expression extends Statement {
    constructor(
      public expression: Expr.Expression
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitExpressionStmt(this);
    }
  }

  export class Print extends Statement {
    constructor(
      public expression: Expr.Expression
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitPrintStmt(this);
    }
  }

  export class Var extends Statement {
    constructor(
      public name: Token,
      public initializer: Expr.Expression | null
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitVarStmt(this);
    }
  }

  export class Block extends Statement {
    constructor(
      public statements: Statement[]
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitBlockStmt(this);
    }
  }

  export class If extends Statement {
    constructor(
      public condition: Expr.Expression,
      public thenBranch: Statement,
      public elseBranch: Statement | null
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitIfStmt(this);
    }
  }

  export class While extends Statement {
    constructor(
      public condition: Expr.Expression,
      public body: Statement
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitWhileStmt(this);
    }
  }

  export class FunctionStmt extends Statement {
    constructor(
      public name: Token,
      public params: Token[],
      public body: Statement[]
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitFunctionStmt(this);
    }
  }

  export class Return extends Statement {
    constructor(
      public keyword: Token,
      public value: Expr.Expression | null
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitReturnStmt(this);
    }
  }

  export class Class extends Statement {
    constructor(
      public name: Token,
      public methods: Statement[],
      public superclass: Expr.Expression | null
    ) {
      super();
    }

    accept<T>(visitor: StmtVisitor<T>): T {
      return visitor.visitClassStmt(this);
    }
  }
}

export default Stmt;
