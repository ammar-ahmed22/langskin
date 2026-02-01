import { Literal } from "../runtime/literal";

export enum TokenType {
  LeftParen,
  RightParen,
  LeftBrace,
  RightBrace,
  Comma,
  Dot,
  Minus,
  Plus,
  Semicolon,
  Slash,
  Star,
  LeftSquare,
  RightSquare,
  Modulo,

  Bang,
  BangEqual,
  Equal,
  EqualEqual,
  Greater,
  GreaterEqual,
  Less,
  LessEqual,

  Identifier,
  String,
  Number,

  And,
  Class,
  Else,
  ElseIf,
  False,
  Fun,
  If,
  Nil,
  Or,
  Print,
  Return,
  Super,
  This,
  True,
  Var,
  While,
  For,
  Break,
  Continue,
  Inherits,

  PlusEqual,
  MinusEqual,
  StarEqual,
  SlashEqual,

  Increment,
  Decrement,

  Eof,
}

export function tokenTypeFromKeyword(
  keyword: string,
  // TODO: Define a proper spec type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  spec: any,
): TokenType | null {
  // TODO: This should be based on the passed in spec afterwords
  // i.e. users can define their own keywords
  switch (keyword) {
    case "and":
      return TokenType.And;
    case "class":
      return TokenType.Class;
    case "if":
      return TokenType.If;
    case "else":
      return TokenType.Else;
    case "elif":
      return TokenType.ElseIf;
    case "false":
      return TokenType.False;
    case "for":
      return TokenType.For;
    case "fun":
      return TokenType.Fun;
    case "nil":
      return TokenType.Nil;
    case "or":
      return TokenType.Or;
    case "print":
      return TokenType.Print;
    case "return":
      return TokenType.Return;
    case "super":
      return TokenType.Super;
    case "this":
      return TokenType.This;
    case "true":
      return TokenType.True;
    case "let":
      return TokenType.Var;
    case "while":
      return TokenType.While;
    case "break":
      return TokenType.Break;
    case "continue":
      return TokenType.Continue;
    case "inherits":
      return TokenType.Inherits;
    case "not":
      return TokenType.Bang;
    default:
      return null;
  }
}

export class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: Literal,
    public line: number,
    public column: number,
  ) {}

  toString(): string {
    return `${TokenType[this.type]} ${this.lexeme} ${this.literal}`;
  }
}
