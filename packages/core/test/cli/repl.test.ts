import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} from "vitest";
import { existsSync, readFileSync } from "fs";
import { executeReplSetup } from "@cli/commands/repl/setup";
import { runRepl } from "@cli/commands/repl/run";
import { createLangskin } from "@langskin";
import readline from "readline";

vi.mock("fs");

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// executeReplSetup
// ---------------------------------------------------------------------------

describe("executeReplSetup", () => {
  describe("no spec path", () => {
    it("should return success with no output messages", () => {
      const [isSuccessful, result] = executeReplSetup("/");

      expect(isSuccessful).toBe(true);
      expect(result.output).toEqual([]);
    });
  });

  describe("spec file handling", () => {
    it("should return exitCode 1 when spec file does not exist", () => {
      mockExistsSync.mockReturnValue(false);

      const [isSuccessful, result] = executeReplSetup(
        "/",
        "/mock/spec.json",
      );

      expect(isSuccessful).toBe(false);
      if (!isSuccessful) {
        expect(result.exitCode).toBe(1);
        expect(result.getStderr()).toContain(
          "Cannot open file /mock/spec.json: File does not exist",
        );
      }
    });

    it("should return exitCode 1 when spec file contains invalid JSON", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue("not valid json {{{" as never);

      const [isSuccessful, result] = executeReplSetup(
        "/",
        "/mock/spec.json",
      );

      expect(isSuccessful).toBe(false);
      if (!isSuccessful) {
        expect(result.exitCode).toBe(1);
        expect(
          result
            .getStderr()
            .some((l) => l.includes("is not valid JSON")),
        ).toBe(true);
      }
    });

    it("should return exitCode 1 with validation errors when spec has invalid structure", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({
          keywords: { unknownKeyword: "foo" },
        }) as never,
      );

      const [isSuccessful, result] = executeReplSetup(
        "/",
        "/mock/spec.json",
      );

      expect(isSuccessful).toBe(false);
      if (!isSuccessful) {
        expect(result.exitCode).toBe(1);
        expect(
          result
            .getStderr()
            .some((l) => l.includes("is not a valid spec")),
        ).toBe(true);
      }
    });

    it("should return success and include 'Using spec from' when spec is valid", () => {
      mockExistsSync.mockReturnValue(true);
      mockReadFileSync.mockReturnValue(
        JSON.stringify({ keywords: { var: "variable" } }) as never,
      );

      const [isSuccessful, result] = executeReplSetup(
        "/",
        "/mock/spec.json",
      );

      expect(isSuccessful).toBe(true);
      if (isSuccessful) {
        expect(
          result
            .getStderr()
            .some((l) => l.includes("Using spec from")),
        ).toBe(true);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// runRepl
// ---------------------------------------------------------------------------

describe("runRepl", () => {
  type HandlerMap = {
    line?: (line: string) => void;
    close?: () => void;
  };

  function createMockRl(): {
    rl: readline.Interface;
    handlers: HandlerMap;
    prompt: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    setPrompt: ReturnType<typeof vi.fn>;
    getPrompt: ReturnType<typeof vi.fn>;
  } {
    const handlers: HandlerMap = {};
    const prompt = vi.fn();
    const close = vi.fn();
    let currentPrompt = "> ";
    const setPrompt = vi.fn().mockImplementation((p: string) => {
      currentPrompt = p;
    });
    const getPrompt = vi.fn().mockImplementation(() => currentPrompt);
    const rl = {
      prompt,
      close,
      setPrompt,
      getPrompt,
      on: vi
        .fn()
        .mockImplementation((event: string, cb: () => void) => {
          handlers[event as keyof HandlerMap] = cb as never;
          return rl;
        }),
    } as unknown as readline.Interface;
    return { rl, handlers, prompt, close, setPrompt, getPrompt };
  }

  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, "log").mockImplementation(() => {}),
      error: vi.spyOn(console, "error").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  it("should print the welcome message and call rl.prompt() on start", () => {
    const { rl, prompt } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining("Welcome to Langskin"),
    );
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it("should re-prompt on empty input without producing any output", () => {
    const { rl, handlers, prompt } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    prompt.mockClear();
    consoleSpy.log.mockClear();

    handlers.line?.("   ");

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(consoleSpy.log).not.toHaveBeenCalled();
    expect(consoleSpy.error).not.toHaveBeenCalled();
  });

  it("should close the readline on '.exit'", () => {
    const { rl, handlers, close } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    handlers.line?.(".exit");

    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should close the readline on '.EXIT' (case-insensitive)", () => {
    const { rl, handlers, close } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    handlers.line?.(".EXIT");

    expect(close).toHaveBeenCalledTimes(1);
  });

  it("should display help and re-prompt on '.help'", () => {
    const { rl, handlers, prompt } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    prompt.mockClear();
    consoleSpy.log.mockClear();

    handlers.line?.(".help");

    const loggedLines: string[] = consoleSpy.log.mock.calls.map(
      (args: unknown[]) => args[0] as string,
    );
    expect(loggedLines).toContain("Available commands:");
    expect(loggedLines.some((l) => l.includes(".help"))).toBe(true);
    expect(loggedLines.some((l) => l.includes(".exit"))).toBe(true);
    expect(loggedLines.some((l) => l.includes(".save"))).toBe(true);
    expect(prompt).toHaveBeenCalledTimes(1);
    expect(consoleSpy.error).not.toHaveBeenCalled();
  });

  it("should display help on '.HELP' (case-insensitive)", () => {
    const { rl, handlers, prompt } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    prompt.mockClear();
    consoleSpy.log.mockClear();

    handlers.line?.(".HELP");

    const loggedLines = consoleSpy.log.mock.calls.map(
      (args: unknown[]) => args[0] as string,
    );
    expect(loggedLines).toContain("Available commands:");
    expect(prompt).toHaveBeenCalledTimes(1);
  });

  it("should log output to console.log for valid code", () => {
    const { rl, handlers } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    consoleSpy.log.mockClear();

    handlers.line?.('print "hello";');

    expect(consoleSpy.log).toHaveBeenCalledWith("hello");
    expect(consoleSpy.error).not.toHaveBeenCalled();
  });

  it("should log errors to console.error for code with a runtime error", () => {
    const { rl, handlers } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    consoleSpy.log.mockClear();

    handlers.line?.("print 10 / 0;");

    expect(
      (consoleSpy.error.mock.calls as string[][]).some((args) =>
        args.some((a) => a.includes("Division by zero")),
      ),
    ).toBe(true);
    expect(consoleSpy.log).not.toHaveBeenCalled();
  });

  it("should print goodbye message on 'close' event", () => {
    const { rl, handlers } = createMockRl();
    const session = createLangskin().createSession();

    runRepl(rl, session);
    consoleSpy.log.mockClear();

    handlers.close?.();

    expect(consoleSpy.log).toHaveBeenCalledWith(
      "Exiting REPL. Goodbye!",
    );
  });

  describe("multi-line block input", () => {
    it("should buffer a single block and execute when it closes", () => {
      const { rl, handlers, setPrompt } = createMockRl();
      const session = createLangskin().createSession();
      const runSpy = vi.spyOn(session, "run");

      runRepl(rl, session);
      runSpy.mockClear();

      handlers.line?.("outer {");
      expect(runSpy).not.toHaveBeenCalled();
      expect(setPrompt).toHaveBeenCalledWith("... ");

      handlers.line?.("x = 1;");
      expect(runSpy).not.toHaveBeenCalled();

      handlers.line?.("}");
      // middle lines get (blockDepth + 1) * 2 spaces of auto-indent (depth 1 → 4 spaces)
      expect(runSpy).toHaveBeenCalledWith("outer {\n    x = 1;\n}");
    });

    it("should not execute on an inner closing brace of nested blocks", () => {
      const { rl, handlers } = createMockRl();
      const session = createLangskin().createSession();
      const runSpy = vi.spyOn(session, "run");

      runRepl(rl, session);
      runSpy.mockClear();

      handlers.line?.("outer {");
      handlers.line?.("inner {"); // auto-indented to "  inner {"
      handlers.line?.("}"); // closes inner — must NOT execute, auto-indented to "  }"
      expect(runSpy).not.toHaveBeenCalled();

      handlers.line?.("x = 1;"); // auto-indented to "    x = 1;" (depth 1, middle line)
      expect(runSpy).not.toHaveBeenCalled();

      handlers.line?.("}"); // closes outer — MUST execute with full content
      expect(runSpy).toHaveBeenCalledWith(
        "outer {\n  inner {\n  }\n    x = 1;\n}",
      );
    });

    it("should handle three levels of nesting correctly", () => {
      const { rl, handlers } = createMockRl();
      const session = createLangskin().createSession();
      const runSpy = vi.spyOn(session, "run");

      runRepl(rl, session);
      runSpy.mockClear();

      handlers.line?.("a {");
      handlers.line?.("b {"); // auto-indented to "  b {"
      handlers.line?.("c {"); // auto-indented to "    c {"
      handlers.line?.("}"); // depth 3 → 2, no execute, auto-indented to "    }"
      expect(runSpy).not.toHaveBeenCalled();
      handlers.line?.("}"); // depth 2 → 1, no execute, auto-indented to "  }"
      expect(runSpy).not.toHaveBeenCalled();
      handlers.line?.("}"); // depth 1 → 0, execute
      expect(runSpy).toHaveBeenCalledWith(
        "a {\n  b {\n    c {\n    }\n  }\n}",
      );
    });

    it("should reset prompt to '> ' after block completes", () => {
      const { rl, handlers, setPrompt } = createMockRl();
      const session = createLangskin().createSession();

      runRepl(rl, session);
      setPrompt.mockClear();

      handlers.line?.("outer {");
      expect(setPrompt).toHaveBeenCalledWith("... ");
      setPrompt.mockClear();

      handlers.line?.("}");
      expect(setPrompt).toHaveBeenCalledWith("> ");
    });

    it("should keep '... ' prompt until outermost block closes", () => {
      const { rl, handlers, setPrompt } = createMockRl();
      const session = createLangskin().createSession();

      runRepl(rl, session);
      setPrompt.mockClear();

      handlers.line?.("outer {");
      handlers.line?.("inner {");
      setPrompt.mockClear();

      handlers.line?.("}"); // inner closes, depth still 1
      expect(setPrompt).not.toHaveBeenCalledWith("> ");
    });
  });
});
