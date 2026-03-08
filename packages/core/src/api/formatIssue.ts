import * as z from "zod";

/**
 * Formats a single ZodIssue into a human-readable error string.
 *
 * Covers all issue shapes that can arise from both specSchema and
 * partialSpecSchema. The 'Missing keyword' branch (invalid_type + "undefined"
 * at path ['keywords', name]) is unreachable when called from
 * validatePartialSpec, because partialSpecSchema makes all keywords optional
 * and never generates that issue.
 */
export function formatIssue(
  issue: z.core.$ZodIssue,
  input: unknown,
): string {
  const path = issue.path;

  // Top-level type error: spec is not an object
  if (path.length === 0) {
    return "Spec must be an object";
  }

  // keywords field missing, wrong type, or contains unknown keys
  if (path.length === 1 && path[0] === "keywords") {
    if (issue.code === "invalid_type") {
      return issue.message.includes("undefined")
        ? "Spec must have a 'keywords' property"
        : "'keywords' must be an object";
    }
    if (issue.code === "unrecognized_keys") {
      const keys = (issue as z.core.$ZodIssue & { keys: string[] })
        .keys;
      const quoted = keys.map((k) => `'${k}'`).join(", ");
      return `Unknown keyword(s) in 'keywords': ${quoted}`;
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
