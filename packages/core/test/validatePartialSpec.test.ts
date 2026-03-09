import { describe, it, expect } from "vitest";
import { validatePartialSpec } from "@langskin";

describe("validatePartialSpec", () => {
  describe("valid specs", () => {
    it("should accept an object with an empty keywords map", () => {
      const result = validatePartialSpec({ keywords: {} });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept a single keyword override", () => {
      const result = validatePartialSpec({
        keywords: { var: "variable" },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept multiple keyword overrides", () => {
      const result = validatePartialSpec({
        keywords: {
          var: "variable",
          fun: "funcion",
          class: "tipo",
        },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept keyword values with underscores", () => {
      const result = validatePartialSpec({
        keywords: {
          var: "my_var",
          fun: "_function",
        },
      });

      expect(result.valid).toBe(true);
    });

    it("should accept keyword values with numbers (not at start)", () => {
      const result = validatePartialSpec({
        keywords: {
          var: "var2",
          fun: "func123",
        },
      });

      expect(result.valid).toBe(true);
    });

    it("should accept all keywords provided at once", () => {
      const result = validatePartialSpec({
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
  });

  describe("invalid specs", () => {
    it("should reject an object without a keywords key", () => {
      const result = validatePartialSpec({});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Spec must have a 'keywords' property",
      );
    });

    it("should reject an object with unrelated keys but no keywords key", () => {
      const result = validatePartialSpec({ name: "Ammar" });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Spec must have a 'keywords' property",
      );
    });

    it("should accept an object with extra keys alongside keywords", () => {
      const result = validatePartialSpec({
        keywords: {},
        name: "Ammar",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-object input", () => {
      expect(validatePartialSpec(null).valid).toBe(false);
      expect(validatePartialSpec(undefined).valid).toBe(false);
      expect(validatePartialSpec("string").valid).toBe(false);
      expect(validatePartialSpec(123).valid).toBe(false);
      expect(validatePartialSpec([]).valid).toBe(false);
    });

    it("should return 'Spec must be an object' for non-object input", () => {
      const result = validatePartialSpec(null);

      expect(result.errors).toContain("Spec must be an object");
    });

    it("should reject spec with non-object keywords", () => {
      const result = validatePartialSpec({
        keywords: "not-an-object",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("'keywords' must be an object");
    });

    it("should reject non-string keyword value", () => {
      const result = validatePartialSpec({ keywords: { var: 123 } });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Keyword 'var' must be a string",
      );
    });

    it("should reject empty keyword value", () => {
      const result = validatePartialSpec({ keywords: { var: "" } });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Keyword 'var' cannot be empty",
      );
    });

    it("should reject keyword starting with a number", () => {
      const result = validatePartialSpec({
        keywords: { var: "123var" },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not a valid identifier");
    });

    it("should reject keyword value with special characters", () => {
      const result = validatePartialSpec({
        keywords: { var: "my-var" },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not a valid identifier");
    });

    it("should reject keyword value with spaces", () => {
      const result = validatePartialSpec({
        keywords: { var: "my var" },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("not a valid identifier");
    });

    it("should reject duplicate keyword values within the partial set", () => {
      const result = validatePartialSpec({
        keywords: { var: "same", fun: "same" },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Duplicate keyword value");
      expect(result.errors[0]).toContain("'same'");
    });

    it("should not require keywords that are absent", () => {
      // Omitting most keywords is fine — they are optional in a partial spec
      const result = validatePartialSpec({
        keywords: { var: "variable" },
      });

      expect(result.valid).toBe(true);
    });

    it("should reject unknown keyword names", () => {
      const result = validatePartialSpec({
        keywords: { nonexistent: "value" },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Unknown keyword(s) in 'keywords'",
      );
      expect(result.errors[0]).toContain("'nonexistent'");
    });

    it("should reject a mix of valid and unknown keyword names", () => {
      const result = validatePartialSpec({
        keywords: { var: "variable", nonexistent: "value" },
      });

      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain(
        "Unknown keyword(s) in 'keywords'",
      );
      expect(result.errors[0]).toContain("'nonexistent'");
    });

    it("should collect multiple errors", () => {
      const result = validatePartialSpec({
        keywords: {
          var: "",
          fun: "123bad",
          class: "same",
          if: "same",
        },
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
