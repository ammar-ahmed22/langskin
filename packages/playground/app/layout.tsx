import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  Outfit,
  Geist_Mono,
} from "next/font/google";
import "./globals.css";

// Display font — organic variable-width grotesque. Distinctive letterforms at
// large sizes, especially the wide strokes on W, R, G. Feels handcrafted.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Body font — clean geometric grotesque, very readable at small sizes,
// contrasts nicely with Bricolage's expressive character.
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

// Monospace — for code blocks, labels, and the logo.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Langskin — Write Code in Your Own Words",
  description:
    "A customizable programming language interpreter that lets you redefine every keyword through a simple JSON mapping. Write code in español, your own DSL, or anything you imagine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variable classes must live on <html> (not <body>) so the CSS custom
    // properties are available to the html element's own font-family rule.
    <html
      lang="en"
      className={`dark scroll-smooth ${bricolage.variable} ${outfit.variable} ${geistMono.variable}`}
    >
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
