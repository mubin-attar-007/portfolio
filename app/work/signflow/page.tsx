import { FlagshipRoute, flagshipMetadata } from "@/components/flagship/flagship-route";

/** /work/signflow — the SignFlow flagship case study. */
export const metadata = flagshipMetadata("signflow");

export default function SignFlowPage() {
  return <FlagshipRoute slug="signflow" />;
}
