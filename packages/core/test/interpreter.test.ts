import { describe, it, expect } from "vitest";
import { Lexer } from "../src/lex/lexer";
import { Parser } from "../src/parse/parser";
import { Resolver } from "../src/runtime/resolver";
import { Interpreter } from "../src/runtime/interpreter";
import { Reporter } from "../src/reporter/reporter";
import { LangError } from "../src/errors/error";
import { ErrorPhase } from "../src/errors/types";

function run(source: string): string[] {
  const reporter = new Reporter();

  const tokens = new Lexer(source, reporter).scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse();

  const interpreter = new Interpreter(reporter);
  const resolver = new Resolver(interpreter);
  resolver.resolveStmts(statements);

  interpreter.interpret(statements);

  return reporter.getOutput();
}

function expectRuntimeError(
  source: string,
  expectedMessage?: string,
): LangError {
  const reporter = new Reporter();
  const tokens = new Lexer(source, reporter).scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse();

  const interpreter = new Interpreter(reporter);
  const resolver = new Resolver(interpreter);
  resolver.resolveStmts(statements);

  try {
    interpreter.interpret(statements);
    throw new Error(
      "Expected runtime error but interpretation succeeded",
    );
  } catch (e) {
    expect(e).toBeInstanceOf(LangError);
    const error = e as LangError;
    expect(error.phase).toBe(ErrorPhase.Runtime);
    if (expectedMessage) {
      expect(error.message).toBe(expectedMessage);
    }
    return error;
  }
}

function expectResolutionError(
  source: string,
  expectedMessage?: string,
): LangError {
  const reporter = new Reporter();
  const tokens = new Lexer(source, reporter).scanTokens();
  const parser = new Parser(tokens);
  const statements = parser.parse();

  const interpreter = new Interpreter(reporter);
  const resolver = new Resolver(interpreter);
  try {
    resolver.resolveStmts(statements);
    throw new Error(
      "Expected resolution error but resolution succeeded",
    );
  } catch (e) {
    expect(e).toBeInstanceOf(LangError);
    const error = e as LangError;
    expect(error.phase).toBe(ErrorPhase.Runtime); // Resolution errors use Runtime phase
    if (expectedMessage) {
      expect(error.message).toBe(expectedMessage);
    }
    return error;
  }
}

