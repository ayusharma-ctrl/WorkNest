import { HydrateClient } from "@/trpc/server";
import { LandingHero } from "@/components/landing/Hero";
import { LandingFeatures } from "@/components/landing/Features";
import { LandingTestimonials } from "@/components/landing/Testimonials";
import { Header } from "@/components/landing/Header";

export default async function Home() {
  return (
    <HydrateClient>
      {/* <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white"> */}
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <LandingHero />
          <LandingFeatures />
          <LandingTestimonials />
        </main>
      </div>
      {/* </main> */}
    </HydrateClient>
  );
}
