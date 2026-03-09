import { Command } from "@commander-js/extra-typings";
import { executeReplSetup } from "./setup";
import { runRepl } from "./run";
import readline from "readline";

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
    result.flush();
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
