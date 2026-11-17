import { FlagshipRoute, flagshipMetadata } from "@/components/flagship/flagship-route";

/** /work/careltc — the CareLTC flagship case study. */
export const metadata = flagshipMetadata("careltc");

export default function CareLtcPage() {
  return <FlagshipRoute slug="careltc" />;
}
