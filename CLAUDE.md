# CLAUDE.md

# AI Engineer Portfolio Website

This repository contains my personal AI Engineer brand website.

This is NOT a portfolio template.

Treat this repository as if it belongs to a real AI startup.

The objective is to build one of the highest-quality AI Engineer personal brand websites possible.

---

# Source of Truth

Before starting any task, always read the relevant documentation. It lives in
`design-system.md`, `spec/`, `README.md`, and `AGENTS.md`.

The documentation is the authoritative source for:

- Product vision — `spec/PROJECT_CHARTER.md`
- Brand identity — `design-system.md` §1–§2 and `spec/decisions/` (ADR-013, ADR-015, ADR-016)
- Design system — `design-system.md`
- Engineering standards — `spec/ENGINEERING.md`
- Architecture — `spec/ARCHITECTURE.md`, `spec/CONTENT_MODEL.md`, `spec/AI_ASSISTANT.md`
- UI/UX standards — `design-system.md` §11 (design law)
- Accessibility — `design-system.md` §8 and `spec/ENGINEERING.md` §4
- Performance — `spec/ENGINEERING.md` §5 and `design-system.md` §9
- Review process — `spec/ENGINEERING.md` §7–§9
- Decisions — `spec/decisions/README.md` (the index of ADRs)
- Commands, checks, and CI — `README.md`; framework rules — `AGENTS.md`

No roadmap document is kept in the repository.

Never ignore or contradict the documentation.

If documentation becomes outdated, update it as part of the work.

---

# Working Philosophy

Never immediately begin coding.

Always follow this workflow.

Understand

↓

Audit

↓

Plan

↓

Discuss (if architectural)

↓

Implement

↓

Review

↓

Refactor

↓

Test

↓

Document

↓

Commit Ready

---

# Engineering Standards

Always write production-quality code.

Prioritize:

- readability
- maintainability
- reusability
- scalability
- accessibility
- performance
- simplicity

Avoid:

- duplicate code
- unnecessary abstractions
- magic values
- dead code
- large components
- inconsistent naming

---

# UI Philosophy

Every screen should feel:

Premium

Minimal

Elegant

Modern

Professional

Engineering-first

The quality bar should be comparable to products such as:

- Clerk
- OpenAI
- Anthropic
- Vercel
- Linear
- Stripe
- Notion

Never copy designs directly.

Understand the design principles and create an original implementation.

---

# Decision Making

Always question the existing implementation.

Do not assume current code is correct.

If a better solution exists:

- explain why
- explain tradeoffs
- recommend it
- implement it (unless the change is architectural)

---

# Code Reviews

Before considering work complete, review:

Architecture

UI

UX

Accessibility

Responsiveness

Performance

SEO

Animations

Consistency

Developer Experience

Code Quality

Refactor where necessary.

---

# Documentation

Whenever a significant architectural or design decision is made:

Update the appropriate document: `design-system.md` or a file in `spec/` (decision
records live in `spec/decisions/`).

Documentation should always match the implementation.

---

# Components

Prefer reusable components.

Avoid copy-paste.

Follow the design system.

Never create one-off styles when reusable tokens exist.

---

# Styling

Maintain consistency.

Spacing

Typography

Colors

Shadows

Borders

Animations

Icons

Every component should belong to the same design language.

---

# Accessibility

Accessibility is mandatory.

Support:

Keyboard navigation

Focus states

ARIA labels

Semantic HTML

Reduced motion

Proper contrast

---

# Performance

Prefer:

small bundles

lazy loading

optimized images

minimal re-renders

efficient animations

Measure before optimizing.

---

# Project Mindset

This project is a product, not a demo.

Treat every feature as if it will be used by thousands of visitors.

Every page should be polished.

Every interaction should feel intentional.

Every animation should have a purpose.

---

# Definition of Done

A task is complete only when:

- implementation is correct
- responsive
- accessible
- documented
- reviewed
- refactored
- production ready

Never stop at "it works."

Aim for "this would pass a production code review."

---

# Continuous Improvement

If you discover:

better architecture

better UX

better performance

better accessibility

better maintainability

recommend improvements.

Do not settle for "good enough."

The goal is excellence.