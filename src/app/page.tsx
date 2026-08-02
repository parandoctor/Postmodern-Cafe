import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturesSection />
      <Footer />
    </>
  );
}
