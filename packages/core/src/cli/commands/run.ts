import { Command } from "@commander-js/extra-typings";
import prettyMs from "pretty-ms";
import chalk from "chalk";
import { createLangskin } from "../../";
import {
  Output,
  stdout,
  stderr,
  CommandResult,
  // exitWithError,
} from "../utils/";
import { performance } from "perf_hooks";
import { readFile, readSpecFile } from "../utils/file";

export function executeRun(
  cwd: string,
  filePath: string,
  specPath?: string,
): CommandResult {
  const [readFileResult, code] = readFile(cwd, filePath);
  if (readFileResult.failure()) {
    return readFileResult;
  }

  let spec = undefined;
  const output: Output[] = [];

  if (specPath !== undefined) {
    const [readSpecResult, parsedSpec] = readSpecFile(cwd, specPath);
    if (readSpecResult.failure()) {
      return readSpecResult;
    }
    output.push(stderr(chalk.blue(`Using spec from ${specPath}`)));
    spec = parsedSpec!;
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
    return CommandResult.success(output);
  } else {
    const result = CommandResult.error();
    reporter.formattedErrors().forEach((l) => result.addStderr(l));
    return result;
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
