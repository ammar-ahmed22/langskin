import { LangskinSpec } from "./types";

/**
 * Default language specification.
 * These are the built-in keyword mappings used when no custom spec is provided.
 */
export const DEFAULT_SPEC: LangskinSpec = {
  keywords: {
    // Logical operators
    and: "and",
    or: "or",
    not: "not",

    // Control flow
    if: "if",
    else: "else",
    elif: "elif",
    for: "for",
    while: "while",
    break: "break",
    continue: "continue",

    // Functions
    fun: "fun",
    return: "return",

    // Classes
    class: "class",
    inherits: "inherits",
    super: "super",
    this: "this",

    // Variables and literals
    var: "let",
    true: "true",
    false: "false",
    nil: "nil",

    // Built-ins
    print: "print",

    // Magic method names
    init: "init",
  },
};
