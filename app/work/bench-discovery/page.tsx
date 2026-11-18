import { FlagshipRoute, flagshipMetadata } from "@/components/flagship/flagship-route";

/** /work/bench-discovery — the Bench Discovery flagship case study. */
export const metadata = flagshipMetadata("bench-discovery");

export default function BenchDiscoveryPage() {
  return <FlagshipRoute slug="bench-discovery" />;
}
