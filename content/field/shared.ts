import type { FieldReport } from "./types";

/** The approved line on how the work is built (SPEC §2). */
export const AGENT_DIRECTION =
  "I direct AI coding agents: I set the architecture, the quality gates and the invariants, review every change and own the releases.";

/** What a walkthrough call covers, the same for every report (FINAL-SPEC §8.1). */
export const WALKTHROUGH: FieldReport["walkthrough"] = {
  covers: [
    "The architecture, on a whiteboard",
    "The incident log, in depth",
    "How a release ships",
    "Any decision on this page",
  ],
  staysPrivate: [
    "Source code",
    "Organisation, product and people names",
    "Customer data",
    "Security details",
  ],
};
