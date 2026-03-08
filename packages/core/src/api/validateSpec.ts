import { specSchema } from "../spec/schema";
import { ValidationResult } from "../spec/types";
import { formatIssue } from "./formatIssue";

/**
 * Validates a complete LangskinSpec.
 * Checks that all keyword values are valid identifiers and unique.
 */
export function validateSpec(spec: unknown): ValidationResult {
  const result = specSchema.safeParse(spec);
  if (result.success) {
    return { valid: true, errors: [] };
  }
  return {
    valid: false,
    errors: result.error.issues.map((issue) =>
      formatIssue(issue, spec),
    ),
  };
}
