<div align="center">
    <h1>langskin</h1>
    <p>A customizable programming language interpreter that lets you redefine keywords via a simple JSON map.</p>
    <div>
        <a href="https://www.npmjs.com/package/langskin" target="_blank" rel="noopener noreferrer">
            <img alt="NPM Version" src="https://img.shields.io/npm/v/langskin?registry_uri=https%3A%2F%2Fregistry.npmjs.com&style=flat&logo=npm&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Flangskin"></img>
        </a>
        <img alt="Release status" src="https://img.shields.io/github/actions/workflow/status/ammar-ahmed22/langskin/core-release.yml?label=release"></img>
    </div>
</div>

## Installation

```bash
npm install langskin
# pnpm add langskin
# yarn add langskin
```

## Quick Start

```typescript
import { createLangskin } from "langskin";

const lang = createLangskin();
const result = lang.run(`
  let greeting = "Hello, World!";
  print greeting;
`);

console.log(result.getOutput()); // ["Hello, World!"]
console.log(result.succeeded()); // true
```

## Custom Keywords

The main feature of langskin is the ability to customize all language keywords. Pass a partial spec to `createLangskin()` and only override what you need:

```typescript
import { createLangskin } from "langskin";

// Create a Spanish-flavored language
const lang = createLangskin({
  keywords: {
    var: "variable",
    fun: "funcion",
    class: "clase",
    if: "si",
    else: "sino",
    while: "mientras",
    true: "verdad",
    false: "falso",
    and: "y",
    or: "o",
    not: "no",
    this: "esto",
    return: "retorna",
    print: "imprimir",
  },
});

const result = lang.run(`
  variable x = 5;
  si (x > 3) {
    imprimir "grande";
  } sino {
    imprimir "pequeno";
  }
`);

console.log(result.getOutput()); // ["grande"]
```

### Available Keywords

All 22 keywords can be customized:

| Semantic Name | Default Value | Description |
|---------------|---------------|-------------|
| `var` | `let` | Variable declaration |
| `fun` | `fun` | Function declaration |
| `return` | `return` | Return statement |
| `class` | `class` | Class declaration |
| `this` | `this` | Instance self-reference |
| `super` | `super` | Superclass reference |
| `inherits` | `inherits` | Class inheritance |
| `init` | `init` | Constructor method name |
| `if` | `if` | Conditional |
| `else` | `else` | Else branch |
| `elif` | `elif` | Else-if branch |
| `while` | `while` | While loop |
| `for` | `for` | For loop |
| `break` | `break` | Break from loop |
| `continue` | `continue` | Continue to next iteration |
| `and` | `and` | Logical AND |
| `or` | `or` | Logical OR |
| `not` | `not` | Logical NOT |
| `true` | `true` | Boolean true |
| `false` | `false` | Boolean false |
| `nil` | `nil` | Null value |
| `print` | `print` | Print statement |

## Language Features

### Variables and Scoping

```
let x = 10;
let y;        // initialized to nil
{
  let x = 20; // shadows outer x
  print x;    // 20
}
print x;      // 10
```

### Functions

```
fun greet(name) {
  return "Hello, " + name + "!";
}
print greet("World");

// Closures
fun makeCounter() {
  let count = 0;
  fun increment() {
    count = count + 1;
    return count;
  }
  return increment;
}
let counter = makeCounter();
print counter(); // 1
print counter(); // 2
```

### Classes

```
class Animal {
  init(name) {
    this.name = name;
  }
  speak() {
    print this.name + " makes a sound";
  }
}

class Dog inherits Animal {
  speak() {
    super.speak();
    print this.name + " barks";
  }
}

let dog = Dog("Rex");
dog.speak();
// Rex makes a sound
// Rex barks
```

### Control Flow

```
// if/elif/else
if (x > 10) {
  print "big";
} elif (x > 5) {
  print "medium";
} else {
  print "small";
}

// while loop
let i = 0;
while (i < 3) {
  print i;
  i = i + 1;
}

// for loop
for (let i = 0; i < 3; i = i + 1) {
  print i;
}

// break and continue
while (true) {
  if (done) break;
  if (skip) continue;
}
```

