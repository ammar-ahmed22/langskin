export type Output = {
  type: "stdout" | "stderr";
  raw: string;
};

export function stdout(raw: string): Output {
  return { type: "stdout", raw };
}

export function stderr(raw: string): Output {
  return { type: "stderr", raw };
}

export class CommandResult {
  constructor(
    public exitCode: number,
    public output: Output[],
  ) {}

  public addStdout(raw: string): void {
    this.output.push(stdout(raw));
  }

  public addStderr(raw: string): void {
    this.output.push(stderr(raw));
  }

  public getStdout(): string[] {
    return this.output
      .filter((o) => o.type === "stdout")
      .map((o) => o.raw);
  }

  public getStderr(): string[] {
    return this.output
      .filter((o) => o.type === "stderr")
      .map((o) => o.raw);
  }

  public success(): boolean {
    return this.exitCode === 0;
  }

  public failure(): boolean {
    return this.exitCode !== 0;
  }

  static success(output: Output[] = []): CommandResult {
    return new CommandResult(0, output);
  }

  static error(message?: string): CommandResult {
    const reuslt = new CommandResult(1, []);
    if (message) {
      reuslt.addStderr(message);
    }
    return reuslt;
  }
}
