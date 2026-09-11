import { DBWHISPER_GOLDEN } from "@/content/evals";
import Link from "next/link";
import { boundaryCases } from "@/content/dbwhisper-boundary";
import { BoundaryInspector } from "./boundary-inspector";

/** Real evaluation aggregates stay outside the illustrative interaction. */
export function HeroProductStage() {
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${DBWHISPER_GOLDEN.date}T00:00:00Z`));

  return <BoundaryInspector cases={boundaryCases} evidence={
    <>
      <p><strong>{DBWHISPER_GOLDEN.exactRatio}</strong> exact golden queries · <strong>{DBWHISPER_GOLDEN.refusalRatio}</strong> unsafe test prompts refused</p>
      <p>Separate evaluation · {date} · <Link href={DBWHISPER_GOLDEN.anchor} prefetch={false}>Method &amp; limits</Link></p>
    </>
  } />;
}
