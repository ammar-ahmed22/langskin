# Standard Library Reference

Langskin provides 21 built-in functions organized into four categories.

## Math Functions

### max(a, b)

Returns the larger of two numbers.

**Parameters:**
- `a` (number) - First number
- `b` (number) - Second number

**Returns:** number

```
print max(5, 10);  // 10
print max(-3, -7); // -3
```

---

### min(a, b)

Returns the smaller of two numbers.

**Parameters:**
- `a` (number) - First number
- `b` (number) - Second number

**Returns:** number

```
print min(5, 10);  // 5
print min(-3, -7); // -7
```

---

### abs(n)

Returns the absolute value of a number.

**Parameters:**
- `n` (number) - The number

**Returns:** number

```
print abs(-5);  // 5
print abs(3.14); // 3.14
```

---

### ceil(n)

Rounds a number up to the nearest integer.

**Parameters:**
- `n` (number) - The number to round

**Returns:** number

```
print ceil(4.2);  // 5
print ceil(-4.8); // -4
```

---

### floor(n)

Rounds a number down to the nearest integer.

**Parameters:**
- `n` (number) - The number to round

**Returns:** number

```
print floor(4.8);  // 4
print floor(-4.2); // -5
```

---

### pow(base, exponent)

Returns the base raised to the power of the exponent.

**Parameters:**
- `base` (number) - The base
- `exponent` (number) - The exponent

**Returns:** number

```
print pow(2, 3);   // 8
print pow(9, 0.5); // 3
```

---

### sqrt(n)

Returns the square root of a number.

**Parameters:**
- `n` (number) - The number

**Returns:** number

```
print sqrt(16); // 4
print sqrt(2);  // 1.4142135623730951
```

---

### rand(min, max)

Returns a random floating-point number between min (inclusive) and max (exclusive).

**Parameters:**
- `min` (number) - Minimum value (inclusive)
- `max` (number) - Maximum value (exclusive)

**Returns:** number

```
print rand(0, 1);   // e.g., 0.7234...
print rand(10, 20); // e.g., 15.321...
```

---

### randint(min, max)

Returns a random integer between min and max (both inclusive).

**Parameters:**
- `min` (number) - Minimum value (inclusive)
- `max` (number) - Maximum value (inclusive)

**Returns:** number

```
print randint(1, 6);   // e.g., 4 (dice roll)
print randint(0, 100); // e.g., 73
```

---

### isint(n)

Checks if a number is an integer.

**Parameters:**
- `n` (number) - The number to check

**Returns:** boolean

```
print isint(5);    // true
print isint(5.5);  // false
print isint(-3);   // true
```

---

## String Functions

### ord(char)

Returns the Unicode code point of a single character.

**Parameters:**
- `char` (string) - A single character string

**Returns:** number

```
print ord("A"); // 65
print ord("a"); // 97
print ord("🎉"); // 127881
```

---

### str(value)

Converts any value to its string representation.

**Parameters:**
- `value` (any) - The value to convert

**Returns:** string

```
print str(42);      // "42"
print str(true);    // "true"
print str(nil);     // "nil"
```

---

### substr(string, start, length)

Extracts a substring from a string.

**Parameters:**
- `string` (string) - The source string
- `start` (number) - Starting index (0-based)
- `length` (number) - Number of characters to extract

**Returns:** string

```
print substr("hello", 0, 2); // "he"
print substr("hello", 1, 3); // "ell"
```

---

### replace(string, search, replacement)

Replaces the first occurrence of a substring.

**Parameters:**
- `string` (string) - The source string
- `search` (string) - The substring to find
- `replacement` (string) - The replacement string

**Returns:** string

```
print replace("hello world", "world", "there"); // "hello there"
print replace("aaa", "a", "b"); // "baa"
```

---

### replace_all(string, search, replacement)

Replaces all occurrences of a substring.

**Parameters:**
- `string` (string) - The source string
- `search` (string) - The substring to find
- `replacement` (string) - The replacement string

**Returns:** string

```
print replace_all("aaa", "a", "b"); // "bbb"
print replace_all("hello world world", "world", "there"); // "hello there there"
```

---

## Array Functions

### push(array, value)

Appends a value to the end of an array and returns the modified array.

**Parameters:**
- `array` (array) - The array to modify
- `value` (any) - The value to append

**Returns:** array

```
let arr = [1, 2, 3];
push(arr, 4);
print arr; // [1, 2, 3, 4]
```

---

### pop(array)

Removes and returns the last element of an array.

**Parameters:**
- `array` (array) - The array to modify

**Returns:** any (the removed element, or `nil` if the array is empty)

```
let arr = [1, 2, 3];
print pop(arr); // 3
print arr;      // [1, 2]
```

---

## Utility Functions

### typeof(value)

Returns a string indicating the type of a value.

**Parameters:**
- `value` (any) - The value to check

**Returns:** string - One of: `"number"`, `"string"`, `"array"`, `"function"`, `"instance"`, `"nil"`

```
print typeof(42);        // "number"
print typeof("hello");   // "string"
print typeof([1, 2, 3]); // "array"
print typeof(nil);       // "nil"
```

---

### len(value)

Returns the length of a string or array.

**Parameters:**
- `value` (string | array) - The string or array

**Returns:** number

```
print len("hello");    // 5
print len([1, 2, 3]);  // 3
print len("");         // 0
```

---

### now()

Returns the current Unix timestamp in milliseconds.

**Parameters:** none

**Returns:** number

```
let start = now();
// ... do some work ...
let elapsed = now() - start;
print "Took " + str(elapsed) + "ms";
```

---

### index_of(target, search)

Finds the index of an element in a string or array. Returns -1 if not found.

**Parameters:**
- `target` (string | array) - The string or array to search in
- `search` (any) - The value to find (must be string if target is string)

**Returns:** number

```
print index_of("hello", "l");  // 2
print index_of("hello", "x");  // -1
print index_of([10, 20, 30], 20); // 1
```
