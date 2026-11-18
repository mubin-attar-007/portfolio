import { Cloud, FileText, LayoutDashboard, Monitor, Server, Smartphone, type LucideIcon } from "lucide-react";
import { ShowMore } from "@/components/ui/show-more";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS, showFewerLabel, showMoreLabel } from "@/content/flagship/labels";
import type { BuiltIcon, Constraint, Flagship, Screenshot } from "@/content/flagship/types";
import { FlagshipSection } from "./flagship-section";
import { MediaGallery, type GalleryTabData } from "./media-gallery";
import { ShotFrame, frameFit } from "./shot-frame";
import frames from "./frames.module.css";
import styles from "./flagship.module.css";

const L = FLAGSHIP_LABELS.sections;
const MORE = FLAGSHIP_LABELS.more;

/** A capture's stable id, from its file name ("/showcase/careltc/portal-reports.webp" → "portal-reports"). */
const shotKey = (shot: Screenshot): string => shot.src.slice(shot.src.lastIndexOf("/") + 1).replace(/\.[a-z]+$/, "");

/** The widths a capture renders at in the tour's stage, by its frame. */
const STAGE_SIZES: Record<Screenshot["frame"], string> = {
  browser: "(min-width: 1000px) 820px, 92vw",
  window: "(min-width: 1000px) 820px, 92vw",
  page: "(min-width: 1000px) 380px, 80vw",
  phone: "(min-width: 1000px) 250px, 56vw",
};

/**
 * TourSection — the product tour: every capture of the real app, by surface,
 * each with what it proves (media-gallery.tsx does the choosing; the frames
 * render here, on the server).
 */
export function TourSection({ flagship }: { flagship: Flagship }) {
  const tabs: GalleryTabData[] = flagship.gallery.map((tab) => ({
    id: tab.id,
    label: tab.label,
    shots: tab.shots.map((shot) => ({
      id: shotKey(shot),
      title: shot.title,
      proves: shot.proves,
      portrait: shot.height > shot.width,
      media: (
        <div className={frames.fit} style={frameFit(shot)}>
          <ShotFrame shot={shot} product={flagship.name} sizes={STAGE_SIZES[shot.frame]} />
        </div>
      ),
    })),
  }));
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.tour} kicker={L.tour.kicker} title={L.tour.title} lead={L.tour.lead} tone="subtle">
      <MediaGallery label={`${flagship.name}: ${L.tour.kicker}`} listLabel={L.tour.shots} tabs={tabs} />
    </FlagshipSection>
  );
}

const BUILT_ICON: Record<BuiltIcon, LucideIcon> = {
  desktop: Monitor,
  cloud: Cloud,
  mobile: Smartphone,
  api: Server,
  portal: LayoutDashboard,
  docs: FileText,
};

/**
 * ProblemSection — the problem and who uses it (prose beside a users card),
 * then what the owner built, grouped by surface.
 */
export function ProblemSection({ flagship }: { flagship: Flagship }) {
  const usersId = `${FLAGSHIP_SECTION_IDS.problem}-users`;
  return (
    <FlagshipSection id={FLAGSHIP_SECTION_IDS.problem} kicker={L.problem.kicker} title={L.problem.title}>
      <div className={styles.twoCol}>
        <div className={styles.prose}>
          {flagship.problem.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <aside className={styles.aside} aria-labelledby={usersId}>
          <h3 id={usersId} className={styles.boxTitle}>
            {L.problem.users}
          </h3>
          <ul className={styles.dotList}>
            {flagship.problem.users.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </aside>
      </div>

      <h3 className={styles.subTitle}>{L.built.title}</h3>
      <div className={styles.built} data-columns={flagship.built.length}>
        {flagship.built.map((group) => {
          const Icon = BUILT_ICON[group.icon];
          return (
            <div key={group.title}>
              <h4 className={styles.builtTitle}>
                <span className={styles.builtIcon} aria-hidden="true">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                {group.title}
              </h4>
              <ul className={styles.dotList}>
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </FlagshipSection>
  );
}

/** How many constraints a phone shows before "Show N more constraints". */
const PHONE_CONSTRAINTS = 3;

/** One ledger row: constraint → what it forced → how it is checked, each cell labelled for a phone. */
function ConstraintRow({ row, index }: { row: Constraint; index: number }) {
  const c = L.constraints.columns;
  return (
    <li className={styles.ledgerRow}>
      <span className={styles.ledgerNumber} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className={styles.ledgerCell}>
        <span className={styles.cellLabel}>{c.constraint}</span>
        {row.constraint}
      </p>
      <p className={styles.ledgerCell}>
        <span className={styles.cellLabel}>{c.forced}</span>
        {row.forced}
      </p>
      <p className={styles.ledgerCell}>
        <span className={styles.cellLabel}>{c.checked}</span>
        {row.checked}
      </p>
    </li>
  );
}

/**
 * Constraints: a numbered ledger of constraint → what it forced → how it is
 * checked. A phone shows the first few and holds the rest behind ShowMore.
 */
export function ConstraintsSection({ flagship }: { flagship: Flagship }) {
  const c = L.constraints.columns;
  const shown = flagship.constraints.slice(0, PHONE_CONSTRAINTS);
  const rest = flagship.constraints.slice(PHONE_CONSTRAINTS);
  return (
    <FlagshipSection
      id={FLAGSHIP_SECTION_IDS.constraints}
      kicker={L.constraints.kicker}
      title={L.constraints.title}
      lead={L.constraints.lead}
    >
      <div className={styles.ledger}>
        <div className={styles.ledgerHead} aria-hidden="true">
          <span className={styles.headCell}>#</span>
          <span className={styles.headCell}>{c.constraint}</span>
          <span className={styles.headCell}>{c.forced}</span>
          <span className={styles.headCell}>{c.checked}</span>
        </div>
        <ol className="m-0 list-none p-0">
          {shown.map((row, i) => (
            <ConstraintRow key={row.constraint} row={row} index={i} />
          ))}
        </ol>
        {rest.length > 0 ? (
          <ShowMore
            more={showMoreLabel(rest.length, MORE.constraints)}
            less={showFewerLabel(MORE.constraints)}
            className={styles.ledgerMore}
          >
            <ol start={shown.length + 1} className="m-0 list-none p-0">
              {rest.map((row, i) => (
                <ConstraintRow key={row.constraint} row={row} index={shown.length + i} />
              ))}
            </ol>
          </ShowMore>
        ) : null}
      </div>
      <p className={styles.ledgerNote}>{flagship.constraintsNote}</p>
    </FlagshipSection>
  );
}
