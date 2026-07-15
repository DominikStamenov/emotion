import { Hero } from "../components/hero";
import { Navbar } from "../components/navbar";
import { LogoCloud } from "../components/logo-clouds";
import { ServicesSection } from "../components/sections/services-section";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <LogoCloud />
        <ServicesSection />
      </main>
    </>
  );
}