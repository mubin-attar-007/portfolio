import { Mail } from "lucide-react";
import { profile } from "@/lib/content";
import { GitHubIcon, HuggingFaceIcon, LeetCodeIcon, LinkedInIcon } from "./brand-icons";
import { Reveal } from "./reveal";

const SOCIALS = [
  { label: "GitHub", href: profile.socials.github, icon: GitHubIcon },
  { label: "LinkedIn", href: profile.socials.linkedin, icon: LinkedInIcon },
  { label: "Hugging Face", href: profile.socials.huggingface, icon: HuggingFaceIcon },
  { label: "LeetCode", href: profile.socials.leetcode, icon: LeetCodeIcon },
];

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden px-5 py-28 sm:px-8">
      <div className="aurora !opacity-25" aria-hidden>
        <span className="a" />
        <span className="d" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="eyebrow">Contact</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Building something that needs
            <br />
            real, <span className="gradient-text">honest AI?</span> Let&apos;s talk.
          </h2>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={profile.socials.email} className="btn btn-accent">
              <Mail size={16} /> {profile.email}
            </a>
            <a
              href={profile.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
            >
              Download résumé ↗
            </a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mono inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
              >
                <s.icon size={14} /> {s.label}
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      <footer className="relative z-10 mx-auto mt-24 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-line pt-8 sm:flex-row">
        <span className="mono text-xs text-dim">© {new Date().getFullYear()} Mubin Attar</span>
        <span className="mono inline-flex items-center gap-1.5 text-xs text-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" /> 4 apps live · 0 faked metrics
        </span>
        <span className="mono text-xs text-dim">Next.js · Tailwind · deployed on Vercel</span>
      </footer>
    </section>
  );
}
