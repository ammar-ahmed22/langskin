import { Navbar, NavigationLink } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SyntaxDemo } from "@/components/landing/syntax-demo";
import { Features } from "@/components/landing/features";
import { Install } from "@/components/landing/install";
import { Footer } from "@/components/landing/footer";
import {
  createFileSpecs,
  loadFileById,
  loadFilesById,
} from "@/lib/fs";

const heroIds = ["custom", "espanol", "francais", "langskin"];
const heroPhrases = {
  custom: "in your own words.",
  espanol: "español.",
  francais: "français.",
  langskin: "langskin",
};

const heroCodeFiles = createFileSpecs(
  heroIds,
  "content/code-samples/hero",
  "ls",
);
const heroSpecFiles = createFileSpecs(
  heroIds,
  "content/code-samples/hero",
  "json",
);

const syntaxDemoIds = ["langskin", "espanol", "custom", "brainrot"];
const syntaxDemoLabelsById = {
  langskin: "Langskin",
  espanol: "Español",
  custom: "Custom DSL",
  brainrot: "Brainrot",
};
const syntaxDemoCodeFiles = createFileSpecs(
  syntaxDemoIds,
  "content/code-samples/syntax-demo",
  "ls",
);
const syntaxDemoSpecFiles = createFileSpecs(
  syntaxDemoIds,
  "content/code-samples/syntax-demo",
  "json",
);

const navigationLinks: NavigationLink[] = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "Playground",
    href: "/playground",
  },
  {
    label: "Install",
    href: "#install",
  },
  {
    label: "Docs",
    href: "/docs",
  },
];

export default async function Home() {
  const heroCodeMap = await loadFilesById(heroCodeFiles);
  const heroSpecMap = await loadFilesById(heroSpecFiles);
  const syntaxDemoCodeMap = await loadFilesById(syntaxDemoCodeFiles);
  const syntaxDemoSpecMap = await loadFilesById(syntaxDemoSpecFiles);
  const [_, installCode] = await loadFileById({
    id: "install",
    path: "content/code-samples/install/quickstart.ts",
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar links={navigationLinks} />
      {/* TODO: Code window should be stacked on mobile  */}
      <Hero
        ids={heroIds}
        phrasesById={heroPhrases}
        codeMap={heroCodeMap}
        specMap={heroSpecMap}
      />
      <SyntaxDemo
        ids={syntaxDemoIds}
        labelsById={syntaxDemoLabelsById}
        codeMap={syntaxDemoCodeMap}
        specMap={syntaxDemoSpecMap}
      />
      <Features />
      <Install code={installCode} />
      <Footer />
    </div>
  );
}
