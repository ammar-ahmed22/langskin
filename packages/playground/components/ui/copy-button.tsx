"use client";

import * as React from "react";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { type VariantProps } from "class-variance-authority";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CopyButtonProps = Omit<
  React.ComponentProps<"button">,
  "onClick"
> &
  VariantProps<typeof buttonVariants> & {
    text: string;
    timeout?: number;
    onCopy?: () => void;
  };

export function CopyButton({
  text,
  timeout = 2000,
  onCopy,
  variant = "secondary",
  size = "sm",
  className,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), timeout);
    } catch {}
  };

  return (
    <Button
      onClick={handleCopy}
      variant={variant}
      size={size}
      className={cn("text-neutral-400", className)}
      {...props}
    >
      {copied ? (
        <>
          <Check className="size-3 text-emerald-400" />
          <span className="text-emerald-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3" />
          Copy
        </>
      )}
    </Button>
  );
}
