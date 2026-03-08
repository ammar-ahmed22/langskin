---
"langskin": minor
---

Add a CLI for running `.ls` files directly.

- New `langskin run <file>` command executes a langskin source file and exits with code 0 on success, 1 on failure
- `--spec <file>` / `-s` flag accepts a JSON keyword map to run with custom keywords
- Program output is written to stdout; info messages (spec path, timing) and errors are written to stderr
- Example `.ls` files added to `test/fixtures/` (`hello.ls`, `fibonacci.ls`, `counter_class.ls`, `spanish.ls` + `spanish_spec.json`)