describe("Interpreter", () => {
  it("should add two numbers and print the result", () => {
    const output = run("print 1 + 2;");
    expect(output).toEqual(["3"]);
  });

  it("should handle variable declarations and print their values", () => {
    const output = run("let x = 10; print x;");
    expect(output).toEqual(["10"]);
  });

  it("should handle function definitions and calls", () => {
    const output = run(
      "fun add(a, b) { return a + b; } print add(3, 4);",
    );
    expect(output).toEqual(["7"]);
  });

  it("should handle class definitions and method calls", () => {
    const output = run(`
      class Greeter {
        init(message) {
          this.message = message;
        }

        greet(name) {
          print this.message + ", " + name + "!";
        }
      }
      let greeter = Greeter("Hello");
      greeter.greet("Ammar");
`);
    expect(output).toEqual(["Hello, Ammar!"]);
  });

  it("should handle inheritance and super calls", () => {
    const output = run(`
      class Animal {
        speak() {
          print "Animal speaks";
        }
      }

      class Dog inherits Animal {
        speak() {
          super.speak();
          print "Dog barks";
        }
      }

      let dog = Dog();
      dog.speak();
`);
    expect(output).toEqual(["Animal speaks", "Dog barks"]);
  });

  it("should handle while loops", () => {
    const output = run(
      "let i = 0; while (i < 3) { print i; i = i + 1; }",
    );
    expect(output).toEqual(["0", "1", "2"]);
  });

  it("should handle if statements", () => {
    const output = run(
      "let x = 5; if (x > 3) { print x; } else { print 0; }",
    );
    expect(output).toEqual(["5"]);
  });

  it("should handle else statements", () => {
    const output = run(
      "let x = 2; if (x > 3) { print x; } else { print 0; }",
    );
    expect(output).toEqual(["0"]);
  });

  it("should handle elif statements", () => {
    const output = run(
      "let x = 5; if (x > 10) { print 1; } elif (x > 3) { print 2; } else { print 3; }",
    );
    expect(output).toEqual(["2"]);
  });

  it("should handle chained elif statements", () => {
    const output = run(`
      let x = 3;
      if (x == 1) { print "one"; }
      elif (x == 2) { print "two"; }
      elif (x == 3) { print "three"; }
      elif (x == 4) { print "four"; }
      else { print "other"; }
    `);
    expect(output).toEqual(["three"]);
  });

  it("should handle elif without else", () => {
    const output = run(
      "let x = 5; if (x > 10) { print 1; } elif (x > 3) { print 2; }",
    );
    expect(output).toEqual(["2"]);
  });

  it("should handle logical operators", () => {
    const output = run(
      "let a = true; let b = false; if (a and not b) { print 1; } else { print 0; }",
    );
    expect(output).toEqual(["1"]);
  });

  it("should handle for loops", () => {
    const output = run(
      "for (let i = 0; i < 3; i = i + 1) { print i; }",
    );
    expect(output).toEqual(["0", "1", "2"]);
  });

  it("should handle break in while loop", () => {
    const output = run(`
      let i = 0;
      while (i < 10) {
        if (i == 3) { break; }
        print i;
        i = i + 1;
      }
    `);
    expect(output).toEqual(["0", "1", "2"]);
  });

  it("should handle break in for loop", () => {
    const output = run(`
      for (let i = 0; i < 10; i = i + 1) {
        if (i == 3) { break; }
        print i;
      }
    `);
    expect(output).toEqual(["0", "1", "2"]);
  });

  it("should handle continue in while loop", () => {
    const output = run(`
      let i = 0;
      while (i < 5) {
        i = i + 1;
        if (i == 3) { continue; }
        print i;
      }
    `);
    expect(output).toEqual(["1", "2", "4", "5"]);
  });

  it("should handle continue in for loop", () => {
    const output = run(`
      for (let i = 0; i < 5; i = i + 1) {
        if (i == 2) { continue; }
        print i;
      }
    `);
    expect(output).toEqual(["0", "1", "3", "4"]);
  });

  it("should handle break in nested loop (only exits inner)", () => {
    const output = run(`
      for (let i = 0; i < 3; i = i + 1) {
        for (let j = 0; j < 3; j = j + 1) {
          if (j == 1) { break; }
          print i * 10 + j;
        }
      }
    `);
    expect(output).toEqual(["0", "10", "20"]);
  });

  it("should handle nested function calls", () => {
    const output = run(
      "fun square(x) { return x * x; } fun double(y) { return y + y; } print square(double(3));",
    );
    expect(output).toEqual(["36"]);
  });

  it("should handle variable shadowing", () => {
    const output = run(
      "let x = 10; { let x = 20; print x; } print x;",
    );
    expect(output).toEqual(["20", "10"]);
  });

  it("should handle arrays and indexing", () => {
    const output = run("let arr = [1, 2, 3]; print arr[1];");
    expect(output).toEqual(["2"]);
  });

  it("should handle arrays of different types", () => {
    const output = run(
      'let arr = [1, "two", 3.0, true]; print arr[2];',
    );
    expect(output).toEqual(["3"]);
  });

  it("should handle string indexing", () => {
    const output = run('let str = "hello"; print str[1];');
    expect(output).toEqual(["e"]);
  });

  describe("literals and expressions", () => {
    it("should print nil", () => {
      const output = run("print nil;");
      expect(output).toEqual(["nil"]);
    });

    it("should print true", () => {
      const output = run("print true;");
      expect(output).toEqual(["true"]);
    });

    it("should print false", () => {
      const output = run("print false;");
      expect(output).toEqual(["false"]);
    });

    it("should print floating point numbers", () => {
      const output = run("print 3.14159;");
      expect(output).toEqual(["3.14159"]);
    });

    it("should concatenate strings", () => {
      const output = run('print "hello" + " " + "world";');
      expect(output).toEqual(["hello world"]);
    });

    it("should handle grouping expressions", () => {
      const output = run("print (1 + 2) * 3;");
      expect(output).toEqual(["9"]);
    });

    it("should handle uninitialized variables as nil", () => {
      const output = run("let x; print x;");
      expect(output).toEqual(["nil"]);
    });
  });

  describe("unary operators", () => {
    it("should negate numbers", () => {
      const output = run("print -5;");
      expect(output).toEqual(["-5"]);
    });

    it("should negate negative numbers", () => {
      const output = run("let x = -10; print -x;");
      expect(output).toEqual(["10"]);
    });

    it("should apply logical not with !", () => {
      const output = run("print !true;");
      expect(output).toEqual(["false"]);
    });

    it("should apply logical not with 'not'", () => {
      const output = run("print not false;");
      expect(output).toEqual(["true"]);
    });

    it("should double negate", () => {
      const output = run("print !!true;");
      expect(output).toEqual(["true"]);
    });
  });

  describe("binary operators", () => {
    it("should subtract numbers", () => {
      const output = run("print 10 - 3;");
      expect(output).toEqual(["7"]);
    });

    it("should multiply numbers", () => {
      const output = run("print 4 * 5;");
      expect(output).toEqual(["20"]);
    });

    it("should divide numbers", () => {
      const output = run("print 20 / 4;");
      expect(output).toEqual(["5"]);
    });

    it("should handle modulo", () => {
      const output = run("print 17 % 5;");
      expect(output).toEqual(["2"]);
    });

    it("should compare with greater than", () => {
      const output = run("print 5 > 3;");
      expect(output).toEqual(["true"]);
    });

    it("should compare with greater than or equal", () => {
      const output = run("print 5 >= 5;");
      expect(output).toEqual(["true"]);
    });

    it("should compare with less than", () => {
      const output = run("print 3 < 5;");
      expect(output).toEqual(["true"]);
    });

    it("should compare with less than or equal", () => {
      const output = run("print 5 <= 5;");
      expect(output).toEqual(["true"]);
    });

    it("should check equality", () => {
      const output = run("print 5 == 5;");
      expect(output).toEqual(["true"]);
    });

    it("should check inequality", () => {
      const output = run("print 5 != 3;");
      expect(output).toEqual(["true"]);
    });

    it("should handle operator precedence", () => {
      const output = run("print 2 + 3 * 4;");
      expect(output).toEqual(["14"]);
    });
  });

  describe("truthiness", () => {
    it("should treat 0 as falsy", () => {
      const output = run("if (0) { print 1; } else { print 0; }");
      expect(output).toEqual(["0"]);
    });

    it("should treat non-zero numbers as truthy", () => {
      const output = run("if (42) { print 1; } else { print 0; }");
      expect(output).toEqual(["1"]);
    });

    it("should treat empty array as falsy", () => {
      const output = run("if ([]) { print 1; } else { print 0; }");
      expect(output).toEqual(["0"]);
    });

    it("should treat non-empty array as truthy", () => {
      const output = run("if ([1]) { print 1; } else { print 0; }");
      expect(output).toEqual(["1"]);
    });

    it("should treat nil as falsy", () => {
      const output = run("if (nil) { print 1; } else { print 0; }");
      expect(output).toEqual(["0"]);
    });

    it("should treat strings as truthy", () => {
      const output = run(
        'if ("hello") { print 1; } else { print 0; }',
      );
      expect(output).toEqual(["1"]);
    });
  });

  describe("logical operators", () => {
    it("should handle or operator", () => {
      const output = run("print false or true;");
      expect(output).toEqual(["true"]);
    });

    it("should handle || operator", () => {
      const output = run("print false || true;");
      expect(output).toEqual(["true"]);
    });

    it("should short-circuit and when left is false", () => {
      const output = run(`
        fun sideEffect() { print "called"; return true; }
        print false and sideEffect();
      `);
      expect(output).toEqual(["false"]);
    });

    it("should short-circuit or when left is true", () => {
      const output = run(`
        fun sideEffect() { print "called"; return false; }
        print true or sideEffect();
      `);
      expect(output).toEqual(["true"]);
    });

    it("should evaluate right side of and when left is true", () => {
      const output = run(`
        fun sideEffect() { print "called"; return true; }
        print true and sideEffect();
      `);
      expect(output).toEqual(["called", "true"]);
    });

    it("should evaluate right side of or when left is false", () => {
      const output = run(`
        fun sideEffect() { print "called"; return true; }
        print false or sideEffect();
      `);
      expect(output).toEqual(["called", "true"]);
    });
  });

  describe("arrays", () => {
    it("should concatenate arrays", () => {
      const output = run(
        "let a = [1, 2]; let b = [3, 4]; print (a + b)[2];",
      );
      expect(output).toEqual(["3"]);
    });

    it("should set array elements", () => {
      const output = run(
        "let arr = [1, 2, 3]; arr[1] = 99; print arr[1];",
      );
      expect(output).toEqual(["99"]);
    });

    it("should handle nested arrays", () => {
      const output = run(
        "let arr = [[1, 2], [3, 4]]; print arr[1][0];",
      );
      expect(output).toEqual(["3"]);
    });

    it("should handle empty arrays", () => {
      const output = run("let arr = []; print arr;");
      expect(output).toEqual(["[]"]);
    });
  });

  describe("functions", () => {
    it("should return nil when no return value", () => {
      const output = run(
        "fun noReturn() { let x = 1; } print noReturn();",
      );
      expect(output).toEqual(["nil"]);
    });

    it("should handle closures", () => {
      const output = run(`
        fun makeCounter() {
          let count = 0;
          fun increment() {
            count = count + 1;
            return count;
          }
          return increment;
        }
        let counter = makeCounter();
        print counter();
        print counter();
        print counter();
      `);
      expect(output).toEqual(["1", "2", "3"]);
    });

    it("should handle recursion", () => {
      const output = run(`
        fun fib(n) {
          if (n <= 1) { return n; }
          return fib(n - 1) + fib(n - 2);
        }
        print fib(10);
      `);
      expect(output).toEqual(["55"]);
    });

    it("should handle mutual recursion", () => {
      const output = run(`
        fun isEven(n) {
          if (n == 0) { return true; }
          return isOdd(n - 1);
        }
        fun isOdd(n) {
          if (n == 0) { return false; }
          return isEven(n - 1);
        }
        print isEven(4);
        print isOdd(5);
      `);
      expect(output).toEqual(["true", "true"]);
    });
  });

  describe("classes", () => {
    it("should handle class without init", () => {
      const output = run(`
        class Point {
          getX() { return this.x; }
        }
        let p = Point();
        p.x = 10;
        print p.getX();
      `);
      expect(output).toEqual(["10"]);
    });

    it("should handle method returning this for chaining", () => {
      const output = run(`
        class Builder {
          init() { this.value = 0; }
          add(n) { this.value = this.value + n; return this; }
          getValue() { return this.value; }
        }
        let b = Builder();
        print b.add(1).add(2).add(3).getValue();
      `);
      expect(output).toEqual(["6"]);
    });

    it("should handle initializer returning this implicitly", () => {
      const output = run(`
        class Foo {
          init() {
            this.x = 42;
            return;
          }
        }
        let f = Foo();
        print f.x;
      `);
      expect(output).toEqual(["42"]);
    });

    it("should handle inherited methods", () => {
      const output = run(`
        class A {
          greet() { print "A"; }
        }
        class B inherits A {}
        let b = B();
        b.greet();
      `);
      expect(output).toEqual(["A"]);
    });

    it("should handle method overriding", () => {
      const output = run(`
        class A {
          greet() { print "A"; }
        }
        class B inherits A {
          greet() { print "B"; }
        }
        let b = B();
        b.greet();
      `);
      expect(output).toEqual(["B"]);
    });
  });

  describe("runtime errors", () => {
    it("should error on division by zero", () => {
      expectRuntimeError("print 10 / 0;", "Division by zero.");
    });

    it("should error on array index out of bounds", () => {
      expectRuntimeError(
        "let arr = [1, 2, 3]; print arr[5];",
        "Index out of bounds.",
      );
    });

    it("should error on negative array index", () => {
      expectRuntimeError(
        "let arr = [1, 2, 3]; let i = -1; print arr[i];",
        "Index must be a non-negative integer.",
      );
    });

    it("should error on non-integer array index", () => {
      expectRuntimeError(
        "let arr = [1, 2, 3]; print arr[1.5];",
        "Index must be a non-negative integer.",
      );
    });

    it("should error on string index out of bounds", () => {
      expectRuntimeError(
        'let s = "hi"; print s[10];',
        "Index out of bounds.",
      );
    });

    it("should error when calling non-callable", () => {
      expectRuntimeError(
        "let x = 5; x();",
        "Can only call functions and classes.",
      );
    });

    it("should error on wrong number of arguments", () => {
      expectRuntimeError(
        "fun f(a, b) {} f(1);",
        "Expected 2 arguments but got 1.",
      );
    });

    it("should error when adding number and string", () => {
      expectRuntimeError(
        'print 1 + "hello";',
        "Operands must both be numbers, strings or arrays.",
      );
    });

    it("should error when negating non-number", () => {
      expectRuntimeError(
        'print -"hello";',
        "Operand must be a number.",
      );
    });

    it("should error when comparing non-numbers", () => {
      expectRuntimeError(
        'print "a" > "b";',
        "Operands must be numbers.",
      );
    });

    it("should error when getting property on non-instance", () => {
      expectRuntimeError(
        "let x = 5; print x.foo;",
        "Only instances have properties.",
      );
    });

    it("should error when setting property on non-instance", () => {
      expectRuntimeError(
        "let x = 5; x.foo = 10;",
        "Only instances have fields.",
      );
    });

    it("should error when indexing non-array/string", () => {
      expectRuntimeError(
        "let x = 5; print x[0];",
        "Only arrays and strings can be indexed.",
      );
    });

    it("should error when subtracting non-numbers", () => {
      expectRuntimeError(
        'print "a" - "b";',
        "Operands must be numbers.",
      );
    });

    it("should error when multiplying non-numbers", () => {
      expectRuntimeError(
        'print "a" * 2;',
        "Operands must be numbers.",
      );
    });

    it("should error when dividing non-numbers", () => {
      expectRuntimeError(
        'print "a" / 2;',
        "Operands must be numbers.",
      );
    });

    it("should error when using modulo with non-numbers", () => {
      expectRuntimeError(
        'print "a" % 2;',
        "Operands must be numbers.",
      );
    });

    it("should error when using >= with non-numbers", () => {
      expectRuntimeError(
        'print "a" >= "b";',
        "Operands must be numbers.",
      );
    });

    it("should error when using < with non-numbers", () => {
      expectRuntimeError(
        'print "a" < "b";',
        "Operands must be numbers.",
      );
    });

    it("should error when using <= with non-numbers", () => {
      expectRuntimeError(
        'print "a" <= "b";',
        "Operands must be numbers.",
      );
    });

    it("should error when accessing undefined variable", () => {
      expectRuntimeError(
        "print undefinedVar;",
        "Undefined variable 'undefinedVar'.",
      );
    });

    it("should error when accessing undefined property on instance", () => {
      expectRuntimeError(
        "class A {} let a = A(); print a.nonexistent;",
        "Undefined property 'nonexistent'.",
      );
    });

    it("should error when setting array index out of bounds", () => {
      expectRuntimeError(
        "let arr = [1, 2]; arr[10] = 5;",
        "Index out of bounds.",
      );
    });

    it("should error when using non-number as array index", () => {
      expectRuntimeError(
        'let arr = [1, 2]; print arr["foo"];',
        "Index must be a number.",
      );
    });

    it("should error when using non-number as array set index", () => {
      expectRuntimeError(
        'let arr = [1, 2]; arr["foo"] = 5;',
        "Index must be a number.",
      );
    });

    it("should error on inheriting from non-class", () => {
      expectRuntimeError(
        "let x = 5; class A inherits x {}",
        "'inherits' target must be a 'class'.",
      );
    });
  });

  describe("printing", () => {
    it("should print function representation", () => {
      const output = run(
        "fun greet(name) { print name; } print greet;",
      );
      expect(output).toEqual(["<fn greet(name)>"]);
    });

    it("should print class representation", () => {
      const output = run("class MyClass {} print MyClass;");
      expect(output).toEqual(["MyClass"]);
    });

    it("should print instance representation", () => {
      const output = run("class Foo {} let f = Foo(); print f;");
      expect(output).toEqual(["<instanceof Foo>"]);
    });

    it("should print array with elements", () => {
      const output = run('print [1, "two", true];');
      expect(output).toEqual(["[1, two, true]"]);
    });

    it("should print nested arrays", () => {
      const output = run("print [[1, 2], [3, 4]];");
      expect(output).toEqual(["[[1, 2], [3, 4]]"]);
    });
  });

  describe("equality", () => {
    it("should compare nil values as equal", () => {
      const output = run("print nil == nil;");
      expect(output).toEqual(["true"]);
    });

    it("should compare nil to non-nil as not equal", () => {
      const output = run("print nil == 5;");
      expect(output).toEqual(["false"]);
    });

    it("should compare non-nil to nil as not equal", () => {
      const output = run("print 5 == nil;");
      expect(output).toEqual(["false"]);
    });

    it("should compare strings by value", () => {
      const output = run('print "hello" == "hello";');
      expect(output).toEqual(["true"]);
    });

    it("should compare booleans by value", () => {
      const output = run("print true == true;");
      expect(output).toEqual(["true"]);
    });

    it("should use != for not equal", () => {
      const output = run("print 1 != 2;");
      expect(output).toEqual(["true"]);
    });

    it("should compare different types as not equal", () => {
      const output = run('print 1 == "1";');
      expect(output).toEqual(["false"]);
    });
  });

  describe("scoping", () => {
    it("should handle nested scope variable shadowing", () => {
      const output = run(`
        let x = 1;
        {
          let x = 2;
          print x;
        }
        print x;
      `);
      expect(output).toEqual(["2", "1"]);
    });

    it("should handle variable assignment in nested scope", () => {
      const output = run(`
        let x = 1;
        {
          x = 2;
        }
        print x;
      `);
      expect(output).toEqual(["2"]);
    });

    it("should access variable from enclosing scope", () => {
      const output = run(`
        let outer = "outer";
        {
          let inner = "inner";
          print outer;
          print inner;
        }
      `);
      expect(output).toEqual(["outer", "inner"]);
    });
  });

  describe("standard library functions", () => {
    describe("abs", () => {
      it("should return absolute value of positive number", () => {
        const output = run("print abs(5);");
        expect(output).toEqual(["5"]);
      });

      it("should return absolute value of negative number", () => {
        const output = run("print abs(-5);");
        expect(output).toEqual(["5"]);
      });

      it("should return zero for zero", () => {
        const output = run("print abs(0);");
        expect(output).toEqual(["0"]);
      });

      it("should handle floating point numbers", () => {
        const output = run("print abs(-3.14);");
        expect(output).toEqual(["3.14"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'abs("hello");',
          "Argument to 'abs' must be a number.",
        );
      });
    });

    describe("max", () => {
      it("should return the larger of two numbers", () => {
        const output = run("print max(3, 7);");
        expect(output).toEqual(["7"]);
      });

      it("should return first when equal", () => {
        const output = run("print max(5, 5);");
        expect(output).toEqual(["5"]);
      });

      it("should handle negative numbers", () => {
        const output = run("print max(-10, -3);");
        expect(output).toEqual(["-3"]);
      });

      it("should handle floating point numbers", () => {
        const output = run("print max(2.5, 2.7);");
        expect(output).toEqual(["2.7"]);
      });

      it("should error when called with non-numbers", () => {
        expectRuntimeError(
          'max(1, "hello");',
          "Arguments to 'max' must be numbers.",
        );
      });
    });

    describe("min", () => {
      it("should return the smaller of two numbers", () => {
        const output = run("print min(3, 7);");
        expect(output).toEqual(["3"]);
      });

      it("should return first when equal", () => {
        const output = run("print min(5, 5);");
        expect(output).toEqual(["5"]);
      });

      it("should handle negative numbers", () => {
        const output = run("print min(-10, -3);");
        expect(output).toEqual(["-10"]);
      });

      it("should handle floating point numbers", () => {
        const output = run("print min(2.5, 2.7);");
        expect(output).toEqual(["2.5"]);
      });

      it("should error when called with non-numbers", () => {
        expectRuntimeError(
          'min(1, "hello");',
          "Arguments to 'min' must be numbers.",
        );
      });
    });

    describe("ceil", () => {
      it("should round up to nearest integer", () => {
        const output = run("print ceil(3.2);");
        expect(output).toEqual(["4"]);
      });

      it("should return same value for integers", () => {
        const output = run("print ceil(5);");
        expect(output).toEqual(["5"]);
      });

      it("should handle negative numbers", () => {
        const output = run("print ceil(-3.7);");
        expect(output).toEqual(["-3"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'ceil("hello");',
          "Argument to 'ceil' must be a number.",
        );
      });
    });

    describe("floor", () => {
      it("should round down to nearest integer", () => {
        const output = run("print floor(3.7);");
        expect(output).toEqual(["3"]);
      });

      it("should return same value for integers", () => {
        const output = run("print floor(5);");
        expect(output).toEqual(["5"]);
      });

      it("should handle negative numbers", () => {
        const output = run("print floor(-3.2);");
        expect(output).toEqual(["-4"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'floor("hello");',
          "Argument to 'floor' must be a number.",
        );
      });
    });

    describe("pow", () => {
      it("should compute power of two numbers", () => {
        const output = run("print pow(2, 3);");
        expect(output).toEqual(["8"]);
      });

      it("should handle zero exponent", () => {
        const output = run("print pow(5, 0);");
        expect(output).toEqual(["1"]);
      });

      it("should handle negative exponent", () => {
        const output = run("print pow(2, -1);");
        expect(output).toEqual(["0.5"]);
      });

      it("should handle fractional exponent", () => {
        const output = run("print pow(4, 0.5);");
        expect(output).toEqual(["2"]);
      });

      it("should error when called with non-numbers", () => {
        expectRuntimeError(
          'pow(2, "hello");',
          "Arguments to 'pow' must be numbers.",
        );
      });
    });

    describe("sqrt", () => {
      it("should compute square root", () => {
        const output = run("print sqrt(16);");
        expect(output).toEqual(["4"]);
      });

      it("should handle zero", () => {
        const output = run("print sqrt(0);");
        expect(output).toEqual(["0"]);
      });

      it("should handle non-perfect squares", () => {
        const output = run("print sqrt(2);");
        expect(output).toEqual(["1.4142135623730951"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'sqrt("hello");',
          "Argument to 'sqrt' must be a number.",
        );
      });
    });

    describe("rand", () => {
      it("should return number within range", () => {
        const output = run(`
          let r = rand(0, 10);
          print r >= 0 and r <= 10;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when min > max", () => {
        expectRuntimeError(
          "rand(10, 5);",
          "First argument to 'rand' must be less than or equal to second argument.",
        );
      });

      it("should error when called with non-numbers", () => {
        expectRuntimeError(
          'rand(1, "hello");',
          "Arguments to 'rand' must be numbers.",
        );
      });
    });

    describe("randint", () => {
      it("should return integer within range", () => {
        const output = run(`
          let r = randint(1, 10);
          print r >= 1 and r <= 10 and isint(r);
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when min > max", () => {
        expectRuntimeError(
          "randint(10, 5);",
          "First argument to 'randInt' must be less than or equal to second argument.",
        );
      });

      it("should error when called with non-numbers", () => {
        expectRuntimeError(
          'randint(1, "hello");',
          "Arguments to 'randint' must be numbers.",
        );
      });
    });

    describe("isint", () => {
      it("should return true for integer", () => {
        const output = run("print isint(5);");
        expect(output).toEqual(["true"]);
      });

      it("should return false for float", () => {
        const output = run("print isint(5.5);");
        expect(output).toEqual(["false"]);
      });

      it("should return true for negative integer", () => {
        const output = run("print isint(-3);");
        expect(output).toEqual(["true"]);
      });

      it("should return true for zero", () => {
        const output = run("print isint(0);");
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'isint("hello");',
          "Argument to 'isint' must be a number.",
        );
      });
    });

    describe("typeof", () => {
      it("should return 'number' for numbers", () => {
        const output = run("print typeof(42);");
        expect(output).toEqual(["number"]);
      });

      it("should return 'string' for strings", () => {
        const output = run('print typeof("hello");');
        expect(output).toEqual(["string"]);
      });

      it("should return 'array' for arrays", () => {
        const output = run("print typeof([1, 2, 3]);");
        expect(output).toEqual(["array"]);
      });

      it("should return 'function' for functions", () => {
        const output = run("fun f() {} print typeof(f);");
        expect(output).toEqual(["function"]);
      });

      it("should return 'instance' for class instances", () => {
        const output = run("class A {} print typeof(A());");
        expect(output).toEqual(["instance"]);
      });

      it("should return 'nil' for nil", () => {
        const output = run("print typeof(nil);");
        expect(output).toEqual(["nil"]);
      });
    });

    describe("len", () => {
      it("should return length of string", () => {
        const output = run('print len("hello");');
        expect(output).toEqual(["5"]);
      });

      it("should return length of array", () => {
        const output = run("print len([1, 2, 3, 4]);");
        expect(output).toEqual(["4"]);
      });

      it("should return 0 for empty string", () => {
        const output = run('print len("");');
        expect(output).toEqual(["0"]);
      });

      it("should return 0 for empty array", () => {
        const output = run("print len([]);");
        expect(output).toEqual(["0"]);
      });

      it("should error when called with non-string/array", () => {
        expectRuntimeError(
          "len(42);",
          "Argument to 'len' must be a string or array.",
        );
      });
    });

    describe("now", () => {
      it("should return a number", () => {
        const output = run("print typeof(now());");
        expect(output).toEqual(["number"]);
      });

      it("should return increasing values", () => {
        const output = run(`
          let t1 = now();
          let t2 = now();
          print t2 >= t1;
        `);
        expect(output).toEqual(["true"]);
      });
    });

    describe("index_of", () => {
      it("should find index in string", () => {
        const output = run('print index_of("hello", "l");');
        expect(output).toEqual(["2"]);
      });

      it("should return -1 for not found in string", () => {
        const output = run('print index_of("hello", "x");');
        expect(output).toEqual(["-1"]);
      });

      it("should find index in array", () => {
        const output = run("print index_of([10, 20, 30], 20);");
        expect(output).toEqual(["1"]);
      });

      it("should return -1 for not found in array", () => {
        const output = run("print index_of([1, 2, 3], 99);");
        expect(output).toEqual(["-1"]);
      });

      it("should error when first arg is not string or array", () => {
        expectRuntimeError(
          'index_of(42, "x");',
          "First argument to 'index_of' must be a string or array.",
        );
      });

      it("should error when searching string with non-string", () => {
        expectRuntimeError(
          'index_of("hello", 42);',
          "Second argument to 'index_of' must be a string when the first argument is a string.",
        );
      });
    });

    describe("ord", () => {
      it("should return ASCII code of character", () => {
        const output = run('print ord("A");');
        expect(output).toEqual(["65"]);
      });

      it("should handle lowercase", () => {
        const output = run('print ord("a");');
        expect(output).toEqual(["97"]);
      });

      it("should error for multi-character string", () => {
        expectRuntimeError(
          'ord("ab");',
          "'ord' function expects a single character string",
        );
      });

      it("should error for non-string", () => {
        expectRuntimeError(
          "ord(65);",
          "'ord' function expects a string literal",
        );
      });
    });

    describe("str", () => {
      it("should convert number to string", () => {
        const output = run("print str(42);");
        expect(output).toEqual(["42"]);
      });

      it("should convert boolean to string", () => {
        const output = run("print str(true);");
        expect(output).toEqual(["true"]);
      });

      it("should convert nil to string", () => {
        const output = run("print str(nil);");
        expect(output).toEqual(["nil"]);
      });

      it("should convert array to string", () => {
        const output = run("print str([1, 2, 3]);");
        expect(output).toEqual(["[1, 2, 3]"]);
      });
    });

    describe("substr", () => {
      it("should extract substring", () => {
        const output = run('print substr("hello", 1, 3);');
        expect(output).toEqual(["ell"]);
      });

      it("should extract from beginning", () => {
        const output = run('print substr("hello", 0, 2);');
        expect(output).toEqual(["he"]);
      });

      it("should error on out of bounds", () => {
        expectRuntimeError(
          'substr("hello", 3, 10);',
          "'substr' function indices are out of bounds",
        );
      });

      it("should error on negative start", () => {
        expectRuntimeError(
          'substr("hello", -1, 2);',
          "'substr' function indices are out of bounds",
        );
      });

      it("should error for non-string first arg", () => {
        expectRuntimeError(
          "substr(123, 0, 2);",
          "'substr' function expects a string as the first argument",
        );
      });
    });

    describe("replace", () => {
      it("should replace first occurrence", () => {
        const output = run('print replace("hello", "l", "L");');
        expect(output).toEqual(["heLlo"]);
      });

      it("should return original if not found", () => {
        const output = run('print replace("hello", "x", "y");');
        expect(output).toEqual(["hello"]);
      });

      it("should error for non-string args", () => {
        expectRuntimeError(
          'replace(123, "a", "b");',
          "'replace' function expects a string as the first argument",
        );
      });
    });

    describe("replace_all", () => {
      it("should replace all occurrences", () => {
        const output = run('print replace_all("hello", "l", "L");');
        expect(output).toEqual(["heLLo"]);
      });

      it("should return original if not found", () => {
        const output = run('print replace_all("hello", "x", "y");');
        expect(output).toEqual(["hello"]);
      });

      it("should error for non-string args", () => {
        expectRuntimeError(
          'replace_all(123, "a", "b");',
          "'replace_all' function expects a string as the first argument",
        );
      });
    });

    describe("push", () => {
      it("should add element to array", () => {
        const output = run(`
          let arr = [1, 2];
          push(arr, 3);
          print arr;
        `);
        expect(output).toEqual(["[1, 2, 3]"]);
      });

      it("should mutate the original array", () => {
        const output = run(`
          let arr = [1, 2];
          push(arr, 3);
          print len(arr);
        `);
        expect(output).toEqual(["3"]);
      });

      it("should return the modified array", () => {
        const output = run(`
          let arr = [1];
          print push(arr, 2);
        `);
        expect(output).toEqual(["[1, 2]"]);
      });

      it("should error for non-array first arg", () => {
        expectRuntimeError(
          'push("hello", 1);',
          "First argument to push must be an array",
        );
      });
    });

    describe("pop", () => {
      it("should remove and return last element", () => {
        const output = run(`
          let arr = [1, 2, 3];
          print pop(arr);
        `);
        expect(output).toEqual(["3"]);
      });

      it("should mutate the original array", () => {
        const output = run(`
          let arr = [1, 2, 3];
          pop(arr);
          print arr;
        `);
        expect(output).toEqual(["[1, 2]"]);
      });

      it("should reduce array length after pop", () => {
        const output = run(`
          let arr = [1, 2, 3];
          pop(arr);
          print len(arr);
        `);
        expect(output).toEqual(["2"]);
      });

      it("should return nil for empty array", () => {
        const output = run(`
          let arr = [];
          print pop(arr);
        `);
        expect(output).toEqual(["nil"]);
      });

      it("should allow multiple pops", () => {
        const output = run(`
          let arr = [1, 2, 3];
          pop(arr);
          pop(arr);
          print arr;
        `);
        expect(output).toEqual(["[1]"]);
      });

      it("should error for non-array arg", () => {
        expectRuntimeError(
          'pop("hello");',
          "First argument to pop must be an array",
        );
      });
    });

    describe("join", () => {
      it("should join array elements with separator", () => {
        const output = run('print join([1, 2, 3], "-");');
        expect(output).toEqual(["1-2-3"]);
      });

      it("should join string elements", () => {
        const output = run('print join(["a", "b", "c"], ", ");');
        expect(output).toEqual(["a, b, c"]);
      });

      it("should handle empty separator", () => {
        const output = run('print join([1, 2, 3], "");');
        expect(output).toEqual(["123"]);
      });

      it("should return empty string for empty array", () => {
        const output = run('print join([], "-");');
        expect(output).toEqual([""]);
      });

      it("should handle single element array", () => {
        const output = run('print join([42], ",");');
        expect(output).toEqual(["42"]);
      });

      it("should convert mixed types to strings", () => {
        const output = run('print join([1, "two", true], " ");');
        expect(output).toEqual(["1 two true"]);
      });

      it("should error when first argument is not an array", () => {
        expectRuntimeError(
          'join("hello", "-");',
          "'join' function expects an array as the first argument",
        );
      });

      it("should error when second argument is not a string", () => {
        expectRuntimeError(
          "join([1, 2], 3);",
          "'join' function expects a string as the second argument",
        );
      });
    });

    describe("slice", () => {
      it("should slice array from start to end", () => {
        const output = run("print slice([1, 2, 3, 4, 5], 1, 4);");
        expect(output).toEqual(["[2, 3, 4]"]);
      });

      it("should slice from beginning", () => {
        const output = run("print slice([1, 2, 3, 4, 5], 0, 3);");
        expect(output).toEqual(["[1, 2, 3]"]);
      });

      it("should slice to end", () => {
        const output = run("print slice([1, 2, 3, 4, 5], 3, 5);");
        expect(output).toEqual(["[4, 5]"]);
      });

      it("should return empty array when start equals end", () => {
        const output = run("print slice([1, 2, 3], 1, 1);");
        expect(output).toEqual(["[]"]);
      });

      it("should handle negative indices", () => {
        const output = run("print slice([1, 2, 3, 4, 5], -2, 5);");
        expect(output).toEqual(["[4, 5]"]);
      });

      it("should return entire array copy", () => {
        const output = run(`
          let arr = [1, 2, 3];
          let sliced = slice(arr, 0, 3);
          push(sliced, 4);
          print arr;
        `);
        expect(output).toEqual(["[1, 2, 3]"]);
      });

      it("should error when first argument is not an array", () => {
        expectRuntimeError(
          'slice("hello", 0, 2);',
          "'slice' function expects an array as the first argument",
        );
      });

      it("should error when second argument is not a number", () => {
        expectRuntimeError(
          'slice([1, 2, 3], "0", 2);',
          "'slice' function expects a number as the second argument",
        );
      });

      it("should error when third argument is not a number", () => {
        expectRuntimeError(
          'slice([1, 2, 3], 0, "2");',
          "'slice' function expects a number as the third argument",
        );
      });
    });

    describe("reversed", () => {
      it("should return reversed copy of array", () => {
        const output = run("print reversed([1, 2, 3]);");
        expect(output).toEqual(["[3, 2, 1]"]);
      });

      it("should not mutate original array", () => {
        const output = run(`
          let arr = [1, 2, 3];
          let rev = reversed(arr);
          print arr;
        `);
        expect(output).toEqual(["[1, 2, 3]"]);
      });

      it("should handle empty array", () => {
        const output = run("print reversed([]);");
        expect(output).toEqual(["[]"]);
      });

      it("should handle single element array", () => {
        const output = run("print reversed([42]);");
        expect(output).toEqual(["[42]"]);
      });

      it("should handle string elements", () => {
        const output = run('print reversed(["a", "b", "c"]);');
        expect(output).toEqual(["[c, b, a]"]);
      });

      it("should error when argument is not an array", () => {
        expectRuntimeError(
          'reversed("hello");',
          "'reversed' function expects an array as the argument",
        );
      });
    });

    describe("round", () => {
      it("should round down for .4", () => {
        const output = run("print round(3.4);");
        expect(output).toEqual(["3"]);
      });

      it("should round up for .5", () => {
        const output = run("print round(3.5);");
        expect(output).toEqual(["4"]);
      });

      it("should round up for .6", () => {
        const output = run("print round(3.6);");
        expect(output).toEqual(["4"]);
      });

      it("should return integer unchanged", () => {
        const output = run("print round(5);");
        expect(output).toEqual(["5"]);
      });

      it("should handle negative numbers", () => {
        const output = run("print round(-2.5);");
        expect(output).toEqual(["-2"]);
      });

      it("should handle zero", () => {
        const output = run("print round(0);");
        expect(output).toEqual(["0"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'round("hello");',
          "Argument to 'round' must be a number.",
        );
      });
    });

    describe("sign", () => {
      it("should return 1 for positive numbers", () => {
        const output = run("print sign(42);");
        expect(output).toEqual(["1"]);
      });

      it("should return -1 for negative numbers", () => {
        const output = run("print sign(-42);");
        expect(output).toEqual(["-1"]);
      });

      it("should return 0 for zero", () => {
        const output = run("print sign(0);");
        expect(output).toEqual(["0"]);
      });

      it("should handle floating point numbers", () => {
        const output = run("print sign(0.001);");
        expect(output).toEqual(["1"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'sign("hello");',
          "Argument to 'sign' must be a number.",
        );
      });
    });

    describe("sin", () => {
      it("should return 0 for sin(0)", () => {
        const output = run("print sin(0);");
        expect(output).toEqual(["0"]);
      });

      it("should return 1 for sin(PI/2)", () => {
        const output = run("print sin(1.5707963267948966);");
        expect(output).toEqual(["1"]);
      });

      it("should handle negative angles", () => {
        const output = run("print sin(-1.5707963267948966);");
        expect(output).toEqual(["-1"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'sin("hello");',
          "Argument to 'sin' must be a number.",
        );
      });
    });

    describe("cos", () => {
      it("should return 1 for cos(0)", () => {
        const output = run("print cos(0);");
        expect(output).toEqual(["1"]);
      });

      it("should return approximately 0 for cos(PI/2)", () => {
        const output = run(`
          let result = cos(1.5707963267948966);
          print result < 0.0001 and result > -0.0001;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should return -1 for cos(PI)", () => {
        const output = run("print cos(3.141592653589793);");
        expect(output).toEqual(["-1"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'cos("hello");',
          "Argument to 'cos' must be a number.",
        );
      });
    });

    describe("tan", () => {
      it("should return 0 for tan(0)", () => {
        const output = run("print tan(0);");
        expect(output).toEqual(["0"]);
      });

      it("should return approximately 1 for tan(PI/4)", () => {
        const output = run(`
          let result = tan(0.7853981633974483);
          print result > 0.9999 and result < 1.0001;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'tan("hello");',
          "Argument to 'tan' must be a number.",
        );
      });
    });

    describe("asin", () => {
      it("should return 0 for asin(0)", () => {
        const output = run("print asin(0);");
        expect(output).toEqual(["0"]);
      });

      it("should return PI/2 for asin(1)", () => {
        const output = run(`
          let result = asin(1);
          print result > 1.57 and result < 1.58;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should handle negative values", () => {
        const output = run(`
          let result = asin(-1);
          print result < -1.57 and result > -1.58;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'asin("hello");',
          "Argument to 'asin' must be a number.",
        );
      });
    });

    describe("acos", () => {
      it("should return 0 for acos(1)", () => {
        const output = run("print acos(1);");
        expect(output).toEqual(["0"]);
      });

      it("should return PI/2 for acos(0)", () => {
        const output = run(`
          let result = acos(0);
          print result > 1.57 and result < 1.58;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should return PI for acos(-1)", () => {
        const output = run(`
          let result = acos(-1);
          print result > 3.14 and result < 3.15;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'acos("hello");',
          "Argument to 'acos' must be a number.",
        );
      });
    });

    describe("atan", () => {
      it("should return 0 for atan(0)", () => {
        const output = run("print atan(0);");
        expect(output).toEqual(["0"]);
      });

      it("should return PI/4 for atan(1)", () => {
        const output = run(`
          let result = atan(1);
          print result > 0.785 and result < 0.786;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should handle negative values", () => {
        const output = run(`
          let result = atan(-1);
          print result < -0.785 and result > -0.786;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'atan("hello");',
          "Argument to 'atan' must be a number.",
        );
      });
    });

    describe("atan2", () => {
      it("should return 0 for atan2(0, 1)", () => {
        const output = run("print atan2(0, 1);");
        expect(output).toEqual(["0"]);
      });

      it("should return PI/2 for atan2(1, 0)", () => {
        const output = run(`
          let result = atan2(1, 0);
          print result > 1.57 and result < 1.58;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should return PI for atan2(0, -1)", () => {
        const output = run(`
          let result = atan2(0, -1);
          print result > 3.14 and result < 3.15;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should handle both negative values", () => {
        const output = run(`
          let result = atan2(-1, -1);
          print result < -2.35 and result > -2.36;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-numbers", () => {
        expectRuntimeError(
          'atan2(1, "hello");',
          "Arguments to 'atan2' must be numbers.",
        );
      });

      it("should error when first arg is not a number", () => {
        expectRuntimeError(
          'atan2("hello", 1);',
          "Arguments to 'atan2' must be numbers.",
        );
      });
    });

    describe("log", () => {
      it("should return 0 for log(1)", () => {
        const output = run("print log(1);");
        expect(output).toEqual(["0"]);
      });

      it("should return 1 for log(e)", () => {
        const output = run(`
          let result = log(2.718281828459045);
          print result > 0.999 and result < 1.001;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should return approximately 2.3 for log(10)", () => {
        const output = run(`
          let result = log(10);
          print result > 2.30 and result < 2.31;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'log("hello");',
          "Argument to 'log' must be a number.",
        );
      });
    });

    describe("log10", () => {
      it("should return 0 for log10(1)", () => {
        const output = run("print log10(1);");
        expect(output).toEqual(["0"]);
      });

      it("should return 1 for log10(10)", () => {
        const output = run("print log10(10);");
        expect(output).toEqual(["1"]);
      });

      it("should return 2 for log10(100)", () => {
        const output = run("print log10(100);");
        expect(output).toEqual(["2"]);
      });

      it("should return 3 for log10(1000)", () => {
        const output = run("print log10(1000);");
        expect(output).toEqual(["3"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'log10("hello");',
          "Argument to 'log10' must be a number.",
        );
      });
    });

    describe("log2", () => {
      it("should return 0 for log2(1)", () => {
        const output = run("print log2(1);");
        expect(output).toEqual(["0"]);
      });

      it("should return 1 for log2(2)", () => {
        const output = run("print log2(2);");
        expect(output).toEqual(["1"]);
      });

      it("should return 3 for log2(8)", () => {
        const output = run("print log2(8);");
        expect(output).toEqual(["3"]);
      });

      it("should return 10 for log2(1024)", () => {
        const output = run("print log2(1024);");
        expect(output).toEqual(["10"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'log2("hello");',
          "Argument to 'log2' must be a number.",
        );
      });
    });

    describe("exp", () => {
      it("should return 1 for exp(0)", () => {
        const output = run("print exp(0);");
        expect(output).toEqual(["1"]);
      });

      it("should return e for exp(1)", () => {
        const output = run(`
          let result = exp(1);
          print result > 2.718 and result < 2.719;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should return e^2 for exp(2)", () => {
        const output = run(`
          let result = exp(2);
          print result > 7.38 and result < 7.39;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should handle negative exponents", () => {
        const output = run(`
          let result = exp(-1);
          print result > 0.367 and result < 0.369;
        `);
        expect(output).toEqual(["true"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'exp("hello");',
          "Argument to 'exp' must be a number.",
        );
      });
    });

    describe("char", () => {
      it("should convert ASCII code to character", () => {
        const output = run("print char(65);");
        expect(output).toEqual(["A"]);
      });

      it("should handle lowercase letters", () => {
        const output = run("print char(97);");
        expect(output).toEqual(["a"]);
      });

      it("should handle space character", () => {
        const output = run("print char(32);");
        expect(output).toEqual([" "]);
      });

      it("should handle digits", () => {
        const output = run("print char(48);");
        expect(output).toEqual(["0"]);
      });

      it("should be inverse of ord", () => {
        const output = run('print char(ord("Z"));');
        expect(output).toEqual(["Z"]);
      });

      it("should error when called with non-number", () => {
        expectRuntimeError(
          'char("hello");',
          "'char' function expects a number",
        );
      });
    });

    describe("upper", () => {
      it("should convert to uppercase", () => {
        const output = run('print upper("hello");');
        expect(output).toEqual(["HELLO"]);
      });

      it("should handle mixed case", () => {
        const output = run('print upper("HeLLo WoRLd");');
        expect(output).toEqual(["HELLO WORLD"]);
      });

      it("should leave uppercase unchanged", () => {
        const output = run('print upper("HELLO");');
        expect(output).toEqual(["HELLO"]);
      });

      it("should handle empty string", () => {
        const output = run('print upper("");');
        expect(output).toEqual([""]);
      });

      it("should preserve non-alphabetic characters", () => {
        const output = run('print upper("hello123!");');
        expect(output).toEqual(["HELLO123!"]);
      });

      it("should error when called with non-string", () => {
        expectRuntimeError(
          "upper(123);",
          "'upper' function expects a string",
        );
      });
    });

    describe("lower", () => {
      it("should convert to lowercase", () => {
        const output = run('print lower("HELLO");');
        expect(output).toEqual(["hello"]);
      });

      it("should handle mixed case", () => {
        const output = run('print lower("HeLLo WoRLd");');
        expect(output).toEqual(["hello world"]);
      });

      it("should leave lowercase unchanged", () => {
        const output = run('print lower("hello");');
        expect(output).toEqual(["hello"]);
      });

      it("should handle empty string", () => {
        const output = run('print lower("");');
        expect(output).toEqual([""]);
      });

      it("should preserve non-alphabetic characters", () => {
        const output = run('print lower("HELLO123!");');
        expect(output).toEqual(["hello123!"]);
      });

      it("should error when called with non-string", () => {
        expectRuntimeError(
          "lower(123);",
          "'lower' function expects a string",
        );
      });
    });

    describe("trim", () => {
      it("should remove leading whitespace", () => {
        const output = run('print trim("  hello");');
        expect(output).toEqual(["hello"]);
      });

      it("should remove trailing whitespace", () => {
        const output = run('print trim("hello  ");');
        expect(output).toEqual(["hello"]);
      });

      it("should remove both leading and trailing whitespace", () => {
        const output = run('print trim("  hello  ");');
        expect(output).toEqual(["hello"]);
      });

      it("should preserve inner whitespace", () => {
        const output = run('print trim("  hello world  ");');
        expect(output).toEqual(["hello world"]);
      });

      it("should handle empty string", () => {
        const output = run('print trim("");');
        expect(output).toEqual([""]);
      });

      it("should handle string with only whitespace", () => {
        const output = run('print trim("   ");');
        expect(output).toEqual([""]);
      });

      it("should handle tabs and newlines", () => {
        const output = run('print trim("\thello\n");');
        expect(output).toEqual(["hello"]);
      });

      it("should error when called with non-string", () => {
        expectRuntimeError(
          "trim(123);",
          "'trim' function expects a string",
        );
      });
    });

    describe("split", () => {
      it("should split string by separator", () => {
        const output = run('print split("a,b,c", ",");');
        expect(output).toEqual(["[a, b, c]"]);
      });

      it("should split by space", () => {
        const output = run('print split("hello world", " ");');
        expect(output).toEqual(["[hello, world]"]);
      });

      it("should handle empty separator (split each char)", () => {
        const output = run('print split("abc", "");');
        expect(output).toEqual(["[a, b, c]"]);
      });

      it("should return single element array when separator not found", () => {
        const output = run('print split("hello", ",");');
        expect(output).toEqual(["[hello]"]);
      });

      it("should handle empty string", () => {
        const output = run('print split("", ",");');
        expect(output).toEqual(["[]"]);
      });

      it("should handle multi-character separator", () => {
        const output = run('print split("a::b::c", "::");');
        expect(output).toEqual(["[a, b, c]"]);
      });

      it("should create array elements that are strings", () => {
        const output = run(`
          let parts = split("1,2,3", ",");
          print typeof(parts[0]);
        `);
        expect(output).toEqual(["string"]);
      });

      it("should error when first argument is not a string", () => {
        expectRuntimeError(
          'split(123, ",");',
          "'split' function expects a string as the first argument",
        );
      });

      it("should error when second argument is not a string", () => {
        expectRuntimeError(
          'split("hello", 123);',
          "'split' function expects a string as the second argument",
        );
      });
    });

    describe("contains", () => {
      it("should return true when string contains substring", () => {
        const output = run('print contains("hello world", "world");');
        expect(output).toEqual(["true"]);
      });

      it("should return false when string does not contain substring", () => {
        const output = run('print contains("hello world", "foo");');
        expect(output).toEqual(["false"]);
      });

      it("should handle empty substring", () => {
        const output = run('print contains("hello", "");');
        expect(output).toEqual(["true"]);
      });

      it("should return true when array contains element", () => {
        const output = run("print contains([1, 2, 3], 2);");
        expect(output).toEqual(["true"]);
      });

      it("should return false when array does not contain element", () => {
        const output = run("print contains([1, 2, 3], 99);");
        expect(output).toEqual(["false"]);
      });

      it("should find string in array", () => {
        const output = run('print contains(["a", "b", "c"], "b");');
        expect(output).toEqual(["true"]);
      });

      it("should handle empty array", () => {
        const output = run("print contains([], 1);");
        expect(output).toEqual(["false"]);
      });

      it("should use equality check for arrays", () => {
        const output = run('print contains([1, "2", 3], 2);');
        expect(output).toEqual(["false"]);
      });

      it("should error when first argument is not string or array", () => {
        expectRuntimeError(
          "contains(123, 1);",
          "First argument to 'contains' must be a string or array.",
        );
      });

      it("should error when searching string with non-string", () => {
        expectRuntimeError(
          'contains("hello", 123);',
          "Second argument to 'contains' must be a string when the first argument is a string.",
        );
      });
    });

    describe("range", () => {
      it("should generate range from 0 to n", () => {
        const output = run("print range(0, 5);");
        expect(output).toEqual(["[0, 1, 2, 3, 4]"]);
      });

      it("should generate range from start to end", () => {
        const output = run("print range(3, 7);");
        expect(output).toEqual(["[3, 4, 5, 6]"]);
      });

      it("should return empty array when start equals end", () => {
        const output = run("print range(5, 5);");
        expect(output).toEqual(["[]"]);
      });

      it("should return empty array when start > end", () => {
        const output = run("print range(10, 5);");
        expect(output).toEqual(["[]"]);
      });

      it("should handle negative start", () => {
        const output = run("print range(-3, 2);");
        expect(output).toEqual(["[-3, -2, -1, 0, 1]"]);
      });

      it("should handle negative range", () => {
        const output = run("print range(-5, -2);");
        expect(output).toEqual(["[-5, -4, -3]"]);
      });

      it("should work in for loop", () => {
        const output = run(`
          let sum = 0;
          for (let i = 0; i < len(range(1, 4)); i = i + 1) {
            sum = sum + range(1, 4)[i];
          }
          print sum;
        `);
        expect(output).toEqual(["6"]);
      });

      it("should error when first argument is not a number", () => {
        expectRuntimeError(
          'range("0", 5);',
          "First argument to 'range' must be a number.",
        );
      });

      it("should error when second argument is not a number", () => {
        expectRuntimeError(
          'range(0, "5");',
          "Second argument to 'range' must be a number.",
        );
      });
    });
  });

  describe("resolution errors", () => {
    it("should error on 'this' outside of class", () => {
      expectResolutionError(
        "print this;",
        "Cannot use 'this' outside of a class.",
      );
    });

    it("should error on 'super' outside of class", () => {
      expectResolutionError(
        "super.foo();",
        "Cannot use 'super' outside of a class.",
      );
    });

    it("should error on 'super' in class without superclass", () => {
      expectResolutionError(
        "class A { foo() { super.bar(); } }",
        "Cannot use 'super' in a class with no superclass.",
      );
    });

    it("should error on return from top-level", () => {
      expectResolutionError(
        "return 5;",
        "Cannot return from top-level code.",
      );
    });

    it("should error on return value from initializer", () => {
      expectResolutionError(
        "class A { init() { return 5; } }",
        "Cannot return a value from an initializer.",
      );
    });

    it("should error on variable redeclaration in same scope", () => {
      expectResolutionError(
        "{ let x = 1; let x = 2; }",
        "Variable with name 'x' already declared in this scope.",
      );
    });

    it("should error on reading variable in its own initializer", () => {
      expectResolutionError(
        "{ let x = x; }",
        "Cannot read local variable 'x' in its own initializer.",
      );
    });

    it("should error on class inheriting from itself", () => {
      expectResolutionError(
        "class A inherits A {}",
        "A class cannot inherit from itself.",
      );
    });

    it("should error on 'break' outside of loop", () => {
      expectResolutionError(
        "break;",
        "Cannot use 'break' outside of a loop.",
      );
    });

    it("should error on 'continue' outside of loop", () => {
      expectResolutionError(
        "continue;",
        "Cannot use 'continue' outside of a loop.",
      );
    });

    it("should error on 'break' in function but outside loop", () => {
      expectResolutionError(
        "fun f() { break; }",
        "Cannot use 'break' outside of a loop.",
      );
    });
  });
});
