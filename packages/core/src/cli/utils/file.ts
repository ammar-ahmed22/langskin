import { CommandResult } from ".";
import path from "path";
import { existsSync, readFileSync } from "fs";
import { PartialLangskinSpec } from "@langskin";
import { validatePartialSpec } from "@langskin";

export type ReadFileResult = [CommandResult, string];
export function readFile(
  cwd: string,
  filePath: string,
): ReadFileResult {
  const resolvedPath = path.resolve(cwd, filePath);
  if (!existsSync(resolvedPath)) {
    return [
      CommandResult.error(
        `Cannot open file ${filePath}: File does not exist`,
      ),
      "",
    ];
  }
  const content = readFileSync(resolvedPath, "utf-8");
  return [CommandResult.success(), content];
}

export type ReadSpecFileResult = [
  CommandResult,
  PartialLangskinSpec?,
];
export function readSpecFile(
  cwd: string,
  filePath: string,
): ReadSpecFileResult {
  const [readFileResult, content] = readFile(cwd, filePath);
  if (readFileResult.failure()) {
    return [readFileResult];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (e) {
    return [
      CommandResult.error(
        `'${filePath}' is not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
      ),
    ];
  }

  const validation = validatePartialSpec(parsed);
  if (!validation.valid) {
    const result = CommandResult.error(
      `${filePath} is not a valid spec`,
    );
    validation.errors.forEach((e) => result.addStderr(`  ${e}`));
    return [result];
  }

  return [CommandResult.success(), parsed as PartialLangskinSpec];
}
