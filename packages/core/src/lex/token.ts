import { Literal } from "../runtime/literal";
import { LangskinSpec } from "../spec/types";

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

/**
 * Builds a reverse lookup map from keyword string to TokenType based on the spec.
 */
export function buildKeywordMap(
  spec: LangskinSpec,
): Map<string, TokenType> {
  const map = new Map<string, TokenType>();
  const { keywords } = spec;

  map.set(keywords.and, TokenType.And);
  map.set(keywords.or, TokenType.Or);
  map.set(keywords.not, TokenType.Bang);
  map.set(keywords.if, TokenType.If);
  map.set(keywords.else, TokenType.Else);
  map.set(keywords.elif, TokenType.ElseIf);
  map.set(keywords.for, TokenType.For);
  map.set(keywords.while, TokenType.While);
  map.set(keywords.break, TokenType.Break);
  map.set(keywords.continue, TokenType.Continue);
  map.set(keywords.fun, TokenType.Fun);
  map.set(keywords.return, TokenType.Return);
  map.set(keywords.class, TokenType.Class);
  map.set(keywords.inherits, TokenType.Inherits);
  map.set(keywords.super, TokenType.Super);
  map.set(keywords.this, TokenType.This);
  map.set(keywords.var, TokenType.Var);
  map.set(keywords.true, TokenType.True);
  map.set(keywords.false, TokenType.False);
  map.set(keywords.nil, TokenType.Nil);
  map.set(keywords.print, TokenType.Print);

  return map;
}

/**
 * Returns the TokenType for a keyword string, or null if not a keyword.
 */
export function tokenTypeFromKeyword(
  keyword: string,
  keywordMap: Map<string, TokenType>,
): TokenType | null {
  return keywordMap.get(keyword) ?? null;
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
