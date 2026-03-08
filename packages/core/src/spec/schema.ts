import { z } from "zod";

/** Valid identifier pattern: starts with letter/underscore, alphanumeric/underscore after */
const IDENTIFIER_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

/** All valid keyword names — single source of truth */
export const KEYWORD_NAMES = [
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
] as const;

/** Zod validator for a single keyword value */
const keywordValueSchema = z
  .string()
  .min(1, "cannot be empty")
  .regex(
    IDENTIFIER_PATTERN,
    "is not a valid identifier (must start with letter/underscore, contain only alphanumeric/underscore)",
  );

/** Zod schema for the keywords record */
const keywordsSchema = z.object(
  Object.fromEntries(
    KEYWORD_NAMES.map((k) => [k, keywordValueSchema]),
  ) as {
    [K in (typeof KEYWORD_NAMES)[number]]: typeof keywordValueSchema;
  },
);

/** Zod schema for a complete LangskinSpec, including uniqueness check */
export const specSchema = z
  .object({ keywords: keywordsSchema.strict() })
  .superRefine((spec, ctx) => {
    const seenValues = new Map<string, string>(); // value -> keyword name
    for (const [name, value] of Object.entries(spec.keywords)) {
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
  });

/** Zod schema for a partial spec (all keywords optional) */
export const partialSpecSchema = z.object({
  keywords: keywordsSchema.partial().strict(),
});

/** Inferred TypeScript types */
export type KeywordName = (typeof KEYWORD_NAMES)[number];
export type LangskinSpec = z.infer<typeof specSchema>;
export type PartialLangskinSpec = z.infer<typeof partialSpecSchema>;
