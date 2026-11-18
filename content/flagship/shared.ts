import type { AwsService } from "./types";

/** The employer, named on the flagship pages only (owner approval, 17 Nov 2026). */
export const EMPLOYER = "Sevina Technologies";

/**
 * The usage figures, in the exact wording the owner approved (17 Nov 2026;
 * Bench Discovery's two surfaces named web platform first at the owner's
 * request, 18 Nov 2026). Every page, card, llms.txt and the assistant read
 * them from here; nothing restates them. `figure` + `label` read as one
 * sentence: "5–10" "users across the web platform and the desktop app".
 */
export const USAGE = {
  "bench-discovery": {
    figure: "5–10",
    label: "users across the web platform and the desktop app",
    sentence: "5–10 users across the web platform and the desktop app",
  },
  careltc: {
    figure: "200+",
    label: "users across care staff and admins",
    sentence: "200+ users across care staff and admins",
    /** The short form, where no split is needed. */
    short: "200+ users",
  },
} as const;

/** The approved line on how the work is built. */
export const AGENT_DIRECTION =
  "I direct AI coding agents: I set the architecture, the quality gates and the invariants, review every change and own the releases.";

/** The badge every private product carries: the same words everywhere. */
export const PRIVATE_NOTICE = "Private repository · walkthrough on request";

/** The label every capture carries inside its frame. */
export const REAL_APP = "Real app · dummy data";

/** What a walkthrough call covers, and what stays private, for both products. */
export const WALKTHROUGH = {
  covers: [
    "The architecture, on a whiteboard",
    "The incident log, in depth",
    "How a release ships",
    "Any decision on this page",
  ],
  staysPrivate: ["Source code", "Client and facility names", "Customer data", "Security details"],
} as const;

/**
 * AWS services, spelled once, so every page names a service the same way.
 * Only services the products use are listed in their `stack.aws`.
 */
export const AWS = {
  ecs: "Amazon ECS",
  fargate: "AWS Fargate",
  ecr: "Amazon ECR",
  alb: "Application Load Balancer",
  rds: "Amazon RDS for PostgreSQL",
  s3: "Amazon S3",
  cloudfront: "Amazon CloudFront",
  cognito: "Amazon Cognito",
  kms: "AWS KMS",
  secrets: "AWS Secrets Manager",
  parameters: "AWS Systems Manager Parameter Store",
  cloudwatch: "Amazon CloudWatch",
  cloudtrail: "AWS CloudTrail",
  cloudformation: "AWS CloudFormation",
  vpc: "Amazon VPC",
  iam: "AWS IAM",
  sts: "AWS STS",
} as const satisfies Record<string, AwsService>;
