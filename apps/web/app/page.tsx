import { Hero } from "@/components/landing/hero";
import { AliciaNav } from "@/components/landing/top-nav";
import { ComparisonSection } from "@/components/landing/comparison";
import { PricingSection } from "@/components/landing/pricing";
import { StoryFooter } from "@/components/landing/footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-background relative">
      <AliciaNav />
      <Hero />
      <ComparisonSection />
      <PricingSection />
      <StoryFooter />
    </main>
  );
}
