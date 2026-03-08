import * as z from "zod";
import { specSchema } from "../spec/schema";
import { ValidationResult } from "../spec/types";

/**
 * Formats a single ZodIssue into a human-readable error string.
 * Preserves the message patterns callers expect.
 */
function formatIssue(
  issue: z.core.$ZodIssue,
  input: unknown,
): string {
  const path = issue.path;

  // Top-level type error: spec is not an object
  if (path.length === 0) {
    return "Spec must be an object";
  }

  // keywords field missing or wrong type
  if (path.length === 1 && path[0] === "keywords") {
    if (issue.code === "invalid_type") {
      return issue.message.includes("undefined")
        ? "Spec must have a 'keywords' property"
        : "'keywords' must be an object";
    }
  }

  // Individual keyword errors: path = ['keywords', '<name>']
  if (path.length === 2 && path[0] === "keywords") {
    const name = path[1];

    if (issue.code === "invalid_type") {
      if (issue.message.includes("undefined")) {
        return `Missing keyword: '${String(name)}'`;
      }
      const received =
        issue.message.match(/received (\w+)/)?.[1] ?? "unknown";
      return `Keyword '${String(name)}' must be a string, got ${received}`;
    }

    // invalid_format = regex failure — include the actual value for clarity
    if (issue.code === "invalid_format") {
      const keywords = (input as Record<string, unknown> | null)
        ?.keywords;
      const value = (keywords as Record<string, unknown> | null)?.[
        String(name)
      ];
      return `Keyword '${String(name)}' value '${String(value)}' is not a valid identifier (must start with letter/underscore, contain only alphanumeric/underscore)`;
    }

    // too_small ("cannot be empty") or custom (duplicate — already fully formatted)
    return issue.code === "custom"
      ? issue.message
      : `Keyword '${String(name)}' ${issue.message}`;
  }

  return issue.message;
}

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
