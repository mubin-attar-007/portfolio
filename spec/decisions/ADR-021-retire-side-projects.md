# ADR-021 — Retire CrownWager and LLM Studio; archive TradePulse

Status: **Accepted**, 20 November 2026 (owner's decision, after two research rounds and
the CTO adviser's review). Amends `spec/CONTENT_MODEL.md` §1 (the project list) and the
résumé's projects.

## Context

The portfolio listed four public projects beside the three flagships. A research review
of 2026 Applied AI hiring signals (local reports, not in the repo) found that three of them
weakened the story they sat in:

- **CrownWager** (NBA predictions with Kelly staking and an arbitrage finder) is a betting
  product. India's Promotion and Regulation of Online Gaming Act, 2025 bans online money
  games and any advertisement that "directly or indirectly promotes" them, and its Rules
  have applied since 1 May 2026. A public "+EV betting" tool was at least a reputational
  risk, and possibly a legal one.
- **LLM Studio** (a multi-provider chat app) reads as the generic API wrapper hiring guides
  dismiss, and provider switchers became one of 2026's most crowded categories. Its hosted
  demo had already failed (RUNTIME_ERROR, 13 Nov 2026).
- **TradePulse** has real rigour (a look-ahead canary test), but stock backtesting is a
  packaged tutorial topic outside the domains these employers hire for.

**DBWhisper** carries the portfolio's thesis (a deterministic validator, not the model,
decides what may run) and stays the featured public project. A new public project, a
Hinglish voice agent, is in progress in its own repository.

## Decision

1. **CrownWager and LLM Studio leave the site.**
   - Removed: their case studies, diagrams, demo media, eval row (CrownWager's
     cross-validation figure), résumé entry, assistant starters and follow-ups, and FAQ
     material.
   - `/work/crownwager` and `/work/llm-studio` redirect (308) to `/work`.
   - The CrownWager note ("Grade every prediction against the real final score") is
     removed, and its URL redirects to `/notes`.
2. **The two LLM Studio notes stay as writing.** These are "Enforce tenancy in the
   repository layer" and "Solo, but every deploy still has to pass the gate". Their lessons
   stand on their own, and they now link LLM Studio's archived source instead of its
   removed case study.
3. **TradePulse is `archived`.**
   - Its case study, write-up, eval row and résumé entry stay.
   - Its card carries an "Archived" pill (a new `STATUS_PILL` word, neutral grey like
     Retired), and the case study links no demo.
   - The keep-alive workflow no longer wakes its Space.
4. **Removing a withdrawn project is not retiring a result.** The eval registry's rule
   keeps a result that failed an audit listed, with the reason. CrownWager's figure did not
   fail an audit; the project was withdrawn, so its row goes with it.
5. **The repositories are handled on GitHub, not hidden in history.**
   - CrownWager's repository is made private and archived.
   - LLM Studio's and TradePulse's repositories stay public, archived, with a README note
     that marks each one as an earlier learning project, no longer maintained.
   - The profile README features DBWhisper and the voice agent.

## Consequences

- The public section shows DBWhisper and, labelled, the archived TradePulse until the voice
  agent ships. The facts strip's "4 public systems" became "Since 2024 · building AI that
  runs in production".
- "Four public projects" and "seven case studies" are gone from copy, `llms.txt`, the FAQ,
  the assistant's golden set and the docs. There are five case studies: three flagships
  and two public projects.
- Old links to the removed pages land on `/work` or `/notes`, never on a 404.
- The old Hugging Face Spaces (`heisenbergblue`) cannot be changed: that account is
  unreachable. They stay up until Hugging Face support removes them; the site no longer
  links them.
