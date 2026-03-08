import * as z from "zod";
import { partialSpecSchema } from "../spec/schema";
import { ValidationResult } from "../spec/types";

/**
 * Extends the partial spec schema with a uniqueness check across provided keyword values.
 * Only keywords explicitly provided are checked — omitted keywords are ignored.
 */
const partialSpecWithUniquenessSchema = partialSpecSchema.superRefine(
  (spec, ctx) => {
    if (!spec.keywords) return;

    const seenValues = new Map<string, string>(); // value -> keyword name
    for (const [name, value] of Object.entries(spec.keywords)) {
      if (value === undefined) continue;
      if (seenValues.has(value)) {
        ctx.addIssue({
          code: "custom",
          message: `Duplicate keyword value '${value}' used by both '${seenValues.get(value)}' and '${name}'`,
          path: ["keywords", name],
        });
      } else {
        seenValues.set(value, name);
      }
    }
  },
);

/**
 * Formats a single ZodIssue into a human-readable error string.
 * Mirrors the formatting of validateSpec, omitting branches that cannot
 * occur with a partial spec (keywords missing, individual keywords missing).
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
 * Validates a partial LangskinSpec.
 * All keywords are optional, but any provided keyword values must be valid
 * identifiers and unique across the provided set.
 */
export function validatePartialSpec(spec: unknown): ValidationResult {
  const result = partialSpecWithUniquenessSchema.safeParse(spec);
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