### Data Types

```
// Numbers
let n = 42;
let pi = 3.14159;

// Strings
let s = "hello";
print s[0];     // "h"

// Booleans
let yes = true;
let no = false;

// Nil
let nothing = nil;

// Arrays
let arr = [1, 2, 3];
print arr[0];   // 1
arr[1] = 99;
let nested = [[1, 2], [3, 4]];
```

### Operators

```
// Arithmetic: + - * / %
print 10 + 5;   // 15
print 10 % 3;   // 1

// Comparison: > >= < <= == !=
print 5 > 3;    // true

// Logical: and or not (also && || !)
print true and false;  // false
print not true;        // false
```

## Standard Library

Langskin includes 21 built-in functions for common operations. Here are a few examples:

```
// Math
print max(5, 10);     // 10
print sqrt(16);       // 4
print randint(1, 6);  // random 1-6

// Strings
print len("hello");   // 5
print substr("hello", 0, 2); // "he"

// Arrays
let arr = [1, 2, 3];
push(arr, 4);
print arr;            // [1, 2, 3, 4]

// Utilities
print typeof(42);     // "number"
print index_of([10, 20, 30], 20); // 1
```

See [docs/stdlib.md](docs/stdlib.md) for the complete reference.

## API Reference

### createLangskin(partialSpec?)

Creates a new Langskin interpreter instance.

```typescript
import { createLangskin } from "langskin";

// With default keywords
const lang = createLangskin();

// With custom keywords
const lang = createLangskin({
  keywords: { var: "let", fun: "function" }
});

// Run code
const result = lang.run(`
    function add(a, b) {
        return a + b;
    }
    let sum = add(2, 3);
    print sum;
`); // result.getOutput() === ['5']
```

**Returns:** A `Langskin` instance with a `run(source: string)` method.

### createSpec(partialSpec?)

Creates a complete, validated spec by merging partial spec with defaults.

```typescript
import { createSpec, DEFAULT_SPEC } from "langskin";

const spec = createSpec({ keywords: { var: "variable" } });
// spec.keywords.var === "variable"
// spec.keywords.fun === "fun" (from defaults)
```

**Throws:** Error if the resulting spec is invalid.

### validateSpec(spec)

Validates a complete spec object.

```typescript
import { validateSpec } from "langskin";

const result = validateSpec({
  keywords: { /* all 22 keywords */ }
});

if (!result.valid) {
  console.error(result.errors);
}
```

**Returns:** `{ valid: boolean, errors: string[] }`

### DEFAULT_SPEC

The default keyword mappings.

```typescript
import { DEFAULT_SPEC } from "langskin";

console.log(DEFAULT_SPEC.keywords.var); // "let"
console.log(DEFAULT_SPEC.keywords.fun); // "fun"
```

### Types

```typescript
import { Reporter } from "langskin";
import type {
  LangskinSpec,        // Complete spec with all keywords
  PartialLangskinSpec, // Partial spec for customization
  KeywordName,         // Union of all keyword names
  ValidationResult,    // { valid: boolean, errors: string[] }
  LangError,           // Error class with phase, message, line, column
  ErrorPhase,          // "Lexical" | "Syntax" | "Runtime"
  ReporterOptions,     // { onError?, onOutput? }
} from "langskin";
```

## Error Handling

The `run()` method returns a `Reporter` object that tracks errors and output:

```typescript
const result = lang.run('print 10 / 0;');

if (result.failed()) {
  const errors = result.getErrors();
  console.log(errors[0].message); // "Division by zero."
  console.log(errors[0].phase);   // "Runtime"
  console.log(errors[0].line);    // 1
  console.log(errors[0].column);  // 7

  // Formatted error messages
  console.log(result.formattedErrors());
}

if (result.succeeded()) {
  console.log(result.getOutput());
}
```

### Error Phases

- **Lexical** - Tokenization errors (unterminated strings, invalid characters)
- **Syntax** - Parse errors (missing semicolons, malformed expressions)
- **Runtime** - Execution errors (division by zero, undefined variables)

## License

MIT
