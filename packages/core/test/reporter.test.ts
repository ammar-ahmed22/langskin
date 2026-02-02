import { Reporter } from "../src/reporter/reporter";
import { LangError } from "../src/errors/error";
import { ErrorPhase, LangErrorProps } from "../src/errors/types";
import { describe, it, expect, vi } from "vitest";

describe("Reporter", () => {
  describe("errors", () => {
    it("should start with no errors", () => {
      const reporter = new Reporter();
      expect(reporter.hasErrors()).toBe(false);
      expect(reporter.getErrors()).toEqual([]);
    });

    it("should collect reported errors", () => {
      const reporter = new Reporter();
      const props: LangErrorProps = {
        phase: ErrorPhase.Lexical,
        message: "Test error",
        line: 1,
        column: 0,
      };

      reporter.report(props);

      expect(reporter.hasErrors()).toBe(true);
      expect(reporter.getErrors()).toHaveLength(1);
      const error = reporter.getErrors()[0];
      expect(error.phase).toBe(props.phase);
      expect(error.message).toBe(props.message);
      expect(error.line).toBe(props.line);
      expect(error.column).toBe(props.column);
    });

    it("should collect multiple errors", () => {
      const reporter = new Reporter();

      reporter.report({
        phase: ErrorPhase.Lexical,
        message: "Error 1",
        line: 1,
        column: 0,
      });
      reporter.report({
        phase: ErrorPhase.Syntax,
        message: "Error 2",
        line: 2,
        column: 5,
      });

      expect(reporter.getErrors()).toHaveLength(2);
    });

    it("should check errors by phase", () => {
      const reporter = new Reporter();

      reporter.report({
        phase: ErrorPhase.Lexical,
        message: "Lexical error",
        line: 1,
        column: 0,
      });

      expect(reporter.hasErrorsInPhase(ErrorPhase.Lexical)).toBe(
        true,
      );
      expect(reporter.hasErrorsInPhase(ErrorPhase.Syntax)).toBe(
        false,
      );
      expect(reporter.hasErrorsInPhase(ErrorPhase.Runtime)).toBe(
        false,
      );
    });

    it("should clear errors", () => {
      const reporter = new Reporter();

      reporter.report({
        phase: ErrorPhase.Lexical,
        message: "Error",
        line: 1,
        column: 0,
      });

      expect(reporter.hasErrors()).toBe(true);

      reporter.clearErrors();

      expect(reporter.hasErrors()).toBe(false);
      expect(reporter.getErrors()).toEqual([]);
    });

    it("should return a copy of errors array", () => {
      const reporter = new Reporter();
      const props: LangErrorProps = {
        phase: ErrorPhase.Lexical,
        message: "Error",
        line: 1,
        column: 0,
      };

      reporter.report(props);
      const errors = reporter.getErrors();
      errors.push(
        new LangError({
          phase: ErrorPhase.Syntax,
          message: "Pushed externally",
          line: 2,
          column: 0,
        }),
      );

      expect(reporter.getErrors()).toHaveLength(1);
    });

    it("should invoke callback on report", () => {
      const callback = vi.fn();
      const reporter = new Reporter({ onError: callback });
      const props: LangErrorProps = {
        phase: ErrorPhase.Lexical,
        message: "Error",
        line: 1,
        column: 0,
      };

      reporter.report(props);

      expect(callback).toHaveBeenCalledTimes(1);
      const calledWith = callback.mock.calls[0][0] as LangError;
      expect(calledWith.phase).toBe(props.phase);
      expect(calledWith.message).toBe(props.message);
    });

    it("should work without callback", () => {
      const reporter = new Reporter();
      const props: LangErrorProps = {
        phase: ErrorPhase.Lexical,
        message: "Error",
        line: 1,
        column: 0,
      };

      expect(() => reporter.report(props)).not.toThrow();
    });
  });

  describe("output", () => {
    it("should start with no output", () => {
      const reporter = new Reporter();
      expect(reporter.getOutput()).toEqual([]);
    });

    it("should collect written output", () => {
      const reporter = new Reporter();
      reporter.write("hello");
      reporter.write("world");
      expect(reporter.getOutput()).toEqual(["hello", "world"]);
    });

    it("should clear output", () => {
      const reporter = new Reporter();
      reporter.write("hello");
      expect(reporter.getOutput()).toHaveLength(1);

      reporter.clearOutput();
      expect(reporter.getOutput()).toEqual([]);
    });

    it("should return a copy of output array", () => {
      const reporter = new Reporter();
      reporter.write("hello");

      const output = reporter.getOutput();
      output.push("pushed externally");

      expect(reporter.getOutput()).toHaveLength(1);
    });

    it("should invoke callback on write", () => {
      const callback = vi.fn();
      const reporter = new Reporter({ onOutput: callback });

      reporter.write("hello");

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith("hello");
    });
  });

  describe("status", () => {
    it("should report succeeded when no errors", () => {
      const reporter = new Reporter();
      expect(reporter.succeeded()).toBe(true);
      expect(reporter.failed()).toBe(false);
    });

    it("should report failed when has errors", () => {
      const reporter = new Reporter();
      reporter.report({
        phase: ErrorPhase.Lexical,
        message: "Error",
        line: 1,
        column: 0,
      });

      expect(reporter.succeeded()).toBe(false);
      expect(reporter.failed()).toBe(true);
    });
  });

  describe("clear", () => {
    it("should clear both errors and output", () => {
      const reporter = new Reporter();
      reporter.report({
        phase: ErrorPhase.Lexical,
        message: "Error",
        line: 1,
        column: 0,
      });
      reporter.write("hello");

      reporter.clear();

      expect(reporter.hasErrors()).toBe(false);
      expect(reporter.getOutput()).toEqual([]);
    });
  });

  describe("formattedErrors", () => {
    it("should return empty array when no errors", () => {
      const reporter = new Reporter();
      expect(reporter.formattedErrors()).toEqual([]);
    });

    it("should return formatted error strings", () => {
      const reporter = new Reporter();
      reporter.report({
        phase: ErrorPhase.Lexical,
        message: "Unterminated string.",
        line: 1,
        column: 5,
      });
      reporter.report({
        phase: ErrorPhase.Syntax,
        message: "Expect ';' after value.",
        line: 2,
        column: 10,
        lexeme: "print",
      });

      const formatted = reporter.formattedErrors();

      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toBe(
        "[Lexical Error] line 1, column 5: Unterminated string.",
      );
      expect(formatted[1]).toBe(
        "[Syntax Error] line 2, column 10 (at 'print'): Expect ';' after value.",
      );
    });
  });
});

describe("LangError", () => {
  describe("format", () => {
    it("should format error without lexeme", () => {
      const error = new LangError({
        phase: ErrorPhase.Lexical,
        message: "Unterminated string.",
        line: 1,
        column: 5,
      });

      expect(error.format()).toBe(
        "[Lexical Error] line 1, column 5: Unterminated string.",
      );
    });

    it("should format error with lexeme", () => {
      const error = new LangError({
        phase: ErrorPhase.Syntax,
        message: "Expect ';' after value.",
        line: 2,
        column: 10,
        lexeme: "print",
      });

      expect(error.format()).toBe(
        "[Syntax Error] line 2, column 10 (at 'print'): Expect ';' after value.",
      );
    });

    it("should format runtime error", () => {
      const error = new LangError({
        phase: ErrorPhase.Runtime,
        message: "Division by zero.",
        line: 5,
        column: 8,
        lexeme: "/",
      });

      expect(error.format()).toBe(
        "[Runtime Error] line 5, column 8 (at '/'): Division by zero.",
      );
    });
  });
});
