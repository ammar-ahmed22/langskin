import { vi, describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "fs";
import { executeRun } from "../../src/cli/commands/run";

vi.mock("fs");

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

beforeEach(() => {
  vi.resetAllMocks();
});

describe("executeRun", () => {
  describe("source file handling", () => {
    it("should return exitCode 1 when source file does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      const result = executeRun("/mock/source.ls");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "Cannot open file /mock/source.ls: File does not exist",
      );
      expect(result.stdout).toEqual([]);
    });

    it("should return exitCode 0 and output when source file runs successfully", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue('print "hello";' as never);

      const result = executeRun("/mock/source.ls");

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("hello");
      expect(
        result.stdout.some((l) => l.startsWith("Finished in")),
      ).toBe(true);
      expect(result.stderr).toEqual([]);
    });

    it("should return exitCode 1 and formatted errors when source file has errors", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue("print 10 / 0;" as never);

      const result = executeRun("/mock/source.ls");

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("Division by zero")),
      ).toBe(true);
      expect(result.stdout).toEqual([]);
    });
  });

  describe("--spec option", () => {
    it("should return exitCode 1 when spec file does not exist", () => {
      mockExistsSync
        .mockReturnValueOnce(true) // source exists
        .mockReturnValueOnce(false); // spec does not exist
      mockReadFileSync.mockReturnValue('print "hello";' as never);

      const result = executeRun("/mock/source.ls", "/mock/spec.json");

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "Cannot open file /mock/spec.json: File does not exist",
      );
    });

    it("should return exitCode 1 when spec file contains invalid JSON", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce('print "hello";' as never)
        .mockReturnValueOnce("not valid json {{{" as never);

      const result = executeRun("/mock/source.ls", "/mock/spec.json");

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("is not valid JSON")),
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

      const result = executeRun("/mock/source.ls", "/mock/spec.json");

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("is not a valid spec")),
      ).toBe(true);
    });

    it("should return exitCode 0 and include 'Using spec from' when spec is valid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync
        .mockReturnValueOnce("variable x = 42; print x;" as never)
        .mockReturnValueOnce(
          JSON.stringify({ keywords: { var: "variable" } }) as never,
        );

      const result = executeRun("/mock/source.ls", "/mock/spec.json");

      expect(result.exitCode).toBe(0);
      expect(
        result.stdout.some((l) => l.includes("Using spec from")),
      ).toBe(true);
      expect(result.stdout).toContain("42");
      expect(
        result.stdout.some((l) => l.startsWith("Finished in")),
      ).toBe(true);
      expect(result.stderr).toEqual([]);
    });
  });
});
