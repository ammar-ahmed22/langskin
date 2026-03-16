import { readFile } from "fs/promises";
import path from "path";

export type FileSpec = {
  id: string;
  path: string;
};

export function createFileSpecs(
  ids: string[],
  basePath: string,
  extension: string,
): FileSpec[] {
  return ids.map((id) => ({
    id,
    path: path.join(basePath, `${id}.${extension}`),
  }));
}

export async function loadFileById(
  fileSpec: FileSpec,
): Promise<[string, string]> {
  const content = await readFile(
    path.join(process.cwd(), fileSpec.path),
    "utf-8",
  );
  return [fileSpec.id, content] as const;
}

export async function loadFilesById(
  fileSpecs: FileSpec[],
): Promise<Record<string, string>> {
  const entries = await Promise.all(fileSpecs.map(loadFileById));
  return Object.fromEntries(entries);
}
