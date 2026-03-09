import pkg from "../../../package.json" assert { type: "json" };
import { Command } from "@commander-js/extra-typings";
import readline from "readline";
import chalk from "chalk";
import path from "path";
import { existsSync, readFileSync, writeFileSync } from "fs";
import {
  createLangskin,
  LangskinSession,
  PartialLangskinSpec,
  validatePartialSpec,
} from "../../";

export type Output = {
  type: "stdout" | "stderr";
  raw: string;
};

function stderr(raw: string): Output {
  return { type: "stderr", raw };
}

export type ReplSetupResult =
  | { type: "error"; exitCode: 1; output: Output[] }
  | { type: "success"; session: LangskinSession; output: Output[] };

export function executeReplSetup(
  cwd: string,
  specPath?: string,
): ReplSetupResult {
  if (!specPath) {
    const lang = createLangskin();
    return {
      type: "success",
      session: lang.createSession(),
      output: [],
    };
  }

  const resolvedSpecPath = path.resolve(cwd, specPath);

  if (!existsSync(resolvedSpecPath)) {
    return {
      type: "error",
      exitCode: 1,
      output: [
        stderr(`Cannot open file ${specPath}: File does not exist`),
      ],
    };
  }

  const specContent = readFileSync(resolvedSpecPath, "utf-8");
  let parsedPartialSpec: unknown;
  try {
    parsedPartialSpec = JSON.parse(specContent);
  } catch (e) {
    return {
      type: "error",
      exitCode: 1,
      output: [
        stderr(
          `'${specPath}' is not valid JSON: ${
            e instanceof Error ? e.message : String(e)
          }`,
        ),
      ],
    };
  }

  const validation = validatePartialSpec(parsedPartialSpec);
  if (!validation.valid) {
    return {
      type: "error",
      exitCode: 1,
      output: [
        stderr(`'${resolvedSpecPath}' is not a valid spec:`),
        ...validation.errors.map((e) => stderr(`  ${e}`)),
      ],
    };
  }

  const lang = createLangskin(
    parsedPartialSpec as PartialLangskinSpec,
  );
  return {
    type: "success",
    session: lang.createSession(),
    output: [stderr(chalk.blue(`Using spec from ${specPath}`))],
  };
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
    const result = executeReplSetup(process.cwd(), options.spec);
    result.output.forEach((o) => {
      if (o.type === "stdout") {
        console.log(o.raw);
      } else {
        console.error(o.raw);
      }
    });
    if (result.type === "error") {
      process.exit(result.exitCode);
    }
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });
    runRepl(rl, result.session);
  });
