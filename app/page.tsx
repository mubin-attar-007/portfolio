import type { Metadata } from "next";
import { FlagshipHome } from "@/components/home/flagship-home";
import { SITE } from "@/config/site";
import { allWriting } from "@/lib/writing";

const HOME_PATH = "/";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — ${SITE.role}` },
  description:
    "Mubin Attar builds production AI systems with inspectable architecture, deterministic boundaries, and task-level evaluations.",
  alternates: { canonical: `${SITE.url}${HOME_PATH}` },
  openGraph: {
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.role}`,
    description:
      "Production AI systems, shown through architecture, deterministic boundaries, task-level evaluations, and live products.",
    url: `${SITE.url}${HOME_PATH}`,
    type: "website",
  },
};

export default async function Home() {
  const writing = (await allWriting()).slice(0, 3).map(({ slug, title, date }) => ({
    slug,
    title,
    date,
  }));

  return <FlagshipHome writing={writing} />;
}
