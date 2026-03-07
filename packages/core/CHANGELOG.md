# langskin

## 0.1.0

### Minor Changes

- 2bec20d: Add standard library with built-in functions

  Introduces the first set of built-in functions to the language runtime. Previously, the language had no standard library - all functionality had to be user-defined.

  **New built-in functions:**
  - **Math**: `abs`, `max`, `min`, `ceil`, `floor`, `pow`, `sqrt`, `rand`, `randint`, `isint`
  - **String**: `len`, `index_of`, `ord`, `str`, `substr`, `replace`, `replace_all`
  - **Array**: `push`, `pop`
  - **Utility**: `typeof`, `now`
