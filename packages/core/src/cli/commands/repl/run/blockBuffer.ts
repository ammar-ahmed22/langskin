export class BlockBuffer {
  private buffer: string[] = [];
  private depth: number = 0;
  private prompt: string = "> ";

  isActive(): boolean {
    return this.depth > 0;
  }

  getPrompt(): string {
    return this.prompt;
  }

  open(lineForBuffer: string): void {
    this.buffer.push(" ".repeat(this.depth * 2) + lineForBuffer);
    this.depth++;
    this.prompt =
      this.prompt !== "> " ? this.prompt.trim() + "... " : "... ";
  }

  addInner(lineForBuffer: string): void {
    this.buffer.push(
      " ".repeat((this.depth + 1) * 2) + lineForBuffer,
    );
  }

  close(lineForBuffer: string): boolean {
    this.depth--;
    this.buffer.push(" ".repeat(this.depth * 2) + lineForBuffer);
    if (this.depth > 0) {
      this.prompt = this.prompt.slice(3);
      return false;
    }
    this.prompt = "> ";
    return true;
  }

  flush(): string {
    const result = this.buffer.join("\n");
    this.buffer = [];
    return result;
  }
}
