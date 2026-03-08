import { describe, it, expect } from "vitest";
import { fileURLToPath } from "url";
import { executeRun } from "../../src/cli/commands/run";

function fixture(name: string): string {
  return fileURLToPath(
    new URL(`../fixtures/${name}`, import.meta.url),
  );
}

describe("executeRun (integration)", () => {
  describe("success cases", () => {
    it("should run hello.ls and print Hello, World!", () => {
      const result = executeRun(fixture("hello.ls"));

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Hello, World!");
      expect(
        result.stdout.some((l) => l.startsWith("Finished in")),
      ).toBe(true);
      expect(result.stderr).toEqual([]);
    });

    it("should run fibonacci.ls and output the first 8 Fibonacci numbers", () => {
      const result = executeRun(fixture("fibonacci.ls"));

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toEqual(
        expect.arrayContaining([
          "0",
          "1",
          "1",
          "2",
          "3",
          "5",
          "8",
          "13",
        ]),
      );
      expect(result.stderr).toEqual([]);
    });

    it("should run counter_class.ls and output 3", () => {
      const result = executeRun(fixture("counter_class.ls"));

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("3");
      expect(result.stderr).toEqual([]);
    });
  });

  describe("error cases", () => {
    it("should run runtime_error.ls and return exitCode 1 with a Division by zero error", () => {
      const result = executeRun(fixture("runtime_error.ls"));

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("Division by zero")),
      ).toBe(true);
      expect(result.stdout).toEqual([]);
    });

    it("should run syntax_error.ls and return exitCode 1 with a syntax error", () => {
      const result = executeRun(fixture("syntax_error.ls"));

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("Expect ';'")),
      ).toBe(true);
      expect(result.stdout).toEqual([]);
    });
  });

  describe("--spec option", () => {
    it("should run spanish.ls with spanish_spec.json and output the expected values", () => {
      const result = executeRun(
        fixture("spanish.ls"),
        fixture("spanish_spec.json"),
      );

      expect(result.exitCode).toBe(0);
      expect(
        result.stdout.some((l) => l.includes("Using spec from")),
      ).toBe(true);
      expect(result.stdout).toContain("Hola, Mundo!");
      expect(result.stdout).toContain("7");
      expect(result.stderr).toEqual([]);
    });
  });

  describe("file-not-found cases", () => {
    it("should return exitCode 1 when the source file does not exist", () => {
      const result = executeRun("/nonexistent/path/program.ls");

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("File does not exist")),
      ).toBe(true);
      expect(result.stdout).toEqual([]);
    });

    it("should return exitCode 1 when the spec file does not exist", () => {
      const result = executeRun(
        fixture("hello.ls"),
        "/nonexistent/path/spec.json",
      );

      expect(result.exitCode).toBe(1);
      expect(
        result.stderr.some((l) => l.includes("File does not exist")),
      ).toBe(true);
      expect(result.stdout).toEqual([]);
    });
  });
});
