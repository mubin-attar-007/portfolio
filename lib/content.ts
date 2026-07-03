// Single source of truth for portfolio content — all real, verifiable.
//
// Content lives as typed data in /content (JSON) and rich case studies in
// /content/projects/*.mdx. This module imports that data and re-exports it as
// typed objects so components keep importing { profile, projects, experience,
// skills, education } from "@/lib/content" unchanged.

import profileData from "@/content/profile.json";
import projectsData from "@/content/projects.json";
import resumeData from "@/content/resume.json";
import skillsData from "@/content/skills.json";
import faqData from "@/content/faq.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Social = {
  github: string;
  linkedin: string;
  huggingface: string;
  leetcode: string;
  email: string;
};

export type Stat = { value: string; label: string };

export type Profile = {
  name: string;
  role: string;
  focus: string;
  location: string;
  email: string;
  tagline: string;
  ethos: string;
  summary: string;
  resume: string;
  headshot: string;
  socials: Social;
  stats: Stat[];
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  live: string;
  github: string;
  accent: string; // tailwind-ish hex for per-card theming
  order: number;
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  place: string;
  points: string[];
};

export type SkillGroup = { group: string; items: string[] };

export type Education = {
  degree: string;
  school: string;
  year: string;
};

export type FaqItem = {
  question: string;
  answer: string;
  source: string;
};

/** Frontmatter-shaped metadata for enumerating the project case studies (MDX). */
export type ProjectMeta = {
  slug: string;
  name: string;
  tagline: string;
  stack: string[];
  live: string;
  github: string;
  accent: string;
  order: number;
};

// ---------------------------------------------------------------------------
// Typed, re-exported content (loaded from /content)
// ---------------------------------------------------------------------------

export const profile: Profile = profileData;

export const projects: Project[] = [...projectsData.projects].sort(
  (a, b) => a.order - b.order,
);

export const experience: Experience[] = resumeData.experience;

export const skills: SkillGroup[] = skillsData.skills;

export const education: Education = resumeData.education;

export const faq: FaqItem[] = faqData.faq;

/**
 * Enumerable metadata for each project case study (mirrors the frontmatter of
 * the matching /content/projects/<slug>.mdx). Derived from projects.json so the
 * two never drift; pages can map over this to list/link case studies.
 */
export const projectMeta: ProjectMeta[] = projects.map((p) => ({
  slug: p.slug,
  name: p.name,
  tagline: p.tagline,
  stack: p.stack,
  live: p.live,
  github: p.github,
  accent: p.accent,
  order: p.order,
}));
