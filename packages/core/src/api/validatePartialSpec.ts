import { partialSpecSchema } from "../spec/schema";
import { ValidationResult } from "../spec/types";
import { formatIssue } from "./formatIssue";

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
