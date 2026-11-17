import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Bento, Card, CardArt, CardBody } from "@/components/ui/card";
import { Plate } from "@/components/ui/plate";
import { SectionHeader } from "@/components/ui/section-header";
import { ShowMore } from "@/components/ui/show-more";
import { cx } from "@/components/ui/cx";
import { FLAGSHIP_LABELS, FLAGSHIP_SECTION_IDS, showFewerLabel, showMoreLabel } from "@/content/flagship/labels";
import type { Flagship, Highlight, HighlightArt } from "@/content/flagship/types";
import art from "./highlights.module.css";

const L = FLAGSHIP_LABELS.sections.highlights;

/** An index as a custom property, for a staggered delay. */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/** One highlight's illustration. Decorative: the card's text carries the meaning. */
function Art({ art: a }: { art: HighlightArt }): ReactNode {
  switch (a.kind) {
    case "terminal":
      return (
        <div className={art.stack}>
          <span className={art.term}>
            <span className={art.spin} />
            {a.running}
          </span>
          <span className={art.term}>
            <span className={cx(art.ok, art.pop)}>✓</span>
            {a.done}
          </span>
        </div>
      );
    case "checks":
      return (
        <ul className={art.checks}>
          {a.items.map((item, i) => (
            <li key={item} style={order(i)}>
              <span className={art.ok}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      );
    case "timeline":
      return (
        <ol className={art.timeline}>
          {a.items.map((item) => (
            <li key={item}>
              <i />
              {item}
            </li>
          ))}
        </ol>
      );
    case "flow":
      return (
        <div className={art.flow}>
          {a.nodes.map((node, i) => (
            <Fragment key={node}>
              {i > 0 ? <span className={art.wire} style={order(i - 1)} /> : null}
              <span className={cx(art.node, i === a.hot && art.hot)}>{node}</span>
            </Fragment>
          ))}
        </div>
      );
    case "bars":
      return (
        <div className={art.bars}>
          {a.items.map((bar, i) => (
            <div key={bar.label} className={art.bar}>
              <span className={art.barLabel}>{bar.label}</span>
              <span className={art.track}>
                <i style={{ ...order(i), "--value": `${bar.value}%` } as CSSProperties} />
              </span>
            </div>
          ))}
          <span className={art.note}>{a.note}</span>
        </div>
      );
    case "reply":
      return (
        <div className={art.chat}>
          <p className={art.question}>{a.question}</p>
          <p className={art.answer}>
            {a.answer}
            <span className={art.cite}>{a.cite}</span>
          </p>
        </div>
      );
    case "badge":
      return (
        <div className={cx(art.badge, art.halo)}>
          <b>{a.title}</b>
          {a.lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      );
  }
}

/** How many highlights a phone shows before "Show N more highlights". */
const PHONE_HIGHLIGHTS = 4;

/** One highlight card: its illustration, title and body. */
function HighlightCard({ highlight }: { highlight: Highlight }) {
  return (
    <Card span={highlight.wide ? 2 : 1} className={art.card}>
      <CardArt>
        {/* A neutral box: the card leans its art's direct child in, so the
            illustration's own transform (a phone-size scale) stays its own. */}
        <div className={art.box}>
          <Art art={highlight.art} />
        </div>
      </CardArt>
      <CardBody>
        <h3>{highlight.title}</h3>
        <p>{highlight.body}</p>
      </CardBody>
    </Card>
  );
}

/**
 * Highlights — "The engineering behind it": a bento of the product's
 * strongest engineering, on the notched dark plate. Each card's illustration
 * is still at rest and plays its moment while the card is hovered (ADR-018 §5:
 * the spinner turns, checks pop, the timeline lights, the wires pulse, the
 * bars refill, the reply rises, the halo spreads). The cards hold no control,
 * so the moment is a pointer nicety; the text says it all. A phone shows the
 * first four and holds the rest behind ShowMore; wider screens lay every card
 * into the one bento.
 */
export function Highlights({ flagship }: { flagship: Flagship }) {
  const headingId = `${FLAGSHIP_SECTION_IDS.highlights}-title`;
  const shown = flagship.highlights.slice(0, PHONE_HIGHLIGHTS);
  const rest = flagship.highlights.slice(PHONE_HIGHLIGHTS);
  return (
    <Plate id={FLAGSHIP_SECTION_IDS.highlights} labelledBy={headingId}>
      <SectionHeader id={headingId} kicker={L.kicker} kickerTone="cyan" title={L.title} lead={L.lead} align="center" />
      <Bento className={cx("mt-14", art.scope)}>
        {shown.map((highlight) => (
          <HighlightCard key={highlight.id} highlight={highlight} />
        ))}
        {rest.length > 0 ? (
          <ShowMore
            more={showMoreLabel(rest.length, FLAGSHIP_LABELS.more.highlights)}
            less={showFewerLabel(FLAGSHIP_LABELS.more.highlights)}
            className={art.more}
          >
            {rest.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </ShowMore>
        ) : null}
      </Bento>
    </Plate>
  );
}
