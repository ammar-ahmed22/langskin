# langskin

## 0.3.1

### Patch Changes

- 5017dd3: Fixed CLI not working due to being compiled to ESM instead of CJS

## 0.3.0

### Minor Changes

- 7e30aaf: Add a CLI for running `.ls` files directly.
  - New `langskin run <file>` command executes a langskin source file and exits with code 0 on success, 1 on failure
  - `--spec <file>` / `-s` flag accepts a JSON keyword map to run with custom keywords
  - Program output is written to stdout; info messages (spec path, timing) and errors are written to stderr
  - Example `.ls` files added to `test/fixtures/` (`hello.ls`, `fibonacci.ls`, `counter_class.ls`, `spanish.ls` + `spanish_spec.json`)

- 3f26a56: Add `validatePartialSpec` function to the public API.

  `validatePartialSpec(spec: unknown): ValidationResult` validates an unknown value against the partial spec type — all keywords are optional, but any provided values must be valid identifiers and unique within the supplied set. Error messages follow the same formatting conventions as `validateSpec`.

  Also migrates `validateSpec` internals to Zod (via a new `specSchema` and `partialSpecSchema` in `src/spec/schema.ts`), replacing the previous manual validation logic. External behaviour and error messages are preserved.

### Patch Changes

- 37a6b6e: Fix `validateSpec` and `validatePartialSpec` to invalidate if 'keywords' contains invalid keys
- db87cce: Fix `validatePartialSpec` allow objects without the 'keywords' property

## 0.2.0

### Minor Changes

- 8d7073b: Expand standard library with new builtin functions

  **Array functions:**
  - `join(array, separator)` - Join array elements into a string
  - `slice(array, start, end)` - Extract a portion of an array
  - `reversed(array)` - Return a reversed copy of an array

  **Math functions:**
  - `round(n)` - Round to nearest integer
  - `sign(n)` - Return the sign of a number (-1, 0, or 1)
  - Trigonometric: `sin`, `cos`, `tan`, `asin`, `acos`, `atan`, `atan2`
  - Logarithmic: `log`, `log10`, `log2`
  - `exp(n)` - e raised to power n

  **String functions:**
  - `char(code)` - Convert Unicode code point to character
  - `upper(string)` - Convert to uppercase
  - `lower(string)` - Convert to lowercase
  - `trim(string)` - Remove whitespace from both ends
  - `split(string, separator)` - Split string into array

  **Utility functions:**
  - `contains(target, search)` - Check if string/array contains a value
  - `range(start, end)` - Generate array of numbers

## 0.1.1

### Patch Changes

- 77d08d0: Documentation for standard library functions

## 0.1.0

### Minor Changes

- 2bec20d: Add standard library with built-in functions

  Introduces the first set of built-in functions to the language runtime. Previously, the language had no standard library - all functionality had to be user-defined.

  **New built-in functions:**
  - **Math**: `abs`, `max`, `min`, `ceil`, `floor`, `pow`, `sqrt`, `rand`, `randint`, `isint`
  - **String**: `len`, `index_of`, `ord`, `str`, `substr`, `replace`, `replace_all`
  - **Array**: `push`, `pop`
  - **Utility**: `typeof`, `now`
