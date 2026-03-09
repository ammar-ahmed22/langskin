import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SyntaxDemo } from "@/components/landing/syntax-demo";
import { Features } from "@/components/landing/features";
import { Install } from "@/components/landing/install";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <SyntaxDemo />
      <Features />
      <Install />
      <Footer />
    </div>
  );
}
