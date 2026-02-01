import { Token, TokenType, tokenTypeFromKeyword } from "./token";
import { ErrorReporter, LangError } from "../errors/reporter";

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private start: number = 0;
  private current: number = 0;
  private line: number = 1;
  private lineStart: number = 0; // Index where current line begins
  private reporter: ErrorReporter;

  constructor(source: string, reporter: ErrorReporter) {
    this.source = source;
    this.reporter = reporter;
  }

  // Returns the column (0-indexed) of the token's start position
  private get column(): number {
    return this.start - this.lineStart;
  }

  private end(): boolean {
    return this.current >= this.source.length;
  }

  private advance(): string {
    return this.source.charAt(this.current++);
  }

  private matchNext(expected: string): boolean {
    if (this.end()) return false;
    const char = this.source.charAt(this.current);
    if (char !== expected) return false;
    this.current++;
    return true;
  }

  private peek(): string {
    if (this.end()) return "\0";
    return this.source.charAt(this.current);
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return "\0";
    return this.source.charAt(this.current + 1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private addToken(type: TokenType, literal: any = null) {
    const text = this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(type, text, literal, this.line, this.column),
    );
  }

  private string() {
    while (this.peek() !== '"' && !this.end()) {
      if (this.peek() === "\\") {
        this.advance(); // Skip the escape character
      }

      if (this.peek() === "\n") {
        this.line++;
        this.lineStart = this.current + 1;
      }

      this.advance();
    }

    if (this.end()) {
      this.reporter.report(
        LangError.lexerError(
          "Unterminated string.",
          this.line,
          this.column,
        ),
      );
      return;
    }

    this.advance(); // The closing "

    const value = this.source.substring(
      this.start + 1,
      this.current - 1,
    );
    this.addToken(TokenType.String, value);
  }

  private assertChar(c: string) {
    if (c.length !== 1) {
      throw new Error(
        "assertChar expects a single character string.",
      );
    }
  }

  private isDigit(char: string): boolean {
    this.assertChar(char);
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    this.assertChar(char);
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private isAlphaNumeric(char: string): boolean {
    this.assertChar(char);
    return this.isAlpha(char) || this.isDigit(char);
  }

  private number() {
    while (this.isDigit(this.peek())) {
      this.advance();
    }

    if (this.peek() === "." && this.isDigit(this.peekNext())) {
      this.advance(); // consume the "."
      // Consume the fractional part
      while (this.isDigit(this.peek())) {
        this.advance();
      }
    }

    const value = parseFloat(
      this.source.substring(this.start, this.current),
    );
    this.addToken(TokenType.Number, value);
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek())) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    // TODO: Add spec here
    const type = tokenTypeFromKeyword(text, {});
    if (type === null) {
      this.addToken(TokenType.Identifier);
    } else {
      this.addToken(type);
    }
  }

  private scanToken() {
    const char = this.advance();
    switch (char) {
      case "(":
        this.addToken(TokenType.LeftParen);
        break;
      case ")":
        this.addToken(TokenType.RightParen);
        break;
      case "{":
        this.addToken(TokenType.LeftBrace);
        break;
      case "}":
        this.addToken(TokenType.RightBrace);
        break;
      case "]":
        this.addToken(TokenType.RightSquare);
        break;
      case "[":
        this.addToken(TokenType.LeftSquare);
        break;
      case ",":
        this.addToken(TokenType.Comma);
        break;
      case ".":
        this.addToken(TokenType.Dot);
        break;
      case "-":
        if (this.matchNext("-")) {
          this.addToken(TokenType.Decrement);
        } else if (this.matchNext("=")) {
          this.addToken(TokenType.MinusEqual);
        } else {
          this.addToken(TokenType.Minus);
        }
        break;
      case "+":
        if (this.matchNext("+")) {
          this.addToken(TokenType.Increment);
        } else if (this.matchNext("=")) {
          this.addToken(TokenType.PlusEqual);
        } else {
          this.addToken(TokenType.Plus);
        }
        break;
      case ";":
        this.addToken(TokenType.Semicolon);
        break;
      case "*":
        if (this.matchNext("=")) {
          this.addToken(TokenType.StarEqual);
        } else {
          this.addToken(TokenType.Star);
        }
        break;
      case "%":
        this.addToken(TokenType.Modulo);
        break;
      case "!":
        this.addToken(
          this.matchNext("=") ? TokenType.BangEqual : TokenType.Bang,
        );
        break;
      case "=":
        this.addToken(
          this.matchNext("=")
            ? TokenType.EqualEqual
            : TokenType.Equal,
        );
        break;
      case "<":
        this.addToken(
          this.matchNext("=") ? TokenType.LessEqual : TokenType.Less,
        );
        break;
      case ">":
        this.addToken(
          this.matchNext("=")
            ? TokenType.GreaterEqual
            : TokenType.Greater,
        );
        break;
      case "&":
        if (this.matchNext("&")) {
          this.addToken(TokenType.And);
        }
        break;
      case "|":
        if (this.matchNext("|")) {
          this.addToken(TokenType.Or);
        }
        break;
      case "/":
        if (this.matchNext("/")) {
          // A comment goes until the end of the line.
          while (this.peek() !== "\n" && !this.end()) this.advance();
        } else if (this.matchNext("=")) {
          this.addToken(TokenType.SlashEqual);
        } else {
          this.addToken(TokenType.Slash);
        }
        break;
      case " ":
      case "\r":
      case "\t":
        // Ignore whitespace.
        break;
      case "\n":
        this.line++;
        this.lineStart = this.current;
        break;
      case '"':
        this.string();
        break;
      default:
        if (this.isDigit(char)) {
          this.number();
        } else if (this.isAlpha(char)) {
          this.identifier();
        } else {
          this.reporter.report(
            LangError.lexerError(
              "Unexpected character.",
              this.line,
              this.column,
            ),
          );
        }
    }
  }

  public scanTokens(): Token[] {
    while (!this.end()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(
      new Token(
        TokenType.Eof,
        "",
        null,
        this.line,
        this.current - this.lineStart,
      ),
    );
    return this.tokens;
  }
}
