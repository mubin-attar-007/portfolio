import { DBWHISPER_EVIDENCE } from "@/content/evals";
import Link from "next/link";
import { boundaryCases } from "@/content/dbwhisper-boundary";
import { BoundaryInspector } from "./boundary-inspector";

/**
 * The hero figure: illustrative boundary cases, then one measured result kept
 * outside the illustration. The result is DBWhisper's policy-corpus run, read
 * from the eval registry and labelled in the frame as a deterministic policy
 * test, so it cannot be mistaken for model accuracy.
 */
export function HeroProductStage() {
  const { policy } = DBWHISPER_EVIDENCE;
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${policy.date}T00:00:00Z`));

  return <BoundaryInspector cases={boundaryCases} evidence={
    <>
      <p><strong>{policy.ratio}</strong> {policy.label}</p>
      <p>{policy.kind} · {date} · <Link href={policy.anchor} prefetch={false}>Method &amp; limits</Link></p>
    </>
  } />;
}
