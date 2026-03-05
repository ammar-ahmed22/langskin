import { describe, it, expect } from "vitest";
import { createLangskin } from "../src/api/createLangskin";
import { ErrorPhase } from "../src/errors/types";

describe("createLangskin", () => {
  describe("default spec", () => {
    const lang = createLangskin();

    describe("error handling", () => {
      it("should report lexer errors", () => {
        const reporter = lang.run('"unterminated');

        expect(reporter.failed()).toBe(true);
        expect(reporter.hasErrorsInPhase(ErrorPhase.Lexical)).toBe(
          true,
        );
        const errors = reporter.getErrors();
        expect(errors[0].message).toBe("Unterminated string.");
      });

      it("should report syntax errors", () => {
        const reporter = lang.run("let x = 42");

        expect(reporter.failed()).toBe(true);
        expect(reporter.hasErrorsInPhase(ErrorPhase.Syntax)).toBe(
          true,
        );
        const errors = reporter.getErrors();
        expect(errors[0].message).toContain("Expect ';'");
      });

      it("should report resolution errors", () => {
        const reporter = lang.run("return 5;");

        expect(reporter.failed()).toBe(true);
        const errors = reporter.getErrors();
        expect(errors[0].message).toBe(
          "Cannot return from top-level code.",
        );
      });

      it("should report runtime errors", () => {
        const reporter = lang.run("print 10 / 0;");

        expect(reporter.failed()).toBe(true);
        const errors = reporter.getErrors();
        expect(errors[0].message).toBe("Division by zero.");
      });
    });

    describe("happy path", () => {
      it("should execute code and capture output", () => {
        const reporter = lang.run('print "hello";');

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["hello"]);
      });
    });
  });

  describe("custom keywords", () => {
    describe("happy path", () => {
      it("should use custom var keyword", () => {
        const lang = createLangskin({
          keywords: { var: "variable" },
        });
        const reporter = lang.run("variable x = 42; print x;");

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["42"]);
      });

      it("should use custom fun keyword", () => {
        const lang = createLangskin({
          keywords: { fun: "function" },
        });
        const reporter = lang.run(`
          function add(a, b) { return a + b; }
          print add(2, 3);
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["5"]);
      });

      it("should use custom class and this keywords", () => {
        const lang = createLangskin({
          keywords: { class: "tipo", this: "yo" },
        });
        const reporter = lang.run(`
          tipo Counter {
            init(start) { yo.count = start; }
            get() { return yo.count; }
          }
          let c = Counter(10);
          print c.get();
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["10"]);
      });

      it("should use custom control flow keywords", () => {
        const lang = createLangskin({
          keywords: { if: "si", else: "sino", while: "mientras" },
        });
        const reporter = lang.run(`
          let x = 5;
          si (x > 3) { print "big"; } sino { print "small"; }
          let i = 0;
          mientras (i < 3) { print i; i = i + 1; }
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["big", "0", "1", "2"]);
      });

      it("should use custom init method name", () => {
        const lang = createLangskin({
          keywords: { init: "constructor" },
        });
        const reporter = lang.run(`
          class Box {
            constructor(value) { this.value = value; }
          }
          let b = Box(99);
          print b.value;
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["99"]);
      });

      it("should use custom super and inherits keywords", () => {
        const lang = createLangskin({
          keywords: { super: "padre", inherits: "extiende" },
        });
        const reporter = lang.run(`
          class Animal {
            speak() { print "sound"; }
          }
          class Dog extiende Animal {
            speak() {
              padre.speak();
              print "bark";
            }
          }
          let d = Dog();
          d.speak();
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual(["sound", "bark"]);
      });

      it("should use custom logical operator keywords", () => {
        const lang = createLangskin({
          keywords: { and: "y", or: "o", not: "no" },
        });
        const reporter = lang.run(`
          print true y true;
          print true o false;
          print no false;
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual([
          "true",
          "true",
          "true",
        ]);
      });

      it("should use custom literal keywords", () => {
        const lang = createLangskin({
          keywords: { true: "verdad", false: "mentira", nil: "nada" },
        });
        const reporter = lang.run(`
          print verdad;
          print mentira;
          print nada;
        `);

        expect(reporter.succeeded()).toBe(true);
        expect(reporter.getOutput()).toEqual([
          "true",
          "false",
          "nil",
        ]);
      });
    });

    describe("error messages with custom keywords", () => {
      it("should use custom keyword in parser error", () => {
        const lang = createLangskin({
          keywords: { if: "si" },
        });
        const reporter = lang.run("si true) { print 1; }");

        expect(reporter.failed()).toBe(true);
        expect(reporter.getErrors()[0].message).toBe(
          "Expect '(' after 'si'.",
        );
      });

      it("should use custom keyword in resolver error for this", () => {
        const lang = createLangskin({
          keywords: { this: "yo" },
        });
        const reporter = lang.run("print yo;");

        expect(reporter.failed()).toBe(true);
        expect(reporter.getErrors()[0].message).toBe(
          "Cannot use 'yo' outside of a class.",
        );
      });

      it("should use custom keyword in resolver error for super", () => {
        const lang = createLangskin({
          keywords: { super: "padre" },
        });
        const reporter = lang.run("print padre.foo;");

        expect(reporter.failed()).toBe(true);
        expect(reporter.getErrors()[0].message).toBe(
          "Cannot use 'padre' outside of a class.",
        );
      });

      it("should use custom keyword in resolver error for break", () => {
        const lang = createLangskin({
          keywords: { break: "salir" },
        });
        const reporter = lang.run("salir;");

        expect(reporter.failed()).toBe(true);
        expect(reporter.getErrors()[0].message).toBe(
          "Cannot use 'salir' outside of a loop.",
        );
      });

      it("should use custom keyword in class error", () => {
        const lang = createLangskin({
          keywords: { class: "tipo" },
        });
        const reporter = lang.run("tipo {}");

        expect(reporter.failed()).toBe(true);
        expect(reporter.getErrors()[0].message).toBe(
          "Expect 'tipo' name.",
        );
      });
    });
  });
});
