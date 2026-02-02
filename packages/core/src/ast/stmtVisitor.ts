import { Stmt } from ".";

export interface StmtVisitor<T> {
  visitExpressionStmt(stmt: Stmt.Expression): T;
  visitPrintStmt(stmt: Stmt.Print): T;
  visitVarStmt(stmt: Stmt.Var): T;
  visitBlockStmt(stmt: Stmt.Block): T;
  visitIfStmt(stmt: Stmt.If): T;
  visitWhileStmt(stmt: Stmt.While): T;
  visitFunctionStmt(stmt: Stmt.FunctionStmt): T;
  visitReturnStmt(stmt: Stmt.Return): T;
  visitClassStmt(stmt: Stmt.Class): T;
}
