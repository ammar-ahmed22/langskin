import { Command } from "@commander-js/extra-typings";
import prettyMs from "pretty-ms";
import chalk from "chalk";
import {
  createLangskin,
  createSpec,
  PartialLangskinSpec,
  validatePartialSpec,
} from "../../";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { performance } from "perf_hooks";

export type Output = {
  type: "stdout" | "stderr";
  raw: string;
};

function stdout(line: string): Output {
  return { type: "stdout", raw: line };
}

function stderr(line: string): Output {
  return { type: "stderr", raw: line };
}

export type RunResult = {
  exitCode: number;
  output: Output[];
};

function exitWithError(message: string): RunResult {
  return {
    exitCode: 1,
    output: [stderr(message)],
  };
}

export function executeRun(
  cwd: string,
  filePath: string,
  specPath?: string,
): RunResult {
  const resolvedFilePath = path.resolve(cwd, filePath);
  const resolvedSpecPath = specPath
    ? path.resolve(cwd, specPath)
    : undefined;
  if (!existsSync(resolvedFilePath)) {
    return exitWithError(
      `Cannot open file ${filePath}: File does not exist`,
    );
  }

  const code = readFileSync(resolvedFilePath, "utf-8");
  let spec = createSpec();
  const output: Output[] = [];

  if (resolvedSpecPath !== undefined) {
    if (!existsSync(resolvedSpecPath)) {
      return exitWithError(
        `Cannot open file ${specPath}: File does not exist`,
      );
    }

    const specContent = readFileSync(resolvedSpecPath, "utf-8");
    let parsedPartialSpec: unknown;
    try {
      parsedPartialSpec = JSON.parse(specContent);
    } catch (e) {
      return exitWithError(
        `'${specPath}' is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    const validation = validatePartialSpec(parsedPartialSpec);
    if (!validation.valid) {
      return {
        exitCode: 1,
        output: [
          stderr(`'${resolvedSpecPath}' is not a valid spec:`),
          ...validation.errors.map((e) => stderr(`  ${e}`)),
        ],
      };
    }

    output.push(stderr(chalk.blue(`Using spec from ${specPath}`)));
    spec = createSpec(parsedPartialSpec as PartialLangskinSpec);
  }

  const lang = createLangskin(spec);
  const start = performance.now();
  const reporter = lang.run(code);
  const end = performance.now();

  if (reporter.succeeded()) {
    output.push(...reporter.getOutput().map((l) => stdout(l)));
    output.push(
      stderr(
        chalk.green(`\u2713 Finished in ${prettyMs(end - start)}`),
      ),
    );
    return {
      exitCode: 0,
      output,
    };
  } else {
    return {
      exitCode: 1,
      output: reporter.formattedErrors().map((l) => stderr(l)),
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
    const result = executeRun(cwd, file, options.spec);
    result.output.forEach((o) => {
      if (o.type === "stdout") {
        console.log(o.raw);
      } else {
        console.error(o.raw);
      }
    });
    process.exit(result.exitCode);
  });
