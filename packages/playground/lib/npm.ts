export async function getLatestNpmVersion(
  packageName: string,
): Promise<string> {
  const response = await fetch(
    `https://registry.npmjs.org/${packageName}/latest`,
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch latest version for package ${packageName}`,
    );
  }
  const data = await response.json();
  return data.version;
}
