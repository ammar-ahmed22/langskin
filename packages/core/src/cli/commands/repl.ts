import pkg from "../../../package.json" assert { type: "json" };
import { Command } from "@commander-js/extra-typings";
import readline from "readline";
import chalk from "chalk";
import { writeFileSync } from "fs";
import { createLangskin, LangskinSession } from "../../";
import { CommandResult, stderr } from "../utils/";
import { readSpecFile } from "../utils/file";

export type ReplSetupResult =
  | [false, CommandResult]
  | [true, CommandResult, LangskinSession];

export function executeReplSetup(
  cwd: string,
  specPath?: string,
): ReplSetupResult {
  if (!specPath) {
    const lang = createLangskin();
    return [true, CommandResult.success(), lang.createSession()];
  }

  const [result, parsedSpec] = readSpecFile(cwd, specPath);
  if (result.failure()) {
    return [false, result];
  }

  const lang = createLangskin(parsedSpec!);
  return [
    true,
    CommandResult.success([
      stderr(chalk.blue(`Using spec from ${specPath}`)),
    ]),
    lang.createSession(),
  ];
}

function help() {
  const commands = [
    { cmd: ".help", desc: "Show this help message" },
    { cmd: ".exit", desc: "Exit the REPL" },
    {
      cmd: ".save <file>",
      desc: "Save the current session to a file (not implemented yet)",
    },
  ];
  function col(
    val: string,
    width: number,
    align: "left" | "right" = "left",
  ): string {
    if (val.length >= width) return val;
    const padding = " ".repeat(width - val.length);
    return align === "left" ? val + padding : padding + val;
  }
  console.log("Available commands:");
  const cmdWidth = Math.max(...commands.map((c) => c.cmd.length)) + 2;
  commands.forEach((c) =>
    console.log(`  ${col(c.cmd, cmdWidth)} ${c.desc}`),
  );
}

function welcome() {
  console.log(`Welcome to Langskin v${pkg.version}`);
  console.log(`Type your code and press Enter to execute.`);
  console.log(`Type '.help' for more information.`);
}

export function runRepl(
  rl: readline.Interface,
  session: LangskinSession,
) {
  welcome();
  rl.prompt();
  let inputBuffer: string[] = [];
  let blockDepth = 0;

  rl.on("line", (line) => {
    let input = line.trim();
    const lineForBuffer = line.trimEnd();

    if (input.split(" ")[0]!.toLowerCase() === ".save") {
      const parts = input.split(" ");
      if (parts.length < 2) {
        console.log(chalk.yellow("Usage: .save <filename>"));
        rl.prompt();
        return;
      }
      const filename = parts[1]!;
      const code = session.getHistory().join("\n");
      try {
        writeFileSync(filename, code, "utf-8");
        console.log(chalk.green(`Session saved to '${filename}'`));
      } catch (e) {
        console.error(
          chalk.red(
            `Failed to save to '${filename}': ${e instanceof Error ? e.message : String(e)}`,
          ),
        );
      }
      rl.prompt();
      return;
    }

    if (input.toLowerCase() === ".exit") {
      rl.close();
      return;
    }

    if (input.toLowerCase() === ".help") {
      help();
      rl.prompt();
      return;
    }

    if (input === "") {
      rl.prompt();
      return;
    }

    if (input.endsWith("{")) {
      inputBuffer.push(" ".repeat(blockDepth * 2) + lineForBuffer);
      blockDepth++;
      if (rl.getPrompt() !== "> ") {
        rl.setPrompt(rl.getPrompt().trim() + "... ");
      } else {
        rl.setPrompt("... ");
      }
      rl.prompt();
      return;
    }

    if (input.endsWith("}") && blockDepth > 0) {
      blockDepth--;
      inputBuffer.push(" ".repeat(blockDepth * 2) + lineForBuffer);
      if (blockDepth > 0) {
        rl.setPrompt(rl.getPrompt().slice(3));
        rl.prompt();
        return;
      }
      input = inputBuffer.join("\n");
      inputBuffer = [];
      rl.setPrompt("> ");
    } else if (blockDepth > 0) {
      inputBuffer.push(
        " ".repeat((blockDepth + 1) * 2) + lineForBuffer,
      );
      rl.prompt();
      return;
    }

    const reporter = session.run(input);
    if (reporter.failed()) {
      reporter
        .formattedErrors()
        .forEach((e) => console.error(chalk.red(e)));
    } else {
      reporter.getOutput().forEach((o) => console.log(o));
    }
    rl.prompt();
  }).on("close", () => {
    console.log("Exiting REPL. Goodbye!");
  });
}

export const replCommand = new Command("repl")
  .description("Start a REPL session for langskin")
  .option(
    "-s, --spec <path>",
    "The JSON spec file to skin the language with",
  )
  .action((options) => {
    const [isSuccessful, result, session] = executeReplSetup(
      process.cwd(),
      options.spec,
    );
    result.output.forEach((o) => {
      if (o.type === "stdout") {
        console.log(o.raw);
      } else {
        console.error(o.raw);
      }
    });
    if (!isSuccessful) {
      process.exit(result.exitCode);
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });
    runRepl(rl, session);
  });
