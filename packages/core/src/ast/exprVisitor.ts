// import { Assign, Binary, Grouping, Literal, Unary, Variable, Logical, Call, Get, Set, This, SetIndexed, GetIndexed, ArrayExpr, Super } from "./expr";
import Expr from "./expr";

export abstract class ExprVisitor<T> {
  abstract visitAssignExpr(expr: Expr.Assign): T;
  abstract visitBinaryExpr(expr: Expr.Binary): T;
  abstract visitGroupingExpr(expr: Expr.Grouping): T;
  abstract visitLiteralExpr(expr: Expr.Literal): T;
  abstract visitUnaryExpr(expr: Expr.Unary): T;
  abstract visitVariableExpr(expr: Expr.Variable): T;
  abstract visitLogicalExpr(expr: Expr.Logical): T;
  abstract visitCallExpr(expr: Expr.Call): T;
  abstract visitGetExpr(expr: Expr.Get): T;
  abstract visitSetExpr(expr: Expr.Set): T;
  abstract visitThisExpr(expr: Expr.This): T;
  abstract visitSetIndexedExpr(expr: Expr.SetIndexed): T;
  abstract visitGetIndexedExpr(expr: Expr.GetIndexed): T;
  abstract visitArrayExpr(expr: Expr.ArrayExpr): T;
  abstract visitSuperExpr(expr: Expr.Super): T;
}
