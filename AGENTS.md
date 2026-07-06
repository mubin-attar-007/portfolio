<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repo runs **Next.js 16 (modified)** with breaking changes vs. training data — APIs,
conventions, and file structure may differ. **Read the relevant guide in
`node_modules/next/dist/docs/` before writing any Next API code.** The middleware file is
`proxy.ts`. `params` is async (`await params`). Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Design/engineering law lives in `spec/` and `CLAUDE.md`. The site is **calm, light,
typography-first** — DESIGN §9 anti-patterns are non-negotiable. When unsure: simplify.
