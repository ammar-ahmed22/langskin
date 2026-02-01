import { ErrorReporter, LangError } from "../src/errors/reporter";
import { ErrorPhase, LangErrorProps } from "../src/errors/types";
import { describe, it, expect, vi } from "vitest";

describe("ErrorReporter", () => {
  it("should start with no errors", () => {
    const reporter = new ErrorReporter();
    expect(reporter.hasErrors()).toBe(false);
    expect(reporter.getErrors()).toEqual([]);
  });

  it("should collect reported errors", () => {
    const reporter = new ErrorReporter();
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
    const reporter = new ErrorReporter();

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
    const reporter = new ErrorReporter();

    reporter.report({
      phase: ErrorPhase.Lexical,
      message: "Lexical error",
      line: 1,
      column: 0,
    });

    expect(reporter.hasErrorsInPhase(ErrorPhase.Lexical)).toBe(true);
    expect(reporter.hasErrorsInPhase(ErrorPhase.Syntax)).toBe(false);
    expect(reporter.hasErrorsInPhase(ErrorPhase.Runtime)).toBe(false);
  });

  it("should clear errors", () => {
    const reporter = new ErrorReporter();

    reporter.report({
      phase: ErrorPhase.Lexical,
      message: "Error",
      line: 1,
      column: 0,
    });

    expect(reporter.hasErrors()).toBe(true);

    reporter.clear();

    expect(reporter.hasErrors()).toBe(false);
    expect(reporter.getErrors()).toEqual([]);
  });

  it("should return a copy of errors array", () => {
    const reporter = new ErrorReporter();
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
    const reporter = new ErrorReporter(callback);
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
    const reporter = new ErrorReporter();
    const props: LangErrorProps = {
      phase: ErrorPhase.Lexical,
      message: "Error",
      line: 1,
      column: 0,
    };

    expect(() => reporter.report(props)).not.toThrow();
  });
});
