import { LangskinSpec, PartialLangskinSpec } from "../spec/types";
import { DEFAULT_SPEC } from "../spec/defaultSpec";
import { validateSpec } from "./validateSpec";

/**
 * Creates a complete LangskinSpec by merging a partial spec with defaults.
 * Validates the result and throws if invalid.
 *
 * @param partial - Optional partial spec to merge with defaults
 * @returns A complete, validated LangskinSpec
 * @throws Error if the resulting spec is invalid
 */
export function createSpec(
  partial?: PartialLangskinSpec,
): LangskinSpec {
  // If no partial provided, return the default
  if (!partial) {
    return DEFAULT_SPEC;
  }

  // Merge partial keywords with defaults
  const mergedSpec: unknown = {
    keywords: {
      ...DEFAULT_SPEC.keywords,
      ...partial.keywords,
    },
  };

  // Validate the merged result
  const result = validateSpec(mergedSpec);
  if (!result.valid) {
    throw new Error(
      `Invalid spec:\n${result.errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }

  return mergedSpec as LangskinSpec;
}
