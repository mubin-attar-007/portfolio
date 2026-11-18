import Image from "next/image";
import { SITE } from "@/config/site";
import { aboutPage } from "@/content/pages/about";
import { QuoteCarousel } from "./quote-carousel";
import styles from "./about.module.css";

/**
 * The Careers-style quote band: lines from my essays, one at a time with
 * arrows (QuoteCarousel), each attributed and linked, beside a halftone
 * treatment of the real portrait (CSS dot screen over the photo; plain
 * greyscale where masks are unsupported).
 * A11y: the carousel names itself; the portrait keeps the alt "Mubin Attar".
 */
export function QuoteBand() {
  return (
    <div className={styles.quote}>
      <QuoteCarousel quotes={aboutPage.quotes} labels={aboutPage.quoteBand} name={SITE.name} monogram={SITE.monogram} />
      <div className={styles.portrait}>
        <Image src="/mubin.png" alt={SITE.name} fill sizes="(max-width: 1000px) 240px, 320px" />
      </div>
    </div>
  );
}
