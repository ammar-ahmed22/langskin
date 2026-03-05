/**
 * Names of all remappable keywords in the language.
 * These are semantic names (camelCase) that map to the actual keyword strings.
 */
export type KeywordName =
  | "and"
  | "or"
  | "not"
  | "if"
  | "else"
  | "elif"
  | "for"
  | "while"
  | "break"
  | "continue"
  | "fun"
  | "return"
  | "class"
  | "inherits"
  | "super"
  | "this"
  | "var"
  | "true"
  | "false"
  | "nil"
  | "print"
  | "init";

/**
 * Complete language specification with all keywords defined.
 * This is the internal representation used by the interpreter.
 */
export interface LangskinSpec {
  keywords: Record<KeywordName, string>;
}

/**
 * User-provided partial specification.
 * Any omitted keywords will use their default values.
 */
export interface PartialLangskinSpec {
  keywords?: Partial<Record<KeywordName, string>>;
}

/**
 * Result of spec validation.
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
