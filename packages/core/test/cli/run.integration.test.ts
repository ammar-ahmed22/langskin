import { describe, it, expect } from "vitest";
import { fileURLToPath } from "url";
import { executeRun, RunResult } from "../../src/cli/commands/run";

const fixturesDir = fileURLToPath(
  new URL("../fixtures", import.meta.url),
);

function fixture(name: string): string {
  return name;
}

function stdout(result: RunResult): string[] {
  return result.output
    .filter((o) => o.type === "stdout")
    .map((o) => o.raw);
}

function stderr(result: RunResult): string[] {
  return result.output
    .filter((o) => o.type === "stderr")
    .map((o) => o.raw);
}

describe("executeRun (integration)", () => {
  describe("success cases", () => {
    it("should run hello.ls and print Hello, World!", () => {
      const result = executeRun(fixturesDir, fixture("hello.ls"));

      expect(result.exitCode).toBe(0);
      expect(stdout(result)).toContain("Hello, World!");
      expect(
        stderr(result).some((l) => l.includes("Finished in")),
      ).toBe(true);
    });

    it("should run fibonacci.ls and output the first 8 Fibonacci numbers", () => {
      const result = executeRun(fixturesDir, fixture("fibonacci.ls"));

      expect(result.exitCode).toBe(0);
      expect(stdout(result)).toEqual(
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
    });

    it("should run counter_class.ls and output 3", () => {
      const result = executeRun(
        fixturesDir,
        fixture("counter_class.ls"),
      );

      expect(result.exitCode).toBe(0);
      expect(stdout(result)).toContain("3");
    });
  });

  describe("error cases", () => {
    it("should run runtime_error.ls and return exitCode 1 with a Division by zero error", () => {
      const result = executeRun(
        fixturesDir,
        fixture("runtime_error.ls"),
      );

      expect(result.exitCode).toBe(1);
      expect(
        stderr(result).some((l) => l.includes("Division by zero")),
      ).toBe(true);
      expect(stdout(result)).toEqual([]);
    });

    it("should run syntax_error.ls and return exitCode 1 with a syntax error", () => {
      const result = executeRun(
        fixturesDir,
        fixture("syntax_error.ls"),
      );

      expect(result.exitCode).toBe(1);
      expect(
        stderr(result).some((l) => l.includes("Expect ';'")),
      ).toBe(true);
      expect(stdout(result)).toEqual([]);
    });
  });

  describe("--spec option", () => {
    it("should run spanish.ls with spanish_spec.json and output the expected values", () => {
      const result = executeRun(
        fixturesDir,
        fixture("spanish.ls"),
        fixture("spanish_spec.json"),
      );

      expect(result.exitCode).toBe(0);
      expect(
        stderr(result).some((l) => l.includes("Using spec from")),
      ).toBe(true);
      expect(stdout(result)).toContain("Hola, Mundo!");
      expect(stdout(result)).toContain("7");
    });
  });

  describe("file-not-found cases", () => {
    it("should return exitCode 1 when the source file does not exist", () => {
      const result = executeRun(fixturesDir, "nonexistent.ls");

      expect(result.exitCode).toBe(1);
      expect(
        stderr(result).some((l) => l.includes("File does not exist")),
      ).toBe(true);
      expect(stdout(result)).toEqual([]);
    });

    it("should return exitCode 1 when the spec file does not exist", () => {
      const result = executeRun(
        fixturesDir,
        fixture("hello.ls"),
        "nonexistent_spec.json",
      );

      expect(result.exitCode).toBe(1);
      expect(
        stderr(result).some((l) => l.includes("File does not exist")),
      ).toBe(true);
      expect(stdout(result)).toEqual([]);
    });
  });
});
