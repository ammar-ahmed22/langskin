import { LangskinSession, createLangskin } from "@langskin";
import { CommandResult, stderr } from "@cli/utils";
import { readSpecFile } from "@cli/utils/file";
import chalk from "chalk";

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
