import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { SiGithub } from "react-icons/si";

export type NavigationLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavbarProps = {
  links: NavigationLink[];
};

export function Navbar({ links }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-white/6 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="font-mono text-base font-semibold tracking-tight text-zinc-100"
        >
          langskin
          <span className="ml-1.5 inline-block rounded bg-sky-500/15 px-1 py-0.5 font-mono text-[10px] text-sky-400">
            v0.3.2
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="text-sm text-neutral-400 transition-colors hover:text-neutral-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="hidden md:inline-flex"
        >
          <Link
            href="https://github.com/ammar-ahmed22/langskin"
            target="_blank"
            rel="noopener noreferrer"
          >
            <SiGithub className="size-3.5" />
            GitHub
          </Link>
        </Button>

        {/* Mobile dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {links.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={
                      link.external
                        ? "noopener noreferrer"
                        : undefined
                    }
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="https://github.com/ammar-ahmed22/langskin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <SiGithub className="size-3.5" />
                  GitHub
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
