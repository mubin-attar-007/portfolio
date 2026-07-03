"use client";

/**
 * Reusable, prefers-reduced-motion-safe motion primitives (framer-motion).
 *
 * - `Reveal`  — a clip-path inset wipe + spring rise. Replaces the old fade-up.
 * - `Stagger` / `StaggerItem` — orchestrated load stagger for a group.
 *
 * When reduced motion is requested, every primitive renders its content
 * statically (fully visible, no transform, no clip) — a real fallback, not a
 * zero-duration animation.
 */

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

const SPRING = { type: "spring" as const, stiffness: 140, damping: 22, mass: 0.9 };

/* --------------------------------------------------------------- Reveal */

// Prebuilt motion tags (created once, at module scope — never during render).
const MOTION_TAGS = {
  div: motion.div,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const;

type RevealTag = keyof typeof MOTION_TAGS;

type RevealProps = {
  children: ReactNode;
  /** wipe direction — which edge stays anchored as the clip opens */
  from?: "up" | "down";
  delay?: number;
  className?: string;
  /** animate on mount ("load") or when scrolled into view ("view") */
  trigger?: "load" | "view";
  as?: RevealTag;
};

export function Reveal({
  children,
  from = "up",
  delay = 0,
  className,
  trigger = "load",
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = MOTION_TAGS[as];

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  const hiddenClip =
    from === "up" ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";
  const offset = from === "up" ? 14 : -14;

  const variants: Variants = {
    hidden: { clipPath: hiddenClip, y: offset, opacity: 0 },
    show: {
      clipPath: "inset(0 0 0% 0)",
      y: 0,
      opacity: 1,
      transition: { ...SPRING, delay },
    },
  };

  const motionProps =
    trigger === "view"
      ? { whileInView: "show" as const, viewport: { once: true, amount: 0.35 } }
      : { animate: "show" as const };

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      {...motionProps}
    >
      {children}
    </MotionTag>
  );
}

/* --------------------------------------------------- Stagger container/item */

type StaggerProps = ComponentPropsWithoutRef<typeof motion.div> & {
  children: ReactNode;
  /** seconds between each child */
  step?: number;
  /** seconds before the first child */
  delay?: number;
};

export function Stagger({ children, step = 0.08, delay = 0.05, ...rest }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div {...(rest as ComponentPropsWithoutRef<"div">)}>{children}</div>;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: step, delayChildren: delay } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}

type StaggerItemProps = ComponentPropsWithoutRef<typeof motion.div> & {
  children: ReactNode;
};

const itemVariants: Variants = {
  hidden: { y: 16, opacity: 0, clipPath: "inset(0 0 100% 0)" },
  show: { y: 0, opacity: 1, clipPath: "inset(0 0 0% 0)", transition: SPRING },
};

export function StaggerItem({ children, ...rest }: StaggerItemProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div {...(rest as ComponentPropsWithoutRef<"div">)}>{children}</div>;

  return (
    <motion.div variants={itemVariants} {...rest}>
      {children}
    </motion.div>
  );
}
