import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { ProofStrip } from "@/components/proof-strip";
import { Marquee } from "@/components/marquee";
import { Projects } from "@/components/projects";
import { HowIBuild } from "@/components/how-i-build";
import { Playground } from "@/components/playground";
import { About } from "@/components/about";
import { Contact } from "@/components/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* 30-second recruiter scan: drive the pipeline → positioning + proof
            → flagship projects (each → its case study) → how I build → about
            → one clear CTA. */}
        <Hero />
        <ProofStrip />
        <Marquee />
        <Projects />
        <HowIBuild />
        <Playground />
        <About />
        <Contact />
      </main>
    </>
  );
}
