import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    target: "es2020",
  },
  {
    entry: { cli: "src/cli/index.ts" },
    format: ["esm"],
    dts: false,
    clean: false,
    target: "es2020",
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
