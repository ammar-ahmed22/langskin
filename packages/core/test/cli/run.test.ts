import { vi, describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "fs";
import { executeRun, RunResult } from "../../src/cli/commands/run";

vi.mock("fs");

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

beforeEach(() => {
  vi.resetAllMocks();
});

function getStdout(result: RunResult): string[] {
  return result.output
    .filter((o) => o.type === "stdout")
    .map((o) => o.raw);
}

function getStderr(result: RunResult): string[] {
  return result.output
    .filter((o) => o.type === "stderr")
    .map((o) => o.raw);
}

describe("executeRun", () => {
  describe("source file handling", () => {
    it("should return exitCode 1 when source file does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      const result = executeRun("/", "/mock/source.ls");

      expect(result.exitCode).toBe(1);
      expect(getStderr(result)).toContain(
        "Cannot open file /mock/source.ls: File does not exist",
      );
      expect(getStdout(result)).toEqual([]);
    });

    it("should return exitCode 0 and output when source file runs successfully", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('print "hello";' as never);

      const result = executeRun("/", "/mock/source.ls");

      expect(result.exitCode).toBe(0);
      expect(getStdout(result)).toContain("hello");
      expect(
        getStderr(result).some((l) => l.includes("Finished in")),
      ).toBe(true);
    });

    it("should return exitCode 1 and formatted errors when source file has errors", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue("print 10 / 0;" as never);

      const result = executeRun("/", "/mock/source.ls");

      expect(result.exitCode).toBe(1);
      expect(
        getStderr(result).some((l) => l.includes("Division by zero")),
      ).toBe(true);
      expect(getStdout(result)).toEqual([]);
    });
  });

  describe("--spec option", () => {
    it("should return exitCode 1 when spec file does not exist", () => {
      mockExistsSync
        .mockReturnValueOnce(true) // source exists
        .mockReturnValueOnce(false); // spec does not exist
      mockReadFileSync.mockReturnValue('print "hello";' as never);

      const result = executeRun(
        "/",
        "/mock/source.ls",
        "/mock/spec.json",
      );

      expect(result.exitCode).toBe(1);
      expect(getStderr(result)).toContain(
        "Cannot open file /mock/spec.json: File does not exist",
      );
    });

    it("should return exitCode 1 when spec file contains invalid JSON", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce('print "hello";' as never)
        .mockReturnValueOnce("not valid json {{{" as never);

      const result = executeRun(
        "/",
        "/mock/source.ls",
        "/mock/spec.json",
      );

      expect(result.exitCode).toBe(1);
      expect(
        getStderr(result).some((l) =>
          l.includes("is not valid JSON"),
        ),
      ).toBe(true);
    });

    it("should return exitCode 1 with validation errors when spec has invalid structure", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce('print "hello";' as never)
        .mockReturnValueOnce(
          JSON.stringify({
            keywords: { unknownKeyword: "foo" },
          }) as never,
        );

      const result = executeRun(
        "/",
        "/mock/source.ls",
        "/mock/spec.json",
      );

      expect(result.exitCode).toBe(1);
      expect(
        getStderr(result).some((l) =>
          l.includes("is not a valid spec"),
        ),
      ).toBe(true);
    });

    it("should return exitCode 0 and include 'Using spec from' when spec is valid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce("variable x = 42; print x;" as never)
        .mockReturnValueOnce(
          JSON.stringify({ keywords: { var: "variable" } }) as never,
        );

      const result = executeRun(
        "/",
        "/mock/source.ls",
        "/mock/spec.json",
      );

      expect(result.exitCode).toBe(0);
      expect(
        getStderr(result).some((l) => l.includes("Using spec from")),
      ).toBe(true);
      expect(getStdout(result)).toContain("42");
      expect(
        getStderr(result).some((l) => l.includes("Finished in")),
      ).toBe(true);
    });
  });
});
