import { KeywordName, ValidationResult } from "../spec/types";

/** All valid keyword names for validation */
const KEYWORD_NAMES: KeywordName[] = [
  "and",
  "or",
  "not",
  "if",
  "else",
  "elif",
  "for",
  "while",
  "break",
  "continue",
  "fun",
  "return",
  "class",
  "inherits",
  "super",
  "this",
  "var",
  "true",
  "false",
  "nil",
  "print",
  "init",
];

/** Valid identifier pattern: starts with letter/underscore, alphanumeric/underscore after */
const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/**
 * Validates a complete LangskinSpec.
 * Checks that all keyword values are valid identifiers and unique.
 */
export function validateSpec(spec: unknown): ValidationResult {
  const errors: string[] = [];

  // Type validation: must be an object
  if (typeof spec !== "object" || spec === null) {
    return { valid: false, errors: ["Spec must be an object"] };
  }

  const specObj = spec as Record<string, unknown>;

  // Must have keywords property
  if (!("keywords" in specObj)) {
    return {
      valid: false,
      errors: ["Spec must have a 'keywords' property"],
    };
  }

  if (
    typeof specObj.keywords !== "object" ||
    specObj.keywords === null
  ) {
    return { valid: false, errors: ["'keywords' must be an object"] };
  }

  const keywords = specObj.keywords as Record<string, unknown>;
  const seenValues = new Map<string, string>(); // value -> keyword name

  // Check each keyword
  for (const name of KEYWORD_NAMES) {
    const value = keywords[name];

    // Must be present
    if (value === undefined) {
      errors.push(`Missing keyword: '${name}'`);
      continue;
    }

    // Must be a string
    if (typeof value !== "string") {
      errors.push(
        `Keyword '${name}' must be a string, got ${typeof value}`,
      );
      continue;
    }

    // Cannot be empty
    if (value === "") {
      errors.push(`Keyword '${name}' cannot be empty`);
      continue;
    }

    // Must be a valid identifier
    if (!IDENTIFIER_PATTERN.test(value)) {
      errors.push(
        `Keyword '${name}' value '${value}' is not a valid identifier (must start with letter/underscore, contain only alphanumeric/underscore)`,
      );
      continue;
    }

    // Check for duplicates
    if (seenValues.has(value)) {
      errors.push(
        `Duplicate keyword value '${value}' used by both '${seenValues.get(value)}' and '${name}'`,
      );
    } else {
      seenValues.set(value, name);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
