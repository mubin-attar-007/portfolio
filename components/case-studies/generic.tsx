import { CS } from "./section";
import type { Project } from "@/content/schema";

/**
 * GenericBody — the honest interim body for a project without a full write-up
 * yet. Lists the real systems and says plainly that the deep write-up is in
 * progress (never pretends to be more).
 */
export function GenericBody({ project }: { project: Project }) {
  return (
    <div>
      <CS id="systems" title="Systems">
        <ul className="flex flex-col gap-2">
          {project.systems.map((s) => (
            <li key={s} className="flex max-w-[var(--width-prose)] gap-2 text-ink-secondary">
              <span aria-hidden className="text-ink-tertiary">
                —
              </span>
              {s}
            </li>
          ))}
        </ul>
      </CS>
      <CS id="write-up" title="Full write-up">
        <p>
          A deep write-up of {project.title} — architecture, key decisions, and trade-offs — is in
          progress. In the meantime the app is live and the source is public (linked above), and every
          number on this page is method-backed.
        </p>
      </CS>
    </div>
  );
}
