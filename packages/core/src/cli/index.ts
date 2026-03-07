import { Command } from "@commander-js/extra-typings";
import pkg from "../../package.json" assert { type: "json" };
const program = new Command();

program
  .name("langskin")
  .description("CLI for running langskin code")
  .version(pkg.version);

program
  .command("repl")
  .description("Start a REPL for langskin")
  .action(() => {
    console.log("Starting langskin REPL...");
  });

program
  .command("run")
  .description("Run a langskin file")
  .argument("<file>", "The langskin file to run")
  .option(
    "-s, --spec",
    "The JSON spec file to skin the language with",
  )
  .action((file, options) => {
    console.log(`Running langskin file: ${file}`);
    console.log(`Options: ${options}`);
  });

program.parse();
