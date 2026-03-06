<div align="center">
    <h1>langskin</h1>
    <p>A customizable programming language interpreter that lets you redefine keywords via a simple JSON map.</p>
    <div>
        <a href="https://www.npmjs.com/package/langskin" target="_blank" rel="noopener noreferrer">
            <img alt="NPM Version" src="https://img.shields.io/npm/v/langskin?registry_uri=https%3A%2F%2Fregistry.npmjs.com&style=flat&logo=npm&link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Flangskin"></img>
        </a>
        <img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/ammar-ahmed22/langskin/core-build.yml"></img>
        <img alt="Tests status" src="https://img.shields.io/github/actions/workflow/status/ammar-ahmed22/langskin/core-tests.yml?label=tests"></img>
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

Customize keywords to create your own language flavor:

```typescript
const spanish = createLangskin({
  keywords: {
    var: "variable",
    if: "si",
    else: "sino",
    print: "imprimir",
  },
});

spanish.run(`
  variable x = 5;
  si (x > 3) { imprimir "grande"; }
`);
```

See the [full documentation](./packages/core/README.md) for all language features, API reference, and the complete list of customizable keywords.

## Packages

This is a monorepo containing:

- **[`langskin`](./packages/core)** - The core interpreter library ([npm](https://www.npmjs.com/package/langskin))
- **[`langskin-playground`](./packages/playground)** - Interactive playground (🚧 WIP - live link coming soon)

## License

MIT
