import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { SITE } from "@/config/site";
import { flagshipHome } from "@/content/home-visual";
import { HeroProductStage } from "./hero-stage";
import styles from "./hero-stage.module.css";

/** Identity and one concrete example, visible together on the first desktop screen. */
export function Hero() {
  const { hero } = flagshipHome;
  return (
    <section className={styles.hero} aria-labelledby="home-title">
      <Container>
        <div className={styles.heroGrid}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{SITE.name} <span aria-hidden>/</span> {SITE.role}</p>
            <h1 id="home-title" className={styles.headline}>
              <span>{hero.titleLead}</span>
              <span className={styles.headlineRest}>{hero.titleAccent}</span>
            </h1>
            <p className={styles.lede}>{hero.lede}</p>
            <div className={styles.heroActions}>
              <Link href={hero.primary.href} prefetch={false} className={buttonVariants("primary", "lg")}>
                {hero.primary.label}<ArrowDown size={16} aria-hidden />
              </Link>
              <Link href={hero.secondary.href} prefetch={false} className={buttonVariants("secondary", "lg")}>
                {hero.secondary.label}<ArrowUpRight size={15} aria-hidden />
              </Link>
            </div>
            <p className={styles.location}>
              <span>{SITE.location}</span>
              {hero.context.split(" · ").map((detail) => <span key={detail}><span aria-hidden> · </span>{detail}</span>)}
            </p>
          </div>
          <HeroProductStage />
        </div>
      </Container>
    </section>
  );
}
