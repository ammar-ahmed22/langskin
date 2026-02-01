import { Lexer } from "../src/lex/lexer";
import { ErrorReporter, LangError } from "../src/errors/reporter";
import { ErrorPhase } from "../src/errors/types";
import { Parser } from "../src/parse/parser";
import Expr from "../src/ast/expr";
import Stmt from "../src/ast/stmt";
import { describe, it, expect } from "vitest";
import { TokenType } from "../src/lex/token";

function parse(source: string): Stmt.Statement[] {
  const reporter = new ErrorReporter();
  const tokens = new Lexer(source, reporter).scanTokens();
  const parser = new Parser(tokens);
  return parser.parse();
}

function parseExpr(source: string): Expr.Expression {
  const stmts = parse(source + ";");
  const exprStmt = stmts[0] as Stmt.Expression;
  return exprStmt.expression;
}

function expectSyntaxError(source: string, expectedMessage?: string): LangError {
  try {
    parse(source);
    throw new Error("Expected syntax error but parsing succeeded");
  } catch (e) {
    expect(e).toBeInstanceOf(LangError);
    const error = e as LangError;
    expect(error.phase).toBe(ErrorPhase.Syntax);
    if (expectedMessage) {
      expect(error.message).toBe(expectedMessage);
    }
    return error;
  }
}

