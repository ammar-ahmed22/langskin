// import { Expression, Print, Var, Block, If, While, FunctionStmt, Return, Class } from "./stmt";
import Stmt from "./stmt";

export abstract class StmtVisitor<T> {
  abstract visitExpressionStmt(stmt: Stmt.Expression): T;
  abstract visitPrintStmt(stmt: Stmt.Print): T;
  abstract visitVarStmt(stmt: Stmt.Var): T;
  abstract visitBlockStmt(stmt: Stmt.Block): T;
  abstract visitIfStmt(stmt: Stmt.If): T;
  abstract visitWhileStmt(stmt: Stmt.While): T;
  abstract visitFunctionStmt(stmt: Stmt.FunctionStmt): T;
  abstract visitReturnStmt(stmt: Stmt.Return): T;
  abstract visitClassStmt(stmt: Stmt.Class): T;
  
}
