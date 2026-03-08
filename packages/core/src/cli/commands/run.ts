import { Command } from "@commander-js/extra-typings";
import {
  createLangskin,
  createSpec,
  PartialLangskinSpec,
  validatePartialSpec,
} from "../../";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { performance } from "perf_hooks";

export type RunResult = {
  exitCode: number;
  stdout: string[];
  stderr: string[];
};

export function executeRun(
  resolvedFilePath: string,
  resolvedSpecPath?: string,
): RunResult {
  if (!existsSync(resolvedFilePath)) {
    return {
      exitCode: 1,
      stdout: [],
      stderr: [
        `Cannot open file ${resolvedFilePath}: File does not exist`,
      ],
    };
  }

  const code = readFileSync(resolvedFilePath, "utf-8");
  let spec = createSpec();
  const stdout: string[] = [];

  if (resolvedSpecPath !== undefined) {
    if (!existsSync(resolvedSpecPath)) {
      return {
        exitCode: 1,
        stdout: [],
        stderr: [
          `Cannot open file ${resolvedSpecPath}: File does not exist`,
        ],
      };
    }

    const specContent = readFileSync(resolvedSpecPath, "utf-8");
    let parsedPartialSpec: unknown;
    try {
      parsedPartialSpec = JSON.parse(specContent);
    } catch {
      return {
        exitCode: 1,
        stdout: [],
        stderr: [`'${resolvedSpecPath}' is not valid JSON`],
      };
    }

    const validation = validatePartialSpec(parsedPartialSpec);
    if (!validation.valid) {
      return {
        exitCode: 1,
        stdout: [],
        stderr: [
          `'${resolvedSpecPath}' is not a valid spec:`,
          ...validation.errors.map((e) => `  ${e}`),
        ],
      };
    }

    stdout.push(`Using spec from ${resolvedSpecPath}`);
    spec = createSpec(parsedPartialSpec as PartialLangskinSpec);
  }

  const lang = createLangskin(spec);
  const start = performance.now();
  const reporter = lang.run(code);
  const end = performance.now();

  if (reporter.succeeded()) {
    return {
      exitCode: 0,
      stdout: [
        ...stdout,
        ...reporter.getOutput(),
        `Finished in ${(end - start).toFixed(2)}ms`,
      ],
      stderr: [],
    };
  } else {
    return {
      exitCode: 1,
      stdout: [],
      stderr: reporter.formattedErrors(),
    };
  }
}

export const runCommand = new Command("run")
  .description("Run a langskin file")
  .argument("<file>", "The langskin file to run")
  .option(
    "-s, --spec <file>",
    "The JSON spec file to skin the language with",
  )
  .action((file, options) => {
    const cwd = process.cwd();
    const resolvedPath = path.resolve(cwd, file);
    const resolvedSpecPath = options.spec
      ? path.resolve(cwd, options.spec)
      : undefined;
    const result = executeRun(resolvedPath, resolvedSpecPath);
    result.stdout.forEach((l) => console.log(l));
    result.stderr.forEach((l) => console.error(l));
    process.exit(result.exitCode);
  });
