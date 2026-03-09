import pkg from "@core/package.json" assert { type: "json" };
import readline from "readline";
import { LangskinSession } from "@langskin";
import chalk from "chalk";
import { writeFileSync } from "fs";
import { BlockBuffer } from "./blockBuffer";
import { REPLCommand, REPLCommandHandler } from "./commands";

const exitCommand = new REPLCommand(".exit")
  .description("Exit the REPL")
  .action((_, __, rl) => {
    rl.close();
  });

const saveCommand = new REPLCommand(".save")
  .argument("filename")
  .description("Save the current session to a file")
  .action((args, session, rl) => {
    const filename = args[0]!;
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
  });

function welcome() {
  console.log(`Welcome to Langskin v${pkg.version}`);
  console.log(`Type your code and press Enter to execute.`);
  console.log(`Type '.help' for more information.`);
}

function executeInput(input: string, session: LangskinSession): void {
  const reporter = session.run(input);
  if (reporter.failed()) {
    reporter
      .formattedErrors()
      .forEach((e) => console.error(chalk.red(e)));
  } else {
    reporter.getOutput().forEach((o) => console.log(o));
  }
}

export function runRepl(
  rl: readline.Interface,
  session: LangskinSession,
) {
  welcome();
  rl.prompt();
  const blockBuffer = new BlockBuffer();
  const commandHandler = new REPLCommandHandler(rl, session);
  commandHandler.addCommand(exitCommand);
  commandHandler.addCommand(saveCommand);

  rl.on("line", (line) => {
    const input = line.trim();
    const lineForBuffer = line.trimEnd();

    if (commandHandler.handle(input)) return;

    if (input === "") {
      rl.prompt();
      return;
    }

    if (input.endsWith("{")) {
      blockBuffer.open(lineForBuffer);
      rl.setPrompt(blockBuffer.getPrompt());
      rl.prompt();
      return;
    }

    if (input.endsWith("}") && blockBuffer.isActive()) {
      const done = blockBuffer.close(lineForBuffer);
      rl.setPrompt(blockBuffer.getPrompt());
      if (!done) {
        rl.prompt();
        return;
      }
      executeInput(blockBuffer.flush(), session);
      rl.prompt();
      return;
    }

    if (blockBuffer.isActive()) {
      blockBuffer.addInner(lineForBuffer);
      rl.prompt();
      return;
    }

    executeInput(input, session);
    rl.prompt();
  }).on("close", () => {
    console.log("Exiting REPL. Goodbye!");
  });
}
