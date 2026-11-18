import { ShotFrame } from "@/components/flagship/shot-frame";
import { Plate } from "@/components/ui/plate";
import { Bento, Card, CardArt, CardBody } from "@/components/ui/card";
import { CaretLink } from "@/components/ui/caret-link";
import { SectionHeader } from "@/components/ui/section-header";
import { cx } from "@/components/ui/cx";
import { benchDiscovery } from "@/content/flagship/bench-discovery";
import { careltc } from "@/content/flagship/careltc";
import { signflow } from "@/content/flagship/signflow";
import type { Flagship } from "@/content/flagship/types";
import { FLAGSHIP, FLAGSHIP_PAGES } from "@/content/pages/home";
import art from "./bento-art.module.css";

const { cards } = FLAGSHIP;

/** A status chip on a flagship card: the dot's colour carries the state, and so do the words. */
function StateChip({ children }: { children: string }) {
  return <span className={cx(art.chip, art.chipLive)}>{children}</span>;
}

/**
 * A flagship card's art: the product's two hero captures, layered on a dotted
 * stage and cut by its edge, with a badge whose halo spreads while the card is
 * hovered or focused (the card's hover moment). The stage crops the captures'
 * lower part, so the main one carries "Real app · dummy data" at its top.
 */
function ProductArt({ flagship, badge }: { flagship: Flagship; badge: string }) {
  const { primary, secondary } = flagship.hero;
  return (
    <div className={art.product}>
      <div className={art.productMain}>
        <ShotFrame shot={primary} product={flagship.name} sizes="(min-width: 1000px) 480px, 80vw" labelAt="top" />
      </div>
      <div className={art.productSide} data-kind={secondary.frame}>
        <ShotFrame
          shot={secondary}
          product={flagship.name}
          sizes={secondary.frame === "phone" ? "(min-width: 1000px) 140px, 30vw" : "(min-width: 1000px) 380px, 56vw"}
          label={false}
        />
      </div>
      <span className={cx(art.badge, art.halo, art.productBadge)}>{badge}</span>
    </div>
  );
}

/**
 * FlagshipWork — the dark plate of the three flagship products built at Sevina
 * Technologies: a bento whose three wide cards show each product as it really
 * runs (captures on dummy data, labelled so) with its approved usage figure and
 * a link to its case study, between cards on the engineering behind them. Every
 * illustration comes alive on hover or focus (the halos spread, the spinner
 * turns, the checks pop, the incident timeline lights in sequence, the hub
 * lights cyan).
 */
export function FlagshipWork() {
  return (
    <Plate id="flagship" labelledBy="flagship-title">
      <SectionHeader kicker={FLAGSHIP.kicker} title={FLAGSHIP.title} lead={FLAGSHIP.lead} align="center" id="flagship-title">
        <CaretLink href={FLAGSHIP.more.href} size="md">
          {FLAGSHIP.more.label}
        </CaretLink>
      </SectionHeader>
      <Bento className={cx("mt-16", art.scope)}>
        <Card span={2} className={art.productCard}>
          <CardArt>
            <ProductArt flagship={benchDiscovery} badge={cards.benchDiscovery.badge} />
          </CardArt>
          <CardBody>
            <h3>{cards.benchDiscovery.title}</h3>
            <p>{cards.benchDiscovery.body}</p>
            <p className={art.usage}>{cards.benchDiscovery.usage}</p>
            <p className={art.tech}>{benchDiscovery.card.tech}</p>
            <div className={art.chips}>
              <StateChip>{FLAGSHIP.inUse}</StateChip>
            </div>
            <CaretLink href={FLAGSHIP_PAGES.benchDiscovery} className="mt-4">
              {FLAGSHIP.caseStudy}
              <span className="sr-only">: {cards.benchDiscovery.title}</span>
            </CaretLink>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <div className={art.stack}>
              <span className={art.term}>
                <span className={art.spin} />
                SET LOCAL app.organization_id…
              </span>
              <span className={art.term}>
                <span className={art.okText}>✓</span>no tenant context, no rows
              </span>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.tenancy.title}</h3>
            <p>{cards.tenancy.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <div className={art.stack}>
              <span className={art.badge}>
                <span className={cx(art.okText, art.pop)}>✓</span>App Store review passed
              </span>
              <span className={art.badge}>
                <span className={cx(art.okText, art.pop, art.popLate)}>✓</span>Google Play review passed
              </span>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.stores.title}</h3>
            <p>{cards.stores.body}</p>
          </CardBody>
        </Card>

        <Card span={2} className={art.productCard}>
          <CardArt>
            <ProductArt flagship={careltc} badge={cards.careltc.badge} />
          </CardArt>
          <CardBody>
            <h3>{cards.careltc.title}</h3>
            <p>{cards.careltc.body}</p>
            <p className={art.usage}>{cards.careltc.usage}</p>
            <p className={art.tech}>{careltc.card.tech}</p>
            <div className={art.chips}>
              <StateChip>{FLAGSHIP.inUse}</StateChip>
            </div>
            <CaretLink href={FLAGSHIP_PAGES.careltc} className="mt-4">
              {FLAGSHIP.caseStudy}
              <span className="sr-only">: {cards.careltc.title}</span>
            </CaretLink>
          </CardBody>
        </Card>

        <Card span={2} className={art.productCard}>
          <CardArt>
            <ProductArt flagship={signflow} badge={cards.signflow.badge} />
          </CardArt>
          <CardBody>
            <h3>{cards.signflow.title}</h3>
            <p>{cards.signflow.body}</p>
            <p className={art.usage}>{cards.signflow.usage}</p>
            <p className={art.tech}>{signflow.card.tech}</p>
            <div className={art.chips}>
              <StateChip>{FLAGSHIP.inUse}</StateChip>
            </div>
            <CaretLink href={FLAGSHIP_PAGES.signflow} className="mt-4">
              {FLAGSHIP.caseStudy}
              <span className="sr-only">: {cards.signflow.title}</span>
            </CaretLink>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <div className={art.stack}>
              <span className={art.term}>
                <span className={art.spin} />
                opening the signing link again…
              </span>
              <span className={art.term}>
                <span className={art.okText}>✓</span>refused · token already used
              </span>
            </div>
          </CardArt>
          <CardBody>
            <h3>{cards.singleUse.title}</h3>
            <p>{cards.singleUse.body}</p>
          </CardBody>
        </Card>

        <Card>
          <CardArt>
            <ol className={art.tline}>
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
            <div className={art.hub}>
              <div className={art.hubCenter}>MA</div>
              {cards.agents.satellites.map((label) => (
                <span key={label} className={art.sat}>
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
      </Bento>
    </Plate>
  );
}
