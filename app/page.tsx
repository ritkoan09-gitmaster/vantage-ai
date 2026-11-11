import VantageHero from "@/components/VantageHero";
import BentoGrid from "@/components/BentoGrid";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    // The selection utility ensures highlight colors match your cyberpunk theme natively
    <main className="relative min-h-screen bg-black text-white selection:bg-cyan-500/30 overflow-hidden">
      <VantageHero />
      <BentoGrid />
      <Pricing />
    </main>
  );
}