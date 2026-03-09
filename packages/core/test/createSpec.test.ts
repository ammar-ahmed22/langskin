import { describe, it, expect } from "vitest";
import { createSpec } from "@langskin/api/createSpec";
import { DEFAULT_SPEC } from "@langskin/spec/defaultSpec";

describe("createSpec", () => {
  describe("without partial spec", () => {
    it("should return the default spec when called with no arguments", () => {
      const spec = createSpec();

      expect(spec).toEqual(DEFAULT_SPEC);
    });

    it("should return the default spec when called with undefined", () => {
      const spec = createSpec(undefined);

      expect(spec).toEqual(DEFAULT_SPEC);
    });
  });

  describe("with partial spec", () => {
    it("should merge a single keyword override", () => {
      const spec = createSpec({ keywords: { var: "variable" } });

      expect(spec.keywords.var).toBe("variable");
      expect(spec.keywords.fun).toBe("fun"); // default
      expect(spec.keywords.class).toBe("class"); // default
    });

    it("should merge multiple keyword overrides", () => {
      const spec = createSpec({
        keywords: {
          var: "variable",
          fun: "function",
          class: "tipo",
        },
      });

      expect(spec.keywords.var).toBe("variable");
      expect(spec.keywords.fun).toBe("function");
      expect(spec.keywords.class).toBe("tipo");
      expect(spec.keywords.if).toBe("if"); // default
    });

    it("should preserve all defaults when only one keyword is overridden", () => {
      const spec = createSpec({ keywords: { print: "output" } });

      // Check the override
      expect(spec.keywords.print).toBe("output");

      // Check all defaults are preserved
      expect(spec.keywords.and).toBe("and");
      expect(spec.keywords.or).toBe("or");
      expect(spec.keywords.not).toBe("not");
      expect(spec.keywords.if).toBe("if");
      expect(spec.keywords.else).toBe("else");
      expect(spec.keywords.elif).toBe("elif");
      expect(spec.keywords.for).toBe("for");
      expect(spec.keywords.while).toBe("while");
      expect(spec.keywords.break).toBe("break");
      expect(spec.keywords.continue).toBe("continue");
      expect(spec.keywords.fun).toBe("fun");
      expect(spec.keywords.return).toBe("return");
      expect(spec.keywords.class).toBe("class");
      expect(spec.keywords.inherits).toBe("inherits");
      expect(spec.keywords.super).toBe("super");
      expect(spec.keywords.this).toBe("this");
      expect(spec.keywords.var).toBe("let");
      expect(spec.keywords.true).toBe("true");
      expect(spec.keywords.false).toBe("false");
      expect(spec.keywords.nil).toBe("nil");
      expect(spec.keywords.init).toBe("init");
    });

    it("should handle empty partial spec", () => {
      const spec = createSpec({ keywords: {} });

      expect(spec).toEqual(DEFAULT_SPEC);
    });

    it("should handle empty keywords object", () => {
      const spec = createSpec({ keywords: {} });

      expect(spec).toEqual(DEFAULT_SPEC);
    });
  });

  describe("validation errors", () => {
    it("should throw on invalid keyword value", () => {
      expect(() =>
        createSpec({ keywords: { var: "123invalid" } }),
      ).toThrow("Invalid spec");
    });

    it("should throw on empty keyword value", () => {
      expect(() => createSpec({ keywords: { var: "" } })).toThrow(
        "Invalid spec",
      );
    });

    it("should throw on duplicate keyword values", () => {
      expect(() =>
        createSpec({ keywords: { var: "same", fun: "same" } }),
      ).toThrow("Invalid spec");
    });

    it("should throw with descriptive error message", () => {
      try {
        createSpec({ keywords: { var: "123bad" } });
        expect.fail("Should have thrown");
      } catch (e) {
        expect((e as Error).message).toContain("Invalid spec");
        expect((e as Error).message).toContain("var");
        expect((e as Error).message).toContain("123bad");
      }
    });

    it("should include all validation errors in message", () => {
      try {
        createSpec({
          keywords: {
            var: "",
            fun: "bad-value",
          },
        });
        expect.fail("Should have thrown");
      } catch (e) {
        const message = (e as Error).message;
        expect(message).toContain("var");
        expect(message).toContain("fun");
      }
    });
  });

  describe("immutability", () => {
    it("should not modify the default spec", () => {
      const originalVar = DEFAULT_SPEC.keywords.var;

      createSpec({ keywords: { var: "changed" } });

      expect(DEFAULT_SPEC.keywords.var).toBe(originalVar);
    });

    it("should not modify the partial spec input", () => {
      const partial = { keywords: { var: "variable" } };
      const originalPartial = JSON.stringify(partial);

      createSpec(partial);

      expect(JSON.stringify(partial)).toBe(originalPartial);
    });
  });
});
