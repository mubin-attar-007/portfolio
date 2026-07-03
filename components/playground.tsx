import { PyPlayground } from "./py-playground";
import { Reveal } from "@/lib/motion";

export function Playground() {
  return (
    <section id="playground" className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal trigger="view">
          <p className="eyebrow">Proof, not promises</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Don&apos;t take my word for it — <span className="gradient-text">run it.</span>
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Real Python, compiled to WebAssembly and executed in your browser. Edit it, run it — the
            numbers are computed live, not baked into a screenshot. (The runtime lazy-loads on your
            first Run.)
          </p>
        </Reveal>
        <Reveal trigger="view" delay={0.1} className="mt-8">
          <PyPlayground />
        </Reveal>
      </div>
    </section>
  );
}
