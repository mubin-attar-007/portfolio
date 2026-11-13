<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This repo runs **Next.js 16 (modified)** with breaking changes vs. training data — APIs,
conventions, and file structure may differ. **Read the relevant guide in
`node_modules/next/dist/docs/` before writing any Next API code.** The middleware file is
`proxy.ts`. `params` is async (`await params`). Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

Design law lives in `design-system.md` (§11; its §11.6 anti-patterns are
non-negotiable), engineering law in `spec/ENGINEERING.md`, and working standards in
`CLAUDE.md`. Commands and CI gates are in `README.md`. The site is **calm, light,
typography-first**. When unsure: simplify.
