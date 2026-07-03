"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight, FileText } from "lucide-react";
import type { ReactNode } from "react";
import { GitHubIcon } from "./brand-icons";
import { HonestConsole } from "./honest-console";
import { profile } from "@/lib/content";

const HEADLINE = ["I build AI products", "that are actually live —", "and every number is real."];

function MagneticCTA({ href, children }: { href: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15 });
  const sy = useSpring(y, { stiffness: 150, damping: 15 });
  if (reduce) {
    return (
      <a href={href} className="btn btn-accent">
        {children}
      </a>
    );
  }
  return (
    <motion.a
      href={href}
      style={{ x: sx, y: sy }}
      className="btn btn-accent"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.3);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.a>
  );
}

export function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { y: "110%" },
    show: { y: 0, transition: { type: "spring" as const, stiffness: 130, damping: 20 } },
  };

  return (
    <section id="top" className="relative overflow-hidden px-5 pt-32 pb-16 sm:px-8 md:pt-40">
      <div className="aurora" aria-hidden>
        <span className="a" />
        <span className="b" />
        <span className="c" />
        <span className="d" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.p
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            GenAI / ML Engineer · ships in production
          </motion.p>

          <motion.h1
            className="mt-5 text-[2.6rem] font-semibold leading-[0.98] tracking-tight sm:text-6xl"
            variants={reduce ? undefined : container}
            initial={reduce ? false : "hidden"}
            animate={reduce ? undefined : "show"}
          >
            {HEADLINE.map((ln, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" variants={reduce ? undefined : item}>
                  {i === 2 ? (
                    <>
                      and every number is <span className="gradient-text">real.</span>
                    </>
                  ) : (
                    ln
                  )}
                </motion.span>
              </span>
            ))}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Four shipped, multi-user apps — NL→SQL agents, an AI SaaS platform, honest backtesting,
            and +EV sports models. No faked demos, no vanity metrics: verifiable software you can open
            right now.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <MagneticCTA href="#work">
              View live projects <ArrowRight size={16} />
            </MagneticCTA>
            <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <GitHubIcon size={15} /> GitHub
            </a>
            <a href={profile.resume} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              <FileText size={15} /> Résumé
            </a>
          </motion.div>

          <motion.div
            className="mono mt-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-dim"
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <span className="inline-flex items-center gap-1.5 text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> 4 apps live
            </span>
            <span className="text-line2">·</span>
            <span>0 faked metrics</span>
            <span className="text-line2">·</span>
            <span>Vercel + HF Spaces</span>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <HonestConsole />
        </motion.div>
      </div>
    </section>
  );
}
