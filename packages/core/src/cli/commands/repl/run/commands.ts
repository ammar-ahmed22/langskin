import readline from "readline";
import { LangskinSession } from "../../../../";

function col(
  val: string,
  width: number,
  align: "left" | "right" = "left",
): string {
  if (val.length >= width) return val;
  const padding = " ".repeat(width - val.length);
  return align === "left" ? val + padding : padding + val;
}

export class REPLCommand {
  public desc: string = "";
  public args: string[] = [];
  public handler: (
    args: string[],
    session: LangskinSession,
    rl: readline.Interface,
  ) => void = () => {};

  constructor(public cmd: string) {}

  get displayName(): string {
    let name = this.cmd;
    if (this.args.length > 0) {
      name += " " + this.args.map((a) => `<${a}>`).join(" ");
    }
    return name;
  }

  public description(desc: string): REPLCommand {
    this.desc = desc;
    return this;
  }

  public argument(arg: string): REPLCommand {
    this.args.push(arg);
    return this;
  }

  public action(
    handler: (
      args: string[],
      session: LangskinSession,
      rl: readline.Interface,
    ) => void,
  ): REPLCommand {
    this.handler = handler;
    return this;
  }
}

export class REPLCommandHandler {
  private rl: readline.Interface;
  private session: LangskinSession;
  private commands: Map<string, REPLCommand> = new Map();
  constructor(
    rl: readline.Interface,
    session: LangskinSession,
    helpCommand: string = ".help",
  ) {
    this.rl = rl;
    this.session = session;
    const helpCmd = new REPLCommand(helpCommand)
      .description("Show this help message")
      .action((_, __, rl) => {
        this.helpMessage();
        rl.prompt();
      });
    this.addCommand(helpCmd);
  }

  private helpMessage(): void {
    const commands = Array.from(this.commands.values());
    console.log("Available commands:");
    const maxDisplayNameLength = Math.max(
      ...commands.map((c) => c.displayName.length),
    );
    const cmdColWidth = maxDisplayNameLength + 2;
    commands.forEach((c) =>
      console.log(`  ${col(c.displayName, cmdColWidth)} ${c.desc}`),
    );
  }

  public addCommand(command: REPLCommand) {
    this.commands.set(command.cmd, command);
  }

  public handle(input: string): boolean {
    const parts = input.trim().split(" ");
    const cmd = parts[0]!.toLowerCase();
    const args = parts.slice(1);

    const command = this.commands.get(cmd);
    if (!command) {
      return false;
    }
    command.handler(args, this.session, this.rl);
    // this.rl.prompt();
    return true;
  }
}
