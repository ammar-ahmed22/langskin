import { Expr } from ".";

export interface ExprVisitor<T> {
  visitAssignExpr(expr: Expr.Assign): T;
  visitBinaryExpr(expr: Expr.Binary): T;
  visitGroupingExpr(expr: Expr.Grouping): T;
  visitLiteralExpr(expr: Expr.LiteralExpr): T;
  visitUnaryExpr(expr: Expr.Unary): T;
  visitVariableExpr(expr: Expr.Variable): T;
  visitLogicalExpr(expr: Expr.Logical): T;
  visitCallExpr(expr: Expr.Call): T;
  visitGetExpr(expr: Expr.Get): T;
  visitSetExpr(expr: Expr.Set): T;
  visitThisExpr(expr: Expr.This): T;
  visitSetIndexedExpr(expr: Expr.SetIndexed): T;
  visitGetIndexedExpr(expr: Expr.GetIndexed): T;
  visitArrayExpr(expr: Expr.ArrayExpr): T;
  visitSuperExpr(expr: Expr.Super): T;
}
