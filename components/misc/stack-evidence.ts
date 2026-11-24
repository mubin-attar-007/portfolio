import fs from "node:fs";
import path from "node:path";
import { flagshipHref, flagships, type Flagship } from "@/content/flagship";
import type { AwsService } from "@/content/flagship/types";
import { projects } from "@/content/projects";

/**
 * Stack evidence — which case studies list a tool in their own stack: a
 * flagship's typed stack (content/flagship: the technology by layer, and the
 * AWS services it is hosted on) and a public case study's `stack` frontmatter
 * (content/projects/<slug>.mdx). /uses and /skills link a tool to a case study
 * ONLY through this lookup, so a "used in" link is never asserted by hand: if
 * the case study does not list the tool, no link is drawn.
 *
 * Server-only (reads the filesystem at render; the pages are static).
 */

export type Evidence = { slug: string; title: string; href: string };

/** Names the case studies write differently from /uses and the résumé. */
const ALIASES: Record<string, readonly string[]> = {
  postgresql: ["postgres"],
  "django / drf": ["django", "drf"],
  "django/drf": ["django", "drf"],
  "node.js": ["node"],
};

/** The short names an AWS service also goes by ("Amazon ECS" is "ECS"). */
const AWS_SHORT_NAMES = {
  "Amazon ECS": ["ECS"],
  "AWS Fargate": ["Fargate"],
  "Amazon ECR": ["ECR"],
  "Application Load Balancer": ["ALB", "Elastic Load Balancing"],
  "Amazon RDS for PostgreSQL": ["Amazon RDS", "RDS", "RDS for PostgreSQL"],
  "Amazon S3": ["S3"],
  "Amazon CloudFront": ["CloudFront"],
  "Amazon Cognito": ["Cognito"],
  "AWS KMS": ["KMS"],
  "AWS Secrets Manager": ["Secrets Manager"],
  "AWS Systems Manager Parameter Store": ["Systems Manager Parameter Store", "Parameter Store", "SSM Parameter Store"],
  "Amazon CloudWatch": ["CloudWatch"],
  "AWS CloudTrail": ["CloudTrail"],
  "AWS CloudFormation": ["CloudFormation"],
  "Amazon VPC": ["VPC"],
  "AWS IAM": ["IAM"],
  "AWS STS": ["STS"],
} as const satisfies Record<AwsService, readonly string[]>;

/** Every product hosted on AWS also answers to the platform's own name. */
const AWS_PLATFORM = ["AWS", "Amazon Web Services"] as const;

const STACK_LINE = /^stack:\s*(\[.*\])\s*$/m;

function readStack(slug: string): string[] {
  try {
    const source = fs.readFileSync(path.join(process.cwd(), "content", "projects", `${slug}.mdx`), "utf8");
    const match = STACK_LINE.exec(source);
    const parsed: unknown = match ? JSON.parse(match[1]!) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/**
 * The names one stack entry stands for: the entry, and each tool a compound
 * entry joins ("C# on .NET" → "C#", ".NET"; "PdfPig and PDFium";
 * "PostgreSQL 17 with pgvector" → "pgvector").
 */
const entryNames = (entry: string): string[] => [entry, ...entry.split(/\s+(?:with|and|on)\s+/)];

/** A flagship's stack as names: its technology by layer, then its AWS services and their short names. */
function flagshipNames(flagship: Flagship): string[] {
  const { groups, aws } = flagship.stack;
  return [
    ...groups.flatMap((group) => group.items.flatMap(entryNames)),
    ...aws.flatMap((service) => [service, ...AWS_SHORT_NAMES[service]]),
    ...(aws.length > 0 ? AWS_PLATFORM : []),
  ];
}

/** The case studies in the site's order of work, flagships first, each with its stack as lower-case names. */
const STACKS: readonly { evidence: Evidence; stack: readonly string[] }[] = [
  ...flagships.map((flagship) => ({
    evidence: { slug: flagship.slug, title: flagship.name, href: flagshipHref(flagship.slug) },
    stack: flagshipNames(flagship),
  })),
  ...[...projects]
    .sort((a, b) => a.order - b.order)
    .map((project) => ({
      evidence: { slug: project.slug, title: project.title, href: `/work/${project.slug}` },
      stack: readStack(project.slug).flatMap(entryNames),
    })),
].map(({ evidence, stack }) => ({ evidence, stack: stack.map((name) => name.trim().toLowerCase()) }));

/** A stack entry names the tool when it is the tool, or the tool plus a version ("Next.js 15"). */
function names(entry: string, term: string): boolean {
  return entry === term || entry.startsWith(`${term} `);
}

/** The case studies whose stack lists `tool` (case-insensitive, versions ignored), flagships first. */
export function evidenceFor(tool: string): Evidence[] {
  const term = tool.trim().toLowerCase();
  const terms = [term, ...(ALIASES[term] ?? [])];
  return STACKS.filter(({ stack }) => stack.some((entry) => terms.some((t) => names(entry, t)))).map(
    ({ evidence }) => evidence,
  );
}

/** The case studies that list ANY of `tools`, each once, in the site's order of work. */
export function evidenceForAny(tools: readonly string[]): Evidence[] {
  const slugs = new Set(tools.flatMap((tool) => evidenceFor(tool).map((e) => e.slug)));
  return STACKS.filter(({ evidence }) => slugs.has(evidence.slug)).map(({ evidence }) => evidence);
}
