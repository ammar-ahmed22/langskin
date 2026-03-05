import { describe, it, expect } from "vitest";
import { validateSpec } from "../src/api/validateSpec";
import { DEFAULT_SPEC } from "../src/spec/defaultSpec";

describe("validateSpec", () => {
  describe("valid specs", () => {
    it("should validate the default spec", () => {
      const result = validateSpec(DEFAULT_SPEC);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate a spec with all custom keywords", () => {
      const result = validateSpec({
        keywords: {
          and: "y",
          or: "o",
          not: "no",
          if: "si",
          else: "sino",
          elif: "sinosi",
          for: "para",
          while: "mientras",
          break: "romper",
          continue: "continuar",
          fun: "funcion",
          return: "retornar",
          class: "clase",
          inherits: "extiende",
          super: "padre",
          this: "esto",
          var: "variable",
          true: "verdad",
          false: "mentira",
          nil: "nada",
          print: "imprimir",
          init: "iniciar",
        },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate keywords with underscores", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "my_var",
          fun: "_function",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(true);
    });

    it("should validate keywords with numbers", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "var2",
          fun: "func123",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(true);
    });
  });

  describe("invalid specs", () => {
    it("should reject non-object input", () => {
      expect(validateSpec(null).valid).toBe(false);
      expect(validateSpec(undefined).valid).toBe(false);
      expect(validateSpec("string").valid).toBe(false);
      expect(validateSpec(123).valid).toBe(false);
      expect(validateSpec([]).valid).toBe(false);
    });

    it("should reject spec without keywords property", () => {
      const result = validateSpec({});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Spec must have a 'keywords' property",
      );
    });

    it("should reject spec with non-object keywords", () => {
      const result = validateSpec({ keywords: "not-an-object" });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("'keywords' must be an object");
    });

    it("should reject missing keywords", () => {
      const result = validateSpec({ keywords: {} });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Missing keyword: 'and'");
      expect(result.errors).toContain("Missing keyword: 'if'");
      expect(result.errors).toContain("Missing keyword: 'class'");
    });

    it("should reject non-string keyword values", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: 123,
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Keyword 'var' must be a string",
      );
    });

    it("should reject empty keyword values", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Keyword 'var' cannot be empty",
      );
    });

    it("should reject keywords starting with numbers", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "123var",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not a valid identifier");
    });

    it("should reject keywords with special characters", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "my-var",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not a valid identifier");
    });

    it("should reject keywords with spaces", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "my var",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not a valid identifier");
    });

    it("should reject duplicate keyword values", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "keyword",
          fun: "keyword",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Duplicate keyword value");
      expect(result.errors[0]).toContain("'keyword'");
    });

    it("should collect multiple errors", () => {
      const spec = {
        ...DEFAULT_SPEC,
        keywords: {
          ...DEFAULT_SPEC.keywords,
          var: "",
          fun: "123bad",
          class: "same",
          if: "same",
        },
      };
      const result = validateSpec(spec);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
