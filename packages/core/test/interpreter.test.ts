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
