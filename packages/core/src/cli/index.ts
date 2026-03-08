import pkg from "../../package.json" assert { type: "json" };
import { Command } from "@commander-js/extra-typings";
import { runCommand } from "./commands/run";

const program = new Command();

program
  .name("langskin")
  .description("CLI for running langskin code")
  .version(pkg.version);

program.addCommand(runCommand);

program.parse();
