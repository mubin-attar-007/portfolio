import Image from "next/image";
import { profile, experience, skills, education } from "@/lib/content";
import { Reveal } from "./reveal";

const FACTS: [string, string, string?][] = [
  ["location", profile.location],
  ["focus", "GenAI · LLMs · Agents · MLOps"],
  ["github", "github.com/mubin-attar-007", profile.socials.github],
  ["hugging face", "huggingface.co/heisenbergblue", profile.socials.huggingface],
  ["linkedin", "in/mubin-attar", profile.socials.linkedin],
];

export function About() {
  return (
    <section id="about" className="relative px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left — narrative */}
        <div>
          <Reveal>
            <p className="eyebrow">About</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Solo engineer. Real products.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-muted">
              <p>{profile.summary}</p>
              <p>
                I like the whole loop — from an agent&apos;s retrieval strategy down to the Docker
                image and the auth cookie. Everything I build runs on a{" "}
                <span className="text-ink">$0 free-tier stack</span> (HF Spaces + Vercel + Neon),
                which forces discipline: no waste, real engineering, shipped.
              </p>
              <p className="text-ink">
                The one rule across all of it: every number a user sees is genuinely computed —
                never faked.
              </p>
            </div>
          </Reveal>

          {/* Experience timeline */}
          <Reveal delay={0.1}>
            <div className="mt-10">
              <p className="eyebrow mb-5">Experience</p>
              <div className="space-y-6 border-l border-line pl-5">
                {experience.map((e) => (
                  <div key={e.company} className="relative">
                    <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-accent bg-bg" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <h3 className="text-[15px] font-semibold text-ink">
                        {e.company} <span className="font-normal text-accent">— {e.role}</span>
                      </h3>
                      <span className="mono text-xs text-dim">
                        {e.place} · {e.period}
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-muted">
                      {e.points.map((pt, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-dim" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Right — portrait + facts + stack + education */}
        <div className="lg:pt-2">
          <Reveal>
            <div className="relative mb-4 aspect-square overflow-hidden rounded-2xl border border-line">
              <Image
                src={profile.headshot}
                alt={`${profile.name}, AI/ML engineer`}
                width={720}
                height={720}
                priority
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-accent/15" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg/80 to-transparent" />
              <a
                href={profile.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="mono absolute bottom-3 left-3 rounded-full border border-line2 bg-bg/70 px-3 py-1.5 text-xs text-ink backdrop-blur transition hover:border-accent hover:text-accent"
              >
                Résumé ↗
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="card p-6">
              <p className="mono text-xs uppercase tracking-wider text-dim">{"// facts"}</p>
              <dl className="mono mt-4 space-y-2.5 text-[13px]">
                {FACTS.map(([k, v, href]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-right text-ink">
                      {href ? (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                          {v}
                        </a>
                      ) : (
                        v
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mt-4 card p-6">
              <p className="mono text-xs uppercase tracking-wider text-dim">{"// stack"}</p>
              <div className="mt-4 space-y-3">
                {skills.map((s) => (
                  <div key={s.group}>
                    <p className="mono text-[11px] uppercase tracking-wider text-accent">{s.group}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {s.items.map((it) => (
                        <span key={it} className="chip">
                          {it}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-4 card p-6">
              <p className="mono text-xs uppercase tracking-wider text-dim">{"// education"}</p>
              <p className="mt-3 text-[14.5px] font-medium text-ink">{education.degree}</p>
              <p className="text-[13.5px] text-muted">{education.school}</p>
              <p className="mono mt-1 text-xs text-dim">{education.year}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
