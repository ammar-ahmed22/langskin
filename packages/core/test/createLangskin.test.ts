import { describe, it, expect } from "vitest";
import { createLangskin } from "../src/api/createLangskin";
import { ErrorPhase } from "../src/errors/types";

describe("createLangskin", () => {
  const lang = createLangskin({});

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
      expect(reporter.hasErrorsInPhase(ErrorPhase.Syntax)).toBe(true);
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
