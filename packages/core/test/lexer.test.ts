import { Lexer } from "../src/lex/lexer";
import { TokenType } from "../src/lex/token";
import { Reporter } from "../src/reporter/reporter";
import { ErrorPhase } from "../src/errors/types";
import { describe, it, expect } from "vitest";

function tokenize(source: string, reporter?: Reporter) {
  return new Lexer(source, reporter ?? new Reporter()).scanTokens();
}

describe("Lexer", () => {
  describe("single character tokens", () => {
    it("should tokenize parentheses", () => {
      const tokens = tokenize("()");
      expect(tokens[0].type).toBe(TokenType.LeftParen);
      expect(tokens[1].type).toBe(TokenType.RightParen);
      expect(tokens[2].type).toBe(TokenType.Eof);
    });

    it("should tokenize braces", () => {
      const tokens = tokenize("{}");
      expect(tokens[0].type).toBe(TokenType.LeftBrace);
      expect(tokens[1].type).toBe(TokenType.RightBrace);
    });

    it("should tokenize square brackets", () => {
      const tokens = tokenize("[]");
      expect(tokens[0].type).toBe(TokenType.LeftSquare);
      expect(tokens[1].type).toBe(TokenType.RightSquare);
    });

    it("should tokenize comma, dot, semicolon", () => {
      const tokens = tokenize(",.; ");
      expect(tokens[0].type).toBe(TokenType.Comma);
      expect(tokens[1].type).toBe(TokenType.Dot);
      expect(tokens[2].type).toBe(TokenType.Semicolon);
    });

    it("should tokenize star and modulo", () => {
      const tokens = tokenize("* %");
      expect(tokens[0].type).toBe(TokenType.Star);
      expect(tokens[1].type).toBe(TokenType.Modulo);
    });

    it("should tokenize slash", () => {
      const tokens = tokenize("/");
      expect(tokens[0].type).toBe(TokenType.Slash);
    });
  });

  describe("one or two character tokens", () => {
    it("should tokenize minus variants", () => {
      const tokens = tokenize("- -- -=");
      expect(tokens[0].type).toBe(TokenType.Minus);
      expect(tokens[1].type).toBe(TokenType.Decrement);
      expect(tokens[2].type).toBe(TokenType.MinusEqual);
    });

    it("should tokenize plus variants", () => {
      const tokens = tokenize("+ ++ +=");
      expect(tokens[0].type).toBe(TokenType.Plus);
      expect(tokens[1].type).toBe(TokenType.Increment);
      expect(tokens[2].type).toBe(TokenType.PlusEqual);
    });

    it("should tokenize star equal", () => {
      const tokens = tokenize("*=");
      expect(tokens[0].type).toBe(TokenType.StarEqual);
    });

    it("should tokenize slash equal", () => {
      const tokens = tokenize("/=");
      expect(tokens[0].type).toBe(TokenType.SlashEqual);
    });

    it("should tokenize bang and bang equal", () => {
      const tokens = tokenize("! !=");
      expect(tokens[0].type).toBe(TokenType.Bang);
      expect(tokens[1].type).toBe(TokenType.BangEqual);
    });

    it("should tokenize equal and equal equal", () => {
      const tokens = tokenize("= ==");
      expect(tokens[0].type).toBe(TokenType.Equal);
      expect(tokens[1].type).toBe(TokenType.EqualEqual);
    });

    it("should tokenize less and less equal", () => {
      const tokens = tokenize("< <=");
      expect(tokens[0].type).toBe(TokenType.Less);
      expect(tokens[1].type).toBe(TokenType.LessEqual);
    });

    it("should tokenize greater and greater equal", () => {
      const tokens = tokenize("> >=");
      expect(tokens[0].type).toBe(TokenType.Greater);
      expect(tokens[1].type).toBe(TokenType.GreaterEqual);
    });
  });

  describe("logical operators", () => {
    it("should tokenize && as And", () => {
      const tokens = tokenize("&&");
      expect(tokens[0].type).toBe(TokenType.And);
    });

    it("should tokenize || as Or", () => {
      const tokens = tokenize("||");
      expect(tokens[0].type).toBe(TokenType.Or);
    });

    it("should ignore single & and |", () => {
      const tokens = tokenize("& |");
      // Single & and | are not valid tokens, should only have Eof
      expect(tokens[0].type).toBe(TokenType.Eof);
    });
  });

  describe("comments", () => {
    it("should ignore single line comments", () => {
      const tokens = tokenize("// this is a comment");
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe(TokenType.Eof);
    });

    it("should tokenize code before comments", () => {
      const tokens = tokenize("42 // comment");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(42);
      expect(tokens[1].type).toBe(TokenType.Eof);
    });

    it("should handle comments followed by newline and more code", () => {
      const tokens = tokenize("1 // comment\n2");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(1);
      expect(tokens[1].type).toBe(TokenType.Number);
      expect(tokens[1].literal.value).toBe(2);
    });
  });

  describe("strings", () => {
    it("should tokenize simple strings", () => {
      const tokens = tokenize('"hello"');
      expect(tokens[0].type).toBe(TokenType.String);
      expect(tokens[0].literal.value).toBe("hello");
      expect(tokens[0].lexeme).toBe('"hello"');
    });

    it("should tokenize empty strings", () => {
      const tokens = tokenize('""');
      expect(tokens[0].type).toBe(TokenType.String);
      expect(tokens[0].literal.value).toBe("");
    });

    it("should tokenize strings with spaces", () => {
      const tokens = tokenize('"hello world"');
      expect(tokens[0].literal.value).toBe("hello world");
    });

    it("should handle escape sequences in strings", () => {
      const tokens = tokenize('"hello\\nworld"');
      expect(tokens[0].type).toBe(TokenType.String);
      expect(tokens[0].literal.value).toBe("hello\\nworld");
    });

    it("should handle escaped quotes in strings", () => {
      const tokens = tokenize('"say \\"hi\\""');
      expect(tokens[0].type).toBe(TokenType.String);
    });

    it("should handle multiline strings and track line numbers", () => {
      const tokens = tokenize('"line1\nline2"');
      expect(tokens[0].type).toBe(TokenType.String);
      expect(tokens[0].literal.value).toBe("line1\nline2");
    });

    it("should report unterminated strings", () => {
      const reporter = new Reporter();
      tokenize('"unterminated', reporter);
      expect(reporter.hasErrors()).toBe(true);
      const errors = reporter.getErrors();
      expect(errors[0].phase).toBe(ErrorPhase.Lexical);
      expect(errors[0].message).toBe("Unterminated string.");
    });
  });

  describe("numbers", () => {
    it("should tokenize integers", () => {
      const tokens = tokenize("42");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(42);
      expect(tokens[0].lexeme).toBe("42");
    });

    it("should tokenize floating point numbers", () => {
      const tokens = tokenize("3.14159");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(3.14159);
    });

    it("should tokenize numbers starting with zero", () => {
      const tokens = tokenize("0");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(0);
    });

    it("should tokenize decimal starting with zero", () => {
      const tokens = tokenize("0.5");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(0.5);
    });

    it("should not consume trailing dot without digit", () => {
      const tokens = tokenize("42.");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(42);
      expect(tokens[1].type).toBe(TokenType.Dot);
    });

    it("should tokenize multiple numbers", () => {
      const tokens = tokenize("1 2 3");
      expect(tokens[0].literal.value).toBe(1);
      expect(tokens[1].literal.value).toBe(2);
      expect(tokens[2].literal.value).toBe(3);
    });
  });

  describe("identifiers", () => {
    it("should tokenize simple identifiers", () => {
      const tokens = tokenize("foo");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].lexeme).toBe("foo");
    });

    it("should tokenize identifiers with underscores", () => {
      const tokens = tokenize("foo_bar");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].lexeme).toBe("foo_bar");
    });

    it("should tokenize identifiers starting with underscore", () => {
      const tokens = tokenize("_private");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].lexeme).toBe("_private");
    });

    it("should tokenize identifiers with numbers", () => {
      const tokens = tokenize("foo123");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].lexeme).toBe("foo123");
    });

    it("should tokenize mixed case identifiers", () => {
      const tokens = tokenize("FooBar");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].lexeme).toBe("FooBar");
    });
  });

  describe("keywords", () => {
    it("should tokenize 'and' keyword", () => {
      const tokens = tokenize("and");
      expect(tokens[0].type).toBe(TokenType.And);
    });

    it("should tokenize 'or' keyword", () => {
      const tokens = tokenize("or");
      expect(tokens[0].type).toBe(TokenType.Or);
    });

    it("should tokenize 'not' as Bang", () => {
      const tokens = tokenize("not");
      expect(tokens[0].type).toBe(TokenType.Bang);
    });

    it("should tokenize 'class' keyword", () => {
      const tokens = tokenize("class");
      expect(tokens[0].type).toBe(TokenType.Class);
    });

    it("should tokenize 'if' keyword", () => {
      const tokens = tokenize("if");
      expect(tokens[0].type).toBe(TokenType.If);
    });

    it("should tokenize 'else' keyword", () => {
      const tokens = tokenize("else");
      expect(tokens[0].type).toBe(TokenType.Else);
    });

    it("should tokenize 'elif' as ElseIf", () => {
      const tokens = tokenize("elif");
      expect(tokens[0].type).toBe(TokenType.ElseIf);
    });

    it("should tokenize 'true' and 'false'", () => {
      const tokens = tokenize("true false");
      expect(tokens[0].type).toBe(TokenType.True);
      expect(tokens[1].type).toBe(TokenType.False);
    });

    it("should tokenize 'nil'", () => {
      const tokens = tokenize("nil");
      expect(tokens[0].type).toBe(TokenType.Nil);
    });

    it("should tokenize 'fun'", () => {
      const tokens = tokenize("fun");
      expect(tokens[0].type).toBe(TokenType.Fun);
    });

    it("should tokenize 'return'", () => {
      const tokens = tokenize("return");
      expect(tokens[0].type).toBe(TokenType.Return);
    });

    it("should tokenize 'let' as Var", () => {
      const tokens = tokenize("let");
      expect(tokens[0].type).toBe(TokenType.Var);
    });

    it("should tokenize loop keywords", () => {
      const tokens = tokenize("while for break continue");
      expect(tokens[0].type).toBe(TokenType.While);
      expect(tokens[1].type).toBe(TokenType.For);
      expect(tokens[2].type).toBe(TokenType.Break);
      expect(tokens[3].type).toBe(TokenType.Continue);
    });

    it("should tokenize 'print'", () => {
      const tokens = tokenize("print");
      expect(tokens[0].type).toBe(TokenType.Print);
    });

    it("should tokenize class-related keywords", () => {
      const tokens = tokenize("this super inherits");
      expect(tokens[0].type).toBe(TokenType.This);
      expect(tokens[1].type).toBe(TokenType.Super);
      expect(tokens[2].type).toBe(TokenType.Inherits);
    });

    it("should not match keywords as part of identifiers", () => {
      const tokens = tokenize("iffy lethal forgo");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[0].lexeme).toBe("iffy");
      expect(tokens[1].type).toBe(TokenType.Identifier);
      expect(tokens[1].lexeme).toBe("lethal");
      expect(tokens[2].type).toBe(TokenType.Identifier);
      expect(tokens[2].lexeme).toBe("forgo");
    });
  });

  describe("whitespace handling", () => {
    it("should ignore spaces", () => {
      const tokens = tokenize("   42   ");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[1].type).toBe(TokenType.Eof);
    });

    it("should ignore tabs", () => {
      const tokens = tokenize("\t42\t");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[1].type).toBe(TokenType.Eof);
    });

    it("should ignore carriage returns", () => {
      const tokens = tokenize("\r42\r");
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[1].type).toBe(TokenType.Eof);
    });

    it("should handle newlines and increment line count", () => {
      const tokens = tokenize("1\n2\n3");
      expect(tokens[0].line).toBe(1);
      expect(tokens[1].line).toBe(2);
      expect(tokens[2].line).toBe(3);
    });
  });

  describe("line and column tracking", () => {
    it("should track column positions within a line", () => {
      // Column represents the actual column (0-indexed) in source
      const tokens = tokenize("a b c");
      expect(tokens[0].column).toBe(0); // 'a' at column 0
      expect(tokens[1].column).toBe(2); // 'b' at column 2
      expect(tokens[2].column).toBe(4); // 'c' at column 4
    });

    it("should reset column on newline", () => {
      const tokens = tokenize("a\nb");
      expect(tokens[0].line).toBe(1);
      expect(tokens[0].column).toBe(0); // 'a' at column 0
      expect(tokens[1].line).toBe(2);
      expect(tokens[1].column).toBe(0); // 'b' at column 0 of line 2
    });

    it("should track correct column for multi-character tokens", () => {
      const tokens = tokenize("let foo = 123;");
      expect(tokens[0].column).toBe(0); // 'let' at column 0
      expect(tokens[1].column).toBe(4); // 'foo' at column 4
      expect(tokens[2].column).toBe(8); // '=' at column 8
      expect(tokens[3].column).toBe(10); // '123' at column 10
      expect(tokens[4].column).toBe(13); // ';' at column 13
    });

    it("should track correct columns across multiple lines", () => {
      const tokens = tokenize("a\n  b\n    c");
      expect(tokens[0].line).toBe(1);
      expect(tokens[0].column).toBe(0); // 'a' at line 1, column 0
      expect(tokens[1].line).toBe(2);
      expect(tokens[1].column).toBe(2); // 'b' at line 2, column 2 (after 2 spaces)
      expect(tokens[2].line).toBe(3);
      expect(tokens[2].column).toBe(4); // 'c' at line 3, column 4 (after 4 spaces)
    });
  });

  describe("edge cases", () => {
    it("should handle empty input", () => {
      const tokens = tokenize("");
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe(TokenType.Eof);
    });

    it("should handle only whitespace", () => {
      const tokens = tokenize("   \n\t\r  ");
      expect(tokens.length).toBe(1);
      expect(tokens[0].type).toBe(TokenType.Eof);
    });

    it("should report unexpected characters", () => {
      const reporter = new Reporter();
      tokenize("@", reporter);
      expect(reporter.hasErrors()).toBe(true);
      const errors = reporter.getErrors();
      expect(errors[0].phase).toBe(ErrorPhase.Lexical);
      expect(errors[0].message).toBe("Unexpected character.");
    });

    it("should continue after unexpected character", () => {
      const reporter = new Reporter();
      const tokens = tokenize("@ 42", reporter);
      expect(tokens[0].type).toBe(TokenType.Number);
      expect(tokens[0].literal.value).toBe(42);
      expect(reporter.hasErrors()).toBe(true);
    });
  });

  describe("complex expressions", () => {
    it("should tokenize a variable declaration", () => {
      const tokens = tokenize("let x = 42;");
      expect(tokens[0].type).toBe(TokenType.Var);
      expect(tokens[1].type).toBe(TokenType.Identifier);
      expect(tokens[1].lexeme).toBe("x");
      expect(tokens[2].type).toBe(TokenType.Equal);
      expect(tokens[3].type).toBe(TokenType.Number);
      expect(tokens[4].type).toBe(TokenType.Semicolon);
    });

    it("should tokenize a function declaration", () => {
      const tokens = tokenize("fun add(a, b) { return a + b; }");
      expect(tokens[0].type).toBe(TokenType.Fun);
      expect(tokens[1].type).toBe(TokenType.Identifier);
      expect(tokens[2].type).toBe(TokenType.LeftParen);
      expect(tokens[3].type).toBe(TokenType.Identifier);
      expect(tokens[4].type).toBe(TokenType.Comma);
      expect(tokens[5].type).toBe(TokenType.Identifier);
      expect(tokens[6].type).toBe(TokenType.RightParen);
      expect(tokens[7].type).toBe(TokenType.LeftBrace);
      expect(tokens[8].type).toBe(TokenType.Return);
      expect(tokens[9].type).toBe(TokenType.Identifier);
      expect(tokens[10].type).toBe(TokenType.Plus);
      expect(tokens[11].type).toBe(TokenType.Identifier);
      expect(tokens[12].type).toBe(TokenType.Semicolon);
      expect(tokens[13].type).toBe(TokenType.RightBrace);
    });

    it("should tokenize an if-else statement", () => {
      const tokens = tokenize(
        "if (x > 0) { print x; } else { print 0; }",
      );
      expect(tokens[0].type).toBe(TokenType.If);
      expect(tokens[1].type).toBe(TokenType.LeftParen);
      expect(tokens[2].type).toBe(TokenType.Identifier);
      expect(tokens[3].type).toBe(TokenType.Greater);
      expect(tokens[4].type).toBe(TokenType.Number);
      expect(tokens[5].type).toBe(TokenType.RightParen);
      expect(tokens[6].type).toBe(TokenType.LeftBrace);
      expect(tokens[7].type).toBe(TokenType.Print);
    });

    it("should tokenize a while loop", () => {
      const tokens = tokenize("while (i < 10) { i++; }");
      expect(tokens[0].type).toBe(TokenType.While);
      expect(tokens[1].type).toBe(TokenType.LeftParen);
      expect(tokens[2].type).toBe(TokenType.Identifier);
      expect(tokens[3].type).toBe(TokenType.Less);
      expect(tokens[4].type).toBe(TokenType.Number);
      expect(tokens[5].type).toBe(TokenType.RightParen);
      expect(tokens[6].type).toBe(TokenType.LeftBrace);
      expect(tokens[7].type).toBe(TokenType.Identifier);
      expect(tokens[8].type).toBe(TokenType.Increment);
    });

    it("should tokenize array access", () => {
      const tokens = tokenize("arr[0]");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[1].type).toBe(TokenType.LeftSquare);
      expect(tokens[2].type).toBe(TokenType.Number);
      expect(tokens[3].type).toBe(TokenType.RightSquare);
    });

    it("should tokenize method call", () => {
      const tokens = tokenize("obj.method()");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[1].type).toBe(TokenType.Dot);
      expect(tokens[2].type).toBe(TokenType.Identifier);
      expect(tokens[3].type).toBe(TokenType.LeftParen);
      expect(tokens[4].type).toBe(TokenType.RightParen);
    });

    it("should tokenize class declaration", () => {
      const tokens = tokenize("class Dog inherits Animal { }");
      expect(tokens[0].type).toBe(TokenType.Class);
      expect(tokens[1].type).toBe(TokenType.Identifier);
      expect(tokens[2].type).toBe(TokenType.Inherits);
      expect(tokens[3].type).toBe(TokenType.Identifier);
      expect(tokens[4].type).toBe(TokenType.LeftBrace);
      expect(tokens[5].type).toBe(TokenType.RightBrace);
    });

    it("should tokenize logical expressions", () => {
      const tokens = tokenize("a && b || not c");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[1].type).toBe(TokenType.And);
      expect(tokens[2].type).toBe(TokenType.Identifier);
      expect(tokens[3].type).toBe(TokenType.Or);
      expect(tokens[4].type).toBe(TokenType.Bang);
      expect(tokens[5].type).toBe(TokenType.Identifier);
    });

    it("should tokenize compound assignments", () => {
      const tokens = tokenize("x += 1; y -= 2; z *= 3;");
      expect(tokens[0].type).toBe(TokenType.Identifier);
      expect(tokens[1].type).toBe(TokenType.PlusEqual);
      expect(tokens[2].type).toBe(TokenType.Number);
      expect(tokens[4].type).toBe(TokenType.Identifier);
      expect(tokens[5].type).toBe(TokenType.MinusEqual);
      expect(tokens[8].type).toBe(TokenType.Identifier);
      expect(tokens[9].type).toBe(TokenType.StarEqual);
    });
  });
});
