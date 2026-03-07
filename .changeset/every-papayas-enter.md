---
"langskin": minor
---

Expand standard library with new builtin functions

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
