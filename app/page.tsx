import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { LeadCapture } from "@/components/landing/lead-capture";
import { Navbar } from "@/components/landing/navbar";
import { Process } from "@/components/landing/process";
import { ProductActivation } from "@/components/landing/product-activation";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <ProductActivation />
      <Process />
      <LeadCapture />
      <Footer />
    </main>
  );
}
