import { Lock } from "lucide-react";
import { Plate } from "@/components/ui/plate";
import { Bento, Card, CardArt, CardBody } from "@/components/ui/card";
import { CaretLink } from "@/components/ui/caret-link";
import { SectionHeader } from "@/components/ui/section-header";
import { cx } from "@/components/ui/cx";
import { FIELD, FIELD_REPORTS } from "@/content/pages/home";
import styles from "./bento-art.module.css";

const { cards } = FIELD;

/** A status chip on a field card: the dot's colour carries the state, and so do the words. */
function StateChip({ tone, children }: { tone: "live" | "pilot"; children: string }) {
  return <span className={cx(styles.chip, tone === "live" ? styles.chipLive : styles.chipPilot)}>{children}</span>;
}

/**
 * FieldWork — the dark plate of the two anonymous field systems: a bento of
 * seven cards whose illustrations come alive on hover or focus (the wire
 * pulses, the halo rings, the spinner turns, the checks pop, the incident
 * timeline lights in sequence, the hub lights cyan).
 */
export function FieldWork() {
  return (
    <Plate id="field" labelledBy="field-title">
      <SectionHeader kicker={FIELD.kicker} title={FIELD.title} lead={FIELD.lead} align="center" id="field-title">
        <CaretLink href={FIELD.more.href} size="md">
          {FIELD.more.label}
        </CaretLink>
      </SectionHeader>
      <Bento className={cx("mt-16", styles.scope)}>
        <Card span={2}>
          <CardArt>
            <div className={styles.flow}>
              <div className={styles.node}>
                Facility folders<small>scans, faxes, Office, email</small>
              </div>
              <div className={styles.wire} />
              <div className={cx(styles.node, styles.hot)}>
                Windows app, on the PC<small>local OCR · indicator match · verified redaction</small>
              </div>
              <div className={styles.wire} />
              <div className={styles.node}>
                Needs-review copies<small>originals unchanged</small>
              </div>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.records.title}</h3>
            <p>{cards.records.body}</p>
            <div className={styles.chips}>
              <StateChip tone="live">{cards.records.chips[0]}</StateChip>
              <StateChip tone="pilot">{cards.records.chips[1]}</StateChip>
            </div>
            <CaretLink href={FIELD_REPORTS.records} className="mt-4">
              {FIELD.report}
            </CaretLink>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <div className={cx(styles.badge, styles.halo, styles.roomBadge)}>
              <span>Room 214</span>
              <span className={styles.okText}>✓ Round recorded</span>
              <span className={styles.muted}>tap at the door, 10:42</span>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.nfc.title}</h3>
            <p>{cards.nfc.body}</p>
            <div className={styles.chips}>
              <StateChip tone="live">{cards.nfc.chip}</StateChip>
            </div>
            <CaretLink href={FIELD_REPORTS.nfc} className="mt-4">
              {FIELD.report}
            </CaretLink>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <div className={styles.stack}>
              <span className={styles.term}>
                <span className={styles.spin} />
                scanning compiled assemblies…
              </span>
              <span className={styles.term}>
                <span className={styles.okText}>✓</span>no network types in document handling
              </span>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.offline.title}</h3>
            <p>{cards.offline.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <div className={styles.stack}>
              <span className={styles.badge}>
                <span className={cx(styles.okText, styles.pop)}>✓</span>App Store review passed
              </span>
              <span className={styles.badge}>
                <span className={cx(styles.okText, styles.pop, styles.popLate)}>✓</span>Google Play review passed
              </span>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.stores.title}</h3>
            <p>{cards.stores.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <ol className={styles.tline}>
              {cards.broke.timeline.map((line) => (
                <li key={line}>
                  <i />
                  {line}
                </li>
              ))}
            </ol>
          </CardArt>
          <CardBody>
            <h3>{cards.broke.title}</h3>
            <p>{cards.broke.body}</p>
          </CardBody>
        </Card>

        <Card span={2}>
          <CardArt>
            <div className={styles.hub}>
              <div className={styles.hubCenter}>MA</div>
              {cards.agents.satellites.map((label) => (
                <span key={label} className={styles.sat}>
                  {label}
                </span>
              ))}
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.agents.title}</h3>
            <p>{cards.agents.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <span className={cx(styles.badge, styles.halo, styles.lockBadge)}>
              <Lock size={14} strokeWidth={1.8} aria-hidden />
              {cards.private.badge}
            </span>
          </CardArt>
          <CardBody>
            <h3>{cards.private.title}</h3>
            <p>{cards.private.body}</p>
          </CardBody>
        </Card>
      </Bento>
    </Plate>
  );
}
