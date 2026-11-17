import Image from "next/image";
import { Frame } from "@/components/ui/blueprint";
import { SITE } from "@/config/site";
import { hirePage } from "@/content/pages/hire";
import styles from "./hire.module.css";

const HEADSHOT = 36;

/**
 * "A note to hiring teams": the letter in a narrow framed column. The
 * questions customers actually ask form a description list; the sign-off
 * carries a small round headshot (decorative: the name sits beside it).
 */
export function HireLetter() {
  const { title, intro, qa, strong, agents, close, signoff } = hirePage.letter;
  return (
    <Frame width="narrow">
      <article className={styles.letter} aria-labelledby="letter-title">
        <h2 id="letter-title">{title}</h2>
        <p>{intro}</p>
        <dl className={styles.qa}>
          {qa.map((item) => (
            <div key={item.q} className="contents">
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </div>
          ))}
        </dl>
        <p>
          <strong>{strong}</strong> {agents}
        </p>
        <p>{close}</p>
        <div className={styles.signoff}>
          <Image src="/mubin.png" alt="" width={HEADSHOT} height={HEADSHOT} />
          <span>
            <b>{SITE.name}</b>{" "}
            {signoff}
          </span>
        </div>
      </article>
    </Frame>
  );
}