describe("Parser", () => {
  describe("literals and primary expressions", () => {
    it("should parse number literals", () => {
      const expr = parseExpr("42");
      expect(expr).toBeInstanceOf(Expr.Literal);
      expect((expr as Expr.Literal).value).toBe(42);
    });

    it("should parse floating point numbers", () => {
      const expr = parseExpr("3.14");
      expect(expr).toBeInstanceOf(Expr.Literal);
      expect((expr as Expr.Literal).value).toBe(3.14);
    });

    it("should parse string literals", () => {
      const expr = parseExpr('"hello"');
      expect(expr).toBeInstanceOf(Expr.Literal);
      expect((expr as Expr.Literal).value).toBe("hello");
    });

    it("should parse true", () => {
      const expr = parseExpr("true");
      expect(expr).toBeInstanceOf(Expr.Literal);
      expect((expr as Expr.Literal).value).toBe(true);
    });

    it("should parse false", () => {
      const expr = parseExpr("false");
      expect(expr).toBeInstanceOf(Expr.Literal);
      expect((expr as Expr.Literal).value).toBe(false);
    });

    it("should parse nil", () => {
      const expr = parseExpr("nil");
      expect(expr).toBeInstanceOf(Expr.Literal);
      expect((expr as Expr.Literal).value).toBe(null);
    });

    it("should parse identifiers", () => {
      const expr = parseExpr("foo");
      expect(expr).toBeInstanceOf(Expr.Variable);
      expect((expr as Expr.Variable).name.lexeme).toBe("foo");
    });

    it("should parse grouping expressions", () => {
      const expr = parseExpr("(42)");
      expect(expr).toBeInstanceOf(Expr.Grouping);
      const inner = (expr as Expr.Grouping).expression;
      expect(inner).toBeInstanceOf(Expr.Literal);
      expect((inner as Expr.Literal).value).toBe(42);
    });

    it("should parse empty array literals", () => {
      const expr = parseExpr("[]");
      expect(expr).toBeInstanceOf(Expr.ArrayExpr);
      expect((expr as Expr.ArrayExpr).values).toHaveLength(0);
    });

    it("should parse array literals with elements", () => {
      const expr = parseExpr("[1, 2, 3]");
      expect(expr).toBeInstanceOf(Expr.ArrayExpr);
      const arr = expr as Expr.ArrayExpr;
      expect(arr.values).toHaveLength(3);
      expect((arr.values[0] as Expr.Literal).value).toBe(1);
      expect((arr.values[1] as Expr.Literal).value).toBe(2);
      expect((arr.values[2] as Expr.Literal).value).toBe(3);
    });

    it("should parse nested arrays", () => {
      const expr = parseExpr("[[1, 2], [3, 4]]");
      expect(expr).toBeInstanceOf(Expr.ArrayExpr);
      const arr = expr as Expr.ArrayExpr;
      expect(arr.values).toHaveLength(2);
      expect(arr.values[0]).toBeInstanceOf(Expr.ArrayExpr);
    });
  });

  describe("unary operators", () => {
    it("should parse negation", () => {
      const expr = parseExpr("-42");
      expect(expr).toBeInstanceOf(Expr.Unary);
      const unary = expr as Expr.Unary;
      expect(unary.operator.type).toBe(TokenType.Minus);
      expect((unary.right as Expr.Literal).value).toBe(42);
    });

    it("should parse logical not with !", () => {
      const expr = parseExpr("!true");
      expect(expr).toBeInstanceOf(Expr.Unary);
      const unary = expr as Expr.Unary;
      expect(unary.operator.type).toBe(TokenType.Bang);
    });

    it("should parse logical not with 'not' keyword", () => {
      const expr = parseExpr("not false");
      expect(expr).toBeInstanceOf(Expr.Unary);
      const unary = expr as Expr.Unary;
      expect(unary.operator.type).toBe(TokenType.Bang);
    });

    it("should parse chained unary operators", () => {
      const expr = parseExpr("!!true");
      expect(expr).toBeInstanceOf(Expr.Unary);
      const outer = expr as Expr.Unary;
      expect(outer.right).toBeInstanceOf(Expr.Unary);
    });
  });

  describe("binary operators", () => {
    it("should parse addition", () => {
      const expr = parseExpr("1 + 2");
      expect(expr).toBeInstanceOf(Expr.Binary);
      const binary = expr as Expr.Binary;
      expect(binary.operator.type).toBe(TokenType.Plus);
      expect((binary.left as Expr.Literal).value).toBe(1);
      expect((binary.right as Expr.Literal).value).toBe(2);
    });

    it("should parse subtraction", () => {
      const expr = parseExpr("5 - 3");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.Minus);
    });

    it("should parse multiplication", () => {
      const expr = parseExpr("4 * 2");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.Star);
    });

    it("should parse division", () => {
      const expr = parseExpr("10 / 2");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.Slash);
    });

    it("should parse modulo", () => {
      const expr = parseExpr("10 % 3");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.Modulo);
    });

    it("should parse less than", () => {
      const expr = parseExpr("1 < 2");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.Less);
    });

    it("should parse less than or equal", () => {
      const expr = parseExpr("1 <= 2");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.LessEqual);
    });

    it("should parse greater than", () => {
      const expr = parseExpr("2 > 1");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.Greater);
    });

    it("should parse greater than or equal", () => {
      const expr = parseExpr("2 >= 1");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.GreaterEqual);
    });

    it("should parse equality", () => {
      const expr = parseExpr("1 == 1");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.EqualEqual);
    });

    it("should parse inequality", () => {
      const expr = parseExpr("1 != 2");
      expect(expr).toBeInstanceOf(Expr.Binary);
      expect((expr as Expr.Binary).operator.type).toBe(TokenType.BangEqual);
    });
  });

  describe("logical operators", () => {
    it("should parse 'and' keyword", () => {
      const expr = parseExpr("true and false");
      expect(expr).toBeInstanceOf(Expr.Logical);
      expect((expr as Expr.Logical).operator.type).toBe(TokenType.And);
    });

    it("should parse && operator", () => {
      const expr = parseExpr("true && false");
      expect(expr).toBeInstanceOf(Expr.Logical);
      expect((expr as Expr.Logical).operator.type).toBe(TokenType.And);
    });

    it("should parse 'or' keyword", () => {
      const expr = parseExpr("true or false");
      expect(expr).toBeInstanceOf(Expr.Logical);
      expect((expr as Expr.Logical).operator.type).toBe(TokenType.Or);
    });

    it("should parse || operator", () => {
      const expr = parseExpr("true || false");
      expect(expr).toBeInstanceOf(Expr.Logical);
      expect((expr as Expr.Logical).operator.type).toBe(TokenType.Or);
    });

    it("should have correct precedence for and/or", () => {
      // a or b and c should parse as a or (b and c)
      const expr = parseExpr("a or b and c");
      expect(expr).toBeInstanceOf(Expr.Logical);
      const logical = expr as Expr.Logical;
      expect(logical.operator.type).toBe(TokenType.Or);
      expect(logical.right).toBeInstanceOf(Expr.Logical);
      expect((logical.right as Expr.Logical).operator.type).toBe(TokenType.And);
    });
  });

  describe("operator precedence", () => {
    it("should respect multiplication over addition", () => {
      // 1 + 2 * 3 should parse as 1 + (2 * 3)
      const expr = parseExpr("1 + 2 * 3");
      expect(expr).toBeInstanceOf(Expr.Binary);
      const binary = expr as Expr.Binary;
      expect(binary.operator.type).toBe(TokenType.Plus);
      expect(binary.right).toBeInstanceOf(Expr.Binary);
      expect((binary.right as Expr.Binary).operator.type).toBe(TokenType.Star);
    });

    it("should respect comparison over equality", () => {
      // 1 < 2 == true should parse as (1 < 2) == true
      const expr = parseExpr("1 < 2 == true");
      expect(expr).toBeInstanceOf(Expr.Binary);
      const binary = expr as Expr.Binary;
      expect(binary.operator.type).toBe(TokenType.EqualEqual);
      expect(binary.left).toBeInstanceOf(Expr.Binary);
    });

    it("should respect parentheses", () => {
      // (1 + 2) * 3 should have addition at top
      const expr = parseExpr("(1 + 2) * 3");
      expect(expr).toBeInstanceOf(Expr.Binary);
      const binary = expr as Expr.Binary;
      expect(binary.operator.type).toBe(TokenType.Star);
      expect(binary.left).toBeInstanceOf(Expr.Grouping);
    });
  });

  describe("assignment", () => {
    it("should parse simple assignment", () => {
      const expr = parseExpr("x = 42");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.name.lexeme).toBe("x");
      expect((assign.value as Expr.Literal).value).toBe(42);
    });

    it("should parse chained assignment", () => {
      const expr = parseExpr("a = b = 1");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.name.lexeme).toBe("a");
      expect(assign.value).toBeInstanceOf(Expr.Assign);
    });

    it("should parse += compound assignment", () => {
      const expr = parseExpr("x += 1");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.value).toBeInstanceOf(Expr.Binary);
      expect((assign.value as Expr.Binary).operator.type).toBe(TokenType.Plus);
    });

    it("should parse -= compound assignment", () => {
      const expr = parseExpr("x -= 1");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.value).toBeInstanceOf(Expr.Binary);
      expect((assign.value as Expr.Binary).operator.type).toBe(TokenType.Minus);
    });

    it("should parse *= compound assignment", () => {
      const expr = parseExpr("x *= 2");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.value).toBeInstanceOf(Expr.Binary);
      expect((assign.value as Expr.Binary).operator.type).toBe(TokenType.Star);
    });

    it("should parse /= compound assignment", () => {
      const expr = parseExpr("x /= 2");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.value).toBeInstanceOf(Expr.Binary);
      expect((assign.value as Expr.Binary).operator.type).toBe(TokenType.Slash);
    });

    it("should parse ++ increment", () => {
      const expr = parseExpr("x++");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.value).toBeInstanceOf(Expr.Binary);
      const binary = assign.value as Expr.Binary;
      expect(binary.operator.type).toBe(TokenType.Plus);
      expect((binary.right as Expr.Literal).value).toBe(1);
    });

    it("should parse -- decrement", () => {
      const expr = parseExpr("x--");
      expect(expr).toBeInstanceOf(Expr.Assign);
      const assign = expr as Expr.Assign;
      expect(assign.value).toBeInstanceOf(Expr.Binary);
      const binary = assign.value as Expr.Binary;
      expect(binary.operator.type).toBe(TokenType.Minus);
    });

    it("should parse property assignment", () => {
      const expr = parseExpr("obj.prop = 42");
      expect(expr).toBeInstanceOf(Expr.Set);
      const set = expr as Expr.Set;
      expect(set.name.lexeme).toBe("prop");
      expect((set.value as Expr.Literal).value).toBe(42);
    });

    it("should parse indexed assignment", () => {
      const expr = parseExpr("arr[0] = 42");
      expect(expr).toBeInstanceOf(Expr.SetIndexed);
      const set = expr as Expr.SetIndexed;
      expect((set.index as Expr.Literal).value).toBe(0);
      expect((set.value as Expr.Literal).value).toBe(42);
    });

    it("should parse compound assignment on property", () => {
      const expr = parseExpr("obj.x += 1");
      expect(expr).toBeInstanceOf(Expr.Set);
      const set = expr as Expr.Set;
      expect(set.value).toBeInstanceOf(Expr.Binary);
    });

    it("should parse increment on indexed", () => {
      const expr = parseExpr("arr[0]++");
      expect(expr).toBeInstanceOf(Expr.SetIndexed);
    });

    it("should error on invalid assignment target", () => {
      expectSyntaxError("1 + 2 = 3", "Invalid assignment target.");
    });
  });

  describe("variable declarations", () => {
    it("should parse uninitialized variable", () => {
      const stmts = parse("let x;");
      expect(stmts).toHaveLength(1);
      expect(stmts[0]).toBeInstanceOf(Stmt.Var);
      const varStmt = stmts[0] as Stmt.Var;
      expect(varStmt.name.lexeme).toBe("x");
      expect(varStmt.initializer).toBeNull();
    });

    it("should parse initialized variable", () => {
      const stmts = parse("let x = 42;");
      expect(stmts).toHaveLength(1);
      const varStmt = stmts[0] as Stmt.Var;
      expect(varStmt.name.lexeme).toBe("x");
      expect(varStmt.initializer).toBeInstanceOf(Expr.Literal);
      expect((varStmt.initializer as Expr.Literal).value).toBe(42);
    });

    it("should parse variable with expression initializer", () => {
      const stmts = parse("let x = 1 + 2;");
      const varStmt = stmts[0] as Stmt.Var;
      expect(varStmt.initializer).toBeInstanceOf(Expr.Binary);
    });

    it("should error on missing variable name", () => {
      expectSyntaxError("let = 42;", "Expect variable name.");
    });

    it("should error on missing semicolon after variable", () => {
      expectSyntaxError("let x = 42", "Expect ';' after variable declaration.");
    });
  });

  describe("if statements", () => {
    it("should parse simple if", () => {
      const stmts = parse("if (true) print 1;");
      expect(stmts[0]).toBeInstanceOf(Stmt.If);
      const ifStmt = stmts[0] as Stmt.If;
      expect(ifStmt.condition).toBeInstanceOf(Expr.Literal);
      expect(ifStmt.thenBranch).toBeInstanceOf(Stmt.Print);
      expect(ifStmt.elseBranch).toBeNull();
    });

    it("should parse if-else", () => {
      const stmts = parse("if (true) print 1; else print 2;");
      const ifStmt = stmts[0] as Stmt.If;
      expect(ifStmt.elseBranch).toBeInstanceOf(Stmt.Print);
    });

    it("should parse if with block body", () => {
      const stmts = parse("if (x) { print 1; print 2; }");
      const ifStmt = stmts[0] as Stmt.If;
      expect(ifStmt.thenBranch).toBeInstanceOf(Stmt.Block);
    });

    it("should parse nested if-else (dangling else)", () => {
      const stmts = parse("if (a) if (b) print 1; else print 2;");
      const outer = stmts[0] as Stmt.If;
      expect(outer.elseBranch).toBeNull();
      const inner = outer.thenBranch as Stmt.If;
      expect(inner.elseBranch).toBeInstanceOf(Stmt.Print);
    });

    it("should error on missing ( after if", () => {
      expectSyntaxError("if true) print 1;", "Expect '(' after 'if'");
    });

    it("should error on missing ) after if condition", () => {
      expectSyntaxError("if (true print 1;", "Expect ')' after 'if' condition.");
    });
  });

  describe("while statements", () => {
    it("should parse while loop", () => {
      const stmts = parse("while (true) print 1;");
      expect(stmts[0]).toBeInstanceOf(Stmt.While);
      const whileStmt = stmts[0] as Stmt.While;
      expect(whileStmt.condition).toBeInstanceOf(Expr.Literal);
      expect(whileStmt.body).toBeInstanceOf(Stmt.Print);
    });

    it("should parse while with block body", () => {
      const stmts = parse("while (x < 10) { x = x + 1; }");
      const whileStmt = stmts[0] as Stmt.While;
      expect(whileStmt.body).toBeInstanceOf(Stmt.Block);
    });

    it("should error on missing ( after while", () => {
      expectSyntaxError("while true) print 1;", "Expect '(' after 'while'");
    });
  });

  describe("for statements", () => {
    it("should parse full for loop", () => {
      const stmts = parse("for (let i = 0; i < 10; i++) print i;");
      // For is desugared to while
      expect(stmts[0]).toBeInstanceOf(Stmt.Block);
    });

    it("should parse for with no initializer", () => {
      const stmts = parse("for (; i < 10; i++) print i;");
      expect(stmts[0]).toBeInstanceOf(Stmt.While);
    });

    it("should parse for with no condition", () => {
      const stmts = parse("for (let i = 0;; i++) print i;");
      // Should create infinite loop (condition = true)
      expect(stmts[0]).toBeInstanceOf(Stmt.Block);
    });

    it("should parse for with no increment", () => {
      const stmts = parse("for (let i = 0; i < 10;) print i;");
      expect(stmts[0]).toBeInstanceOf(Stmt.Block);
    });

    it("should parse for with expression initializer", () => {
      const stmts = parse("for (i = 0; i < 10; i++) print i;");
      expect(stmts[0]).toBeInstanceOf(Stmt.Block);
    });

    it("should parse empty for loop", () => {
      const stmts = parse("for (;;) print 1;");
      expect(stmts[0]).toBeInstanceOf(Stmt.While);
    });

    it("should error on missing ( after for", () => {
      expectSyntaxError("for let i = 0; i < 10; i++) print i;", "Expect '(' after 'for'");
    });
  });

  describe("function declarations", () => {
    it("should parse function with no parameters", () => {
      const stmts = parse("fun greet() { print 1; }");
      expect(stmts[0]).toBeInstanceOf(Stmt.FunctionStmt);
      const fn = stmts[0] as Stmt.FunctionStmt;
      expect(fn.name.lexeme).toBe("greet");
      expect(fn.params).toHaveLength(0);
      expect(fn.body).toHaveLength(1);
    });

    it("should parse function with one parameter", () => {
      const stmts = parse("fun greet(name) { print name; }");
      const fn = stmts[0] as Stmt.FunctionStmt;
      expect(fn.params).toHaveLength(1);
      expect(fn.params[0].lexeme).toBe("name");
    });

    it("should parse function with multiple parameters", () => {
      const stmts = parse("fun add(a, b, c) { return a + b + c; }");
      const fn = stmts[0] as Stmt.FunctionStmt;
      expect(fn.params).toHaveLength(3);
      expect(fn.params[0].lexeme).toBe("a");
      expect(fn.params[1].lexeme).toBe("b");
      expect(fn.params[2].lexeme).toBe("c");
    });

    it("should parse empty function body", () => {
      const stmts = parse("fun empty() {}");
      const fn = stmts[0] as Stmt.FunctionStmt;
      expect(fn.body).toHaveLength(0);
    });

    it("should error on missing function name", () => {
      expectSyntaxError("fun () {}", "Expect function name.");
    });

    it("should error on missing ( after function name", () => {
      expectSyntaxError("fun foo {}", "Expect '(' after function name.");
    });

    it("should error on missing ) after parameters", () => {
      expectSyntaxError("fun foo(a, b {}", "Expect ')' after parameters.");
    });

    it("should error on too many parameters", () => {
      const params = Array.from({ length: 256 }, (_, i) => `p${i}`).join(", ");
      expectSyntaxError(`fun foo(${params}) {}`, "Can't have more than 255 parameters.");
    });
  });

  describe("return statements", () => {
    it("should parse return without value", () => {
      const stmts = parse("return;");
      expect(stmts[0]).toBeInstanceOf(Stmt.Return);
      const ret = stmts[0] as Stmt.Return;
      expect(ret.value).toBeNull();
    });

    it("should parse return with value", () => {
      const stmts = parse("return 42;");
      const ret = stmts[0] as Stmt.Return;
      expect(ret.value).toBeInstanceOf(Expr.Literal);
      expect((ret.value as Expr.Literal).value).toBe(42);
    });

    it("should parse return with expression", () => {
      const stmts = parse("return a + b;");
      const ret = stmts[0] as Stmt.Return;
      expect(ret.value).toBeInstanceOf(Expr.Binary);
    });

    it("should error on missing semicolon after return", () => {
      expectSyntaxError("return 42", "Expect ';' after 'return' value");
    });
  });

  describe("class declarations", () => {
    it("should parse empty class", () => {
      const stmts = parse("class Foo {}");
      expect(stmts[0]).toBeInstanceOf(Stmt.Class);
      const cls = stmts[0] as Stmt.Class;
      expect(cls.name.lexeme).toBe("Foo");
      expect(cls.methods).toHaveLength(0);
      expect(cls.superclass).toBeNull();
    });

    it("should parse class with methods", () => {
      const stmts = parse("class Foo { bar() { return 1; } baz(x) { return x; } }");
      const cls = stmts[0] as Stmt.Class;
      expect(cls.methods).toHaveLength(2);
    });

    it("should parse class with inheritance", () => {
      const stmts = parse("class Child inherits Parent {}");
      const cls = stmts[0] as Stmt.Class;
      expect(cls.superclass).toBeInstanceOf(Expr.Variable);
      expect((cls.superclass as Expr.Variable).name.lexeme).toBe("Parent");
    });

    it("should error on missing class name", () => {
      expectSyntaxError("class {}", "Expect 'class' name");
    });

    it("should error on missing { before class body", () => {
      expectSyntaxError("class Foo }", "Expect '{' before 'class' body.");
    });
  });

  describe("this and super", () => {
    it("should parse this expression", () => {
      const expr = parseExpr("this");
      expect(expr).toBeInstanceOf(Expr.This);
    });

    it("should parse this property access", () => {
      const expr = parseExpr("this.x");
      expect(expr).toBeInstanceOf(Expr.Get);
      const get = expr as Expr.Get;
      expect(get.object).toBeInstanceOf(Expr.This);
    });

    it("should parse super method access", () => {
      const expr = parseExpr("super.method");
      expect(expr).toBeInstanceOf(Expr.Super);
      const sup = expr as Expr.Super;
      expect(sup.method.lexeme).toBe("method");
    });

    it("should error on super without dot", () => {
      expectSyntaxError("super;", "Expect '.' after 'super'");
    });
  });

  describe("function calls", () => {
    it("should parse call with no arguments", () => {
      const expr = parseExpr("foo()");
      expect(expr).toBeInstanceOf(Expr.Call);
      const call = expr as Expr.Call;
      expect((call.callee as Expr.Variable).name.lexeme).toBe("foo");
      expect(call.args).toHaveLength(0);
    });

    it("should parse call with one argument", () => {
      const expr = parseExpr("foo(1)");
      const call = expr as Expr.Call;
      expect(call.args).toHaveLength(1);
    });

    it("should parse call with multiple arguments", () => {
      const expr = parseExpr("foo(1, 2, 3)");
      const call = expr as Expr.Call;
      expect(call.args).toHaveLength(3);
    });

    it("should parse call with expression arguments", () => {
      const expr = parseExpr("foo(1 + 2, a && b)");
      const call = expr as Expr.Call;
      expect(call.args[0]).toBeInstanceOf(Expr.Binary);
      expect(call.args[1]).toBeInstanceOf(Expr.Logical);
    });

    it("should parse chained calls", () => {
      const expr = parseExpr("foo()()");
      expect(expr).toBeInstanceOf(Expr.Call);
      const outer = expr as Expr.Call;
      expect(outer.callee).toBeInstanceOf(Expr.Call);
    });

    it("should error on too many arguments", () => {
      const args = Array.from({ length: 256 }, (_, i) => i).join(", ");
      expectSyntaxError(`foo(${args});`, "Can't have more than 255 arguments.");
    });

    it("should error on missing ) after arguments", () => {
      expectSyntaxError("foo(1, 2;", "Expect ')' after arguments.");
    });
  });

  describe("property access", () => {
    it("should parse property get", () => {
      const expr = parseExpr("obj.prop");
      expect(expr).toBeInstanceOf(Expr.Get);
      const get = expr as Expr.Get;
      expect((get.object as Expr.Variable).name.lexeme).toBe("obj");
      expect(get.name.lexeme).toBe("prop");
    });

    it("should parse chained property access", () => {
      const expr = parseExpr("a.b.c");
      expect(expr).toBeInstanceOf(Expr.Get);
      const outer = expr as Expr.Get;
      expect(outer.name.lexeme).toBe("c");
      expect(outer.object).toBeInstanceOf(Expr.Get);
    });

    it("should parse method call", () => {
      const expr = parseExpr("obj.method()");
      expect(expr).toBeInstanceOf(Expr.Call);
      const call = expr as Expr.Call;
      expect(call.callee).toBeInstanceOf(Expr.Get);
    });

    it("should error on missing property name after dot", () => {
      expectSyntaxError("obj.;", "Expect property name after '.'");
    });
  });

  describe("indexed access", () => {
    it("should parse indexed get", () => {
      const expr = parseExpr("arr[0]");
      expect(expr).toBeInstanceOf(Expr.GetIndexed);
      const get = expr as Expr.GetIndexed;
      expect((get.object as Expr.Variable).name.lexeme).toBe("arr");
      expect((get.index as Expr.Literal).value).toBe(0);
    });

    it("should parse indexed with variable", () => {
      const expr = parseExpr("arr[i]");
      expect(expr).toBeInstanceOf(Expr.GetIndexed);
      const get = expr as Expr.GetIndexed;
      expect(get.index).toBeInstanceOf(Expr.Variable);
    });

    it("should parse chained indexed access", () => {
      const expr = parseExpr("arr[0][1]");
      expect(expr).toBeInstanceOf(Expr.GetIndexed);
      const outer = expr as Expr.GetIndexed;
      expect(outer.object).toBeInstanceOf(Expr.GetIndexed);
    });

    it("should parse mixed property and indexed access", () => {
      const expr = parseExpr("obj.arr[0].prop");
      expect(expr).toBeInstanceOf(Expr.Get);
    });

    it("should error on missing ] after index", () => {
      expectSyntaxError("arr[0;", "Expect ']' after index.");
    });
  });

  describe("blocks", () => {
    it("should parse empty block", () => {
      const stmts = parse("{}");
      expect(stmts[0]).toBeInstanceOf(Stmt.Block);
      expect((stmts[0] as Stmt.Block).statements).toHaveLength(0);
    });

    it("should parse block with statements", () => {
      const stmts = parse("{ let x = 1; print x; }");
      const block = stmts[0] as Stmt.Block;
      expect(block.statements).toHaveLength(2);
    });

    it("should parse nested blocks", () => {
      const stmts = parse("{ { { print 1; } } }");
      const outer = stmts[0] as Stmt.Block;
      expect(outer.statements[0]).toBeInstanceOf(Stmt.Block);
    });

    it("should error on missing } after block", () => {
      expectSyntaxError("{ let x = 1;", "Expect '}' after block.");
    });
  });

  describe("print statements", () => {
    it("should parse print statement", () => {
      const stmts = parse("print 42;");
      expect(stmts[0]).toBeInstanceOf(Stmt.Print);
      const print = stmts[0] as Stmt.Print;
      expect(print.expression).toBeInstanceOf(Expr.Literal);
    });

    it("should parse print with expression", () => {
      const stmts = parse("print 1 + 2;");
      const print = stmts[0] as Stmt.Print;
      expect(print.expression).toBeInstanceOf(Expr.Binary);
    });

    it("should error on missing semicolon after print", () => {
      expectSyntaxError("print 42", "Expect ';' after value.");
    });
  });

  describe("expression statements", () => {
    it("should parse expression statement", () => {
      const stmts = parse("42;");
      expect(stmts[0]).toBeInstanceOf(Stmt.Expression);
    });

    it("should parse function call as statement", () => {
      const stmts = parse("foo();");
      expect(stmts[0]).toBeInstanceOf(Stmt.Expression);
      const exprStmt = stmts[0] as Stmt.Expression;
      expect(exprStmt.expression).toBeInstanceOf(Expr.Call);
    });

    it("should error on missing semicolon after expression", () => {
      expectSyntaxError("42", "Expect ';' after expression.");
    });
  });

  describe("syntax errors", () => {
    it("should include line number in error", () => {
      const error = expectSyntaxError("let x = 42");
      expect(error.line).toBe(1);
    });

    it("should include column in error", () => {
      const error = expectSyntaxError("let x = 42");
      expect(typeof error.column).toBe("number");
    });

    it("should error on unexpected token at start", () => {
      expectSyntaxError(")");
    });

    it("should error on incomplete expression", () => {
      expectSyntaxError("1 +;");
    });
  });

  describe("multiple statements", () => {
    it("should parse multiple statements", () => {
      const stmts = parse("let x = 1; let y = 2; print x + y;");
      expect(stmts).toHaveLength(3);
    });

    it("should parse program with functions and classes", () => {
      const stmts = parse(`
        class Animal {
          speak() { print "..."; }
        }
        
        fun greet(name) {
          print name;
        }
        
        let x = 42;
      `);
      expect(stmts).toHaveLength(3);
      expect(stmts[0]).toBeInstanceOf(Stmt.Class);
      expect(stmts[1]).toBeInstanceOf(Stmt.FunctionStmt);
      expect(stmts[2]).toBeInstanceOf(Stmt.Var);
    });
  });
});
