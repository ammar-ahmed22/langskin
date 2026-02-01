import Expr from "../ast/expr";
import Stmt from "../ast/stmt";
import { LangError } from "../errors/reporter";
import { Token, TokenType } from "../lex/token";


export class Parser {
  private tokens: Token[];
  private current: number = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Stmt.Statement[] {
    const statements: Stmt.Statement[] = [];

    while (!this.end()) {
      statements.push(this.declaration());
    }

    return statements;
  }

  private end(): boolean {
    return this.peek().type === TokenType.Eof;
  }

  private peek(): Token {
    return this.tokens[this.current]!;
  }

  private previous(): Token {
    return this.tokens[this.current - 1]!;
  }

  private advance(): Token {
    if (!this.end()) this.current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.end()) return false;
    return this.peek().type === type;
  }

  private matchTypes(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw LangError.syntaxError(message, this.peek());
  }

  private declaration(): Stmt.Statement {
    try {
      let res: Stmt.Statement;
      if (this.matchTypes(TokenType.Class)) {
        res = this.classDeclaration();
      } else if (this.matchTypes(TokenType.Fun)) {
        res = this.functionDeclaration("function");
      } else if (this.matchTypes(TokenType.Var)) {
        res = this.varDeclaration();
      } else {
        res = this.statement();
      }
      return res;
    } catch (error: unknown) {
      if (error instanceof LangError) {
        this.synchronize();
      }
      throw error;
    }
  }

  private synchronize(): void {
    this.advance();
    while (!this.end()) {
      if (this.previous().type === TokenType.Semicolon) return;
    
      switch (this.peek().type) {
        case TokenType.Class:
        case TokenType.Fun:
        case TokenType.Var:
        case TokenType.For:
        case TokenType.If:
        case TokenType.While:
        case TokenType.Print:
        case TokenType.Return:
          return;
        default:
          break;
      }
      this.advance();
    }
  }

  private functionDeclaration(kind: string): Stmt.Statement {
    // TODO: Spec should be used here to interpolate what the user's keyword for 'function/method' is
    let name = this.consume(TokenType.Identifier, `Expect ${kind} name.`);
    this.consume(TokenType.LeftParen, `Expect '(' after ${kind} name.`);
    let params: Token[] = [];
    if (!this.check(TokenType.RightParen)) {
      while (true) {
        if (params.length >= 255) {
          throw LangError.syntaxError("Can't have more than 255 parameters.", this.peek());
        }
        params.push(this.consume(TokenType.Identifier, "Expect parameter name."));
        if (!this.matchTypes(TokenType.Comma)) break;
      }
    }

    this.consume(TokenType.RightParen, "Expect ')' after parameters.");
    this.consume(TokenType.LeftBrace, `Expect '{' before ${kind} body.`);
    let body = this.block();
    return new Stmt.FunctionStmt(name, params, body);
  }

  private classDeclaration(): Stmt.Statement {
    // TODO: Spec should be used here to interpolate what the user's keyword for 'class' is
    let name = this.consume(TokenType.Identifier, "Expect 'class' name");

    let superclass = null;
    if (this.matchTypes(TokenType.Inherits)) {
      // TODO: Spec should be used here to interpolate what the user's keyword for 'class' is
      this.consume(TokenType.Identifier, "Expect parent 'class' name");
      superclass = new Expr.Variable(this.previous());
    }

    // TODO: Spec should be used here to interpolate what the user's keyword for 'class' is
    this.consume(TokenType.LeftBrace, "Expect '{' before 'class' body.");

    let methods: Stmt.Statement[] = [];
    while (!this.check(TokenType.RightBrace) && !this.end()) {
      methods.push(this.functionDeclaration("method"));
    }

    // TODO: Spec should be used here to interpolate what the user's keyword for 'class' is
    this.consume(TokenType.RightBrace, "Expect '}' after 'class' body.");

    return new Stmt.Class(name, methods, superclass);
  }

  private statement(): Stmt.Statement {
    // TODO: Other statement types with higher precedence
    if (this.matchTypes(TokenType.For)) {
      return this.forStatement();
    }

    if (this.matchTypes(TokenType.If)) {
      return this.ifStatement();
    }

    if (this.matchTypes(TokenType.Print)) {
      return this.printStatement();
    }

    if (this.matchTypes(TokenType.Return)) {
      return this.returnStatement();
    }

    if (this.matchTypes(TokenType.While)) {
      return this.whileStatement();
    }

    if (this.matchTypes(TokenType.LeftBrace)) {
      return new Stmt.Block(this.block());
    }
 
    return this.expressionStatement();
  }

  private whileStatement(): Stmt.Statement {
    // TODO: Spec should be used here to interpolate what the user's keyword for 'while' is
    this.consume(TokenType.LeftParen, "Expect '(' after 'while'");
    let condition = this.expression();
    // TODO: Spec should be used here to interpolate what the user's keyword for 'while' is
    this.consume(TokenType.RightParen, "Expect ')' after 'while' condition.");
    let body = this.statement();
    return new Stmt.While(condition, body);
  }

  private returnStatement(): Stmt.Statement {
    let keyword = this.previous();
    let value = null;
    if (!this.check(TokenType.Semicolon)) {
      value = this.expression();
    }

    // TODO: Spec should be used here to interpolate what the user's keyword for 'return' is
    this.consume(TokenType.Semicolon, "Expect ';' after 'return' value");

    return new Stmt.Return(keyword, value);
  }

  private printStatement(): Stmt.Statement {
    let value = this.expression();
    this.consume(TokenType.Semicolon, "Expect ';' after value.");
    return new Stmt.Print(value);
  }

  private ifStatement(): Stmt.Statement {
    // TODO: Spec should be used here to interpolate what the user's keyword for 'if' is
    this.consume(TokenType.LeftParen, "Expect '(' after 'if'");

    let condition = this.expression();
    // TODO: Spec should be used here to interpolate what the user's keyword for 'if' is
    this.consume(TokenType.RightParen, "Expect ')' after 'if' condition.");
    let then = this.statement();
    let elseBranch = null;
    if (this.matchTypes(TokenType.Else)) {
      elseBranch = this.statement();
    }

    return new Stmt.If(condition, then, elseBranch);
  }

  private forStatement(): Stmt.Statement {
    // TODO: Spec should be used here to interpolate what the user's keyword for 'for' is
    this.consume(TokenType.LeftParen, "Expect '(' after 'for'");
    let initializer: Stmt.Statement | null;
    if (this.matchTypes(TokenType.Semicolon)) {
      initializer = null;
    } else if (this.matchTypes(TokenType.Var)) {
      initializer = this.varDeclaration();
    } else {
      initializer = this.expressionStatement();
    }

    let condition = null;
    if (!this.check(TokenType.Semicolon)) {
      condition = this.expression();
    }

    // TODO: Spec should be used here to interpolate what the user's keyword for 'for' is
    this.consume(TokenType.Semicolon, "Expect ';' after 'for' condition.");
    let increment = null;
    if (!this.check(TokenType.RightParen)) {
      increment = this.expression();
    }

    // TODO: Spec should be used here to interpolate what the user's keyword for 'for' is
    this.consume(TokenType.RightParen, "Expect ')' after 'for' clauses.");

    let body = this.statement();

    if (increment !== null) {
      body = new Stmt.Block([body, new Stmt.Expression(increment)]);
    }

    let whileCondition = condition;
    if (whileCondition === null) {
      whileCondition = new Expr.Literal(true);
    }

    body = new Stmt.While(whileCondition, body);
    if (initializer !== null) {
      body = new Stmt.Block([initializer, body]);
    }

    return body;
  }

  private varDeclaration(): Stmt.Statement {
    let name = this.consume(TokenType.Identifier, "Expect variable name.");
    let initializer = null;
    if (this.matchTypes(TokenType.Equal)) {
      initializer = this.expression();
    }

    this.consume(TokenType.Semicolon, "Expect ';' after variable declaration.");
    return new Stmt.Var(name, initializer);
  }

  private block(): Stmt.Statement[] {
    const statements: Stmt.Statement[] = [];

    while (!this.check(TokenType.RightBrace) && !this.end()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RightBrace, "Expect '}' after block.");
    return statements;
  }

  private expressionStatement(): Stmt.Statement {
    let value = this.expression();
    this.consume(TokenType.Semicolon, "Expect ';' after expression.");
    return new Stmt.Expression(value);
  }

  private expression(): Expr.Expression {
    return this.assignment();
  }

  private assignment(): Expr.Expression {
    let expr = this.or();
    if (this.matchTypes(TokenType.Equal)) {
      let equals = this.previous();
      let value = this.assignment();

      if (expr instanceof Expr.Variable) {
        let name = expr.name;
        return new Expr.Assign(name, value);
      } else if (expr instanceof Expr.Get) {
        return new Expr.Set(expr.object, expr.name, value);
      } else if (expr instanceof Expr.GetIndexed) {
        return new Expr.SetIndexed(expr.object, expr.index, value, equals);
      } else {
        throw LangError.syntaxError("Invalid assignment target.", equals);
      }
    }

    if (this.matchTypes(TokenType.PlusEqual, TokenType.MinusEqual, TokenType.StarEqual, TokenType.SlashEqual)) {
      let equals = this.previous();
      let operatorType: TokenType;
      switch (equals.type) {
        case TokenType.PlusEqual:
          operatorType = TokenType.Plus;
          break;
        case TokenType.MinusEqual:
          operatorType = TokenType.Minus;
          break;
        case TokenType.StarEqual:
          operatorType = TokenType.Star;
          break;
        case TokenType.SlashEqual:
          operatorType = TokenType.Slash;
          break;
        default:
          // This should never happen
          throw LangError.syntaxError("Invalid assignment target.", equals);
      }
      let value = this.assignment();

      if (expr instanceof Expr.Variable) {
        let name = expr.name;
        return new Expr.Assign(
          name,
          new Expr.Binary(
            expr,
            new Token(operatorType, equals.lexeme.charAt(0), null, equals.line, equals.column),
            value,
          )
        )
      } else if (expr instanceof Expr.Get) {
        return new Expr.Set(
          expr.object,
          expr.name,
          new Expr.Binary(
            expr,
            new Token(operatorType, equals.lexeme.charAt(0), null, equals.line, equals.column),
            value,
          )
        )
      } else if (expr instanceof Expr.GetIndexed) {
        return new Expr.SetIndexed(
          expr.object,
          expr.index,
          new Expr.Binary(
            expr,
            new Token(operatorType, equals.lexeme.charAt(0), null, equals.line, equals.column),
            value,
          ),
          expr.bracket,
        )
      } else {
        throw LangError.syntaxError("Invalid assignment target.", equals);
      }

    }

    if (this.matchTypes(TokenType.Increment, TokenType.Decrement)) {
      let equals = this.previous();
      let operator: Token;
      if (equals.type === TokenType.Increment) {
        operator = new Token(TokenType.Plus, "+", null, equals.line, equals.column);
      } else {
        operator = new Token(TokenType.Minus, "-", null, equals.line, equals.column);
      }

      if (expr instanceof Expr.Variable) {
        return new Expr.Assign(
          expr.name,
          new Expr.Binary(
            expr,
            operator,
            new Expr.Literal(1),
          ),
        )
      } else if (expr instanceof Expr.Get) {
        return new Expr.Set(
          expr.object,
          expr.name,
          new Expr.Binary(
            expr,
            operator,
            new Expr.Literal(1),
          )
        )
      } else if (expr instanceof Expr.GetIndexed) {
        return new Expr.SetIndexed(
          expr.object,
          expr.index,
          new Expr.Binary(
            expr,
            operator,
            new Expr.Literal(1),
          ),
          expr.bracket,
        )
      } else {
        throw LangError.syntaxError("Invalid assignment target.", equals);
      }

    }
    return expr;
  }

  private or(): Expr.Expression {
    let expr = this.and();
    while (this.matchTypes(TokenType.Or)) {
      let operator = this.previous();
      let right = this.and();
      expr = new Expr.Logical(expr, operator, right);
    }
    return expr;
  }

  private and(): Expr.Expression {
    let expr = this.equality();
    while (this.matchTypes(TokenType.And)) {
      let operator = this.previous();
      let right = this.equality();
      expr = new Expr.Logical(expr, operator, right);
    }
    return expr;
  }

  private equality(): Expr.Expression {
    let expr = this.comparsion();
    while (this.matchTypes(TokenType.BangEqual, TokenType.EqualEqual)) {
      let operator = this.previous();
      let right = this.comparsion();
      expr = new Expr.Binary(expr, operator, right);
    }
    return expr;
  }

  private comparsion(): Expr.Expression {
    let expr = this.term();
    while (this.matchTypes(TokenType.Greater, TokenType.GreaterEqual, TokenType.Less, TokenType.LessEqual)) {
      let operator = this.previous();
      let right = this.term();
      expr = new Expr.Binary(expr, operator, right);
    }
    return expr;
  }

  private term(): Expr.Expression {
    let expr = this.factor();
    while (this.matchTypes(TokenType.Minus, TokenType.Plus, TokenType.Modulo)) {
      let operator = this.previous();
      let right = this.factor();
      expr = new Expr.Binary(expr, operator, right);
    }
    return expr;
  }

  private factor(): Expr.Expression {
    let expr = this.unary();
    while (this.matchTypes(TokenType.Slash, TokenType.Star)) {
      let operator = this.previous();
      let right = this.unary();
      expr = new Expr.Binary(expr, operator, right);
    }
    return expr;
  }

  private unary(): Expr.Expression {
    if (this.matchTypes(TokenType.Bang, TokenType.Minus)) {
      let operator = this.previous();
      let right = this.unary();
      return new Expr.Unary(operator, right);
    }

    return this.call();
  }

  private call(): Expr.Expression {
    let expr = this.primary();
    while (true) {
      if (this.matchTypes(TokenType.LeftParen)) {
        expr = this.finishCall(expr);
      } else if (this.matchTypes(TokenType.Dot)) {
        let name = this.consume(TokenType.Identifier, "Expect property name after '.'");
        expr = new Expr.Get(expr, name);
      } else if (this.matchTypes(TokenType.LeftSquare)) {
        let index = this.primary();
        let bracket = this.peek();
        expr = new Expr.GetIndexed(expr, index, bracket)
        this.consume(TokenType.RightSquare, "Expect ']' after index.");
      } else {
        break;
      }
    }
    return expr;
  }

  private finishCall(callee: Expr.Expression): Expr.Expression {
    let args: Expr.Expression[] = [];
    if (!this.check(TokenType.RightParen)) {
      while (true) {
        if (args.length >= 255) {
          throw LangError.syntaxError("Can't have more than 255 arguments.", this.peek());
        }
        args.push(this.expression());
        if (!this.matchTypes(TokenType.Comma)) break;
      }
    }

    let paren = this.consume(TokenType.RightParen, "Expect ')' after arguments.");
    return new Expr.Call(callee, paren, args);
  }

  private primary(): Expr.Expression {
    if (this.matchTypes(TokenType.False)) {
      return new Expr.Literal(false);
    }

    if (this.matchTypes(TokenType.True)) {
      return new Expr.Literal(true);
    }

    if (this.matchTypes(TokenType.Nil)) {
      return new Expr.Literal(null);
    }

    if (this.matchTypes(TokenType.Number, TokenType.String)) {
      return new Expr.Literal(this.previous().literal);
    }

    if (this.matchTypes(TokenType.Super)) {
      let keyword = this.previous();
      // TODO: Spec should be used here to interpolate what the user's keyword for super is
      this.consume(TokenType.Dot, "Expect '.' after 'super'");
      // TODO: Spec should be used here to interpolate what the user's keyword for super and class is
      let method = this.consume(TokenType.Identifier, "Expect super class method name");
      return new Expr.Super(keyword, method);
    }

    if (this.matchTypes(TokenType.This)) {
      return new Expr.This(this.previous());
    }

    if (this.matchTypes(TokenType.Identifier)) {
      return new Expr.Variable(this.previous());
    }

    if (this.matchTypes(TokenType.LeftSquare)) {
      return this.arrayExpr();
    }

    if (this.matchTypes(TokenType.LeftParen)) {
      let expr = this.expression();
      this.consume(TokenType.RightParen, "Expect ')' after expression.");
      return new Expr.Grouping(expr);
    }


    throw LangError.syntaxError("Expect expression.", this.peek());
  }

  private arrayExpr(): Expr.Expression {
    let values: Expr.Expression[] = [];

    if (!this.check(TokenType.RightSquare)) {
      // TODO: Can proably refactor this to be a do while loop
      // Think about this carefully though
      while (true) {
        values.push(this.expression());
        if (!this.matchTypes(TokenType.Comma)) break;
      }
    }

    this.consume(TokenType.RightSquare, "Expect ']' after array elements" );
    return new Expr.ArrayExpr(values);
  }
}
