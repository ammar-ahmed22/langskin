---
"langskin": minor
---

Add `validatePartialSpec` function to the public API.

`validatePartialSpec(spec: unknown): ValidationResult` validates an unknown value against the partial spec type — all keywords are optional, but any provided values must be valid identifiers and unique within the supplied set. Error messages follow the same formatting conventions as `validateSpec`.

Also migrates `validateSpec` internals to Zod (via a new `specSchema` and `partialSpecSchema` in `src/spec/schema.ts`), replacing the previous manual validation logic. External behaviour and error messages are preserved.
