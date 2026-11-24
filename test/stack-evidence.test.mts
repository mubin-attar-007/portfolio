// The "Used in" evidence (components/misc/stack-evidence.ts) behind /skills and /uses:
// a tool links a case study only when that case study lists it in its own stack —
// a flagship's typed stack (its layers and the AWS services it runs on) or a public
// case study's `stack` frontmatter. Nothing is linked by hand, and nothing is invented.
//
//   node --import ./test/alias-loader.mjs --test test/stack-evidence.test.mts

import test from "node:test";
import assert from "node:assert/strict";

import { evidenceFor, evidenceForAny } from "../components/misc/stack-evidence.ts";
import { flagships } from "../content/flagship/index.ts";

const slugs = (tool: string): string[] => evidenceFor(tool).map((e) => e.slug);

test("every AWS service a flagship runs on is its evidence, by its full and its short name", () => {
  for (const flagship of flagships) {
    for (const service of flagship.stack.aws) {
      assert.ok(slugs(service).includes(flagship.slug), `${flagship.slug}: "${service}"`);
    }
    assert.ok(slugs("AWS").includes(flagship.slug), `${flagship.slug}: "AWS"`);
  }
  // Short names point only at the product that uses the service.
  assert.deepEqual(slugs("CloudFront"), ["careltc"]);
  assert.deepEqual(slugs("KMS"), ["bench-discovery"]);
  assert.deepEqual(slugs("ECS"), ["bench-discovery", "careltc"]);
});

test("a compound stack entry counts for each tool it names, versions ignored", () => {
  assert.ok(slugs(".NET").includes("bench-discovery"), "C# on .NET");
  assert.ok(slugs("pgvector").includes("bench-discovery"), "PostgreSQL with pgvector");
  assert.ok(slugs("React Native").includes("careltc"), "React Native");
});

test("a private product's stack names its tools without versions", () => {
  // An exact version tells an attacker which known flaws to try. The public
  // projects keep theirs: their source is public anyway.
  const VERSION = /\b(?:v?\d+(?:\.\d+)+|v\d+|(?:SDK|CSS|JS|Node|React|Python|PostgreSQL|Postgres|Expo|Next\.js|NET) \d+)\b/;
  for (const flagship of flagships) {
    const tools = [...flagship.stack.groups.flatMap((group) => group.items), ...flagship.stack.aws];
    for (const tool of tools) assert.doesNotMatch(tool, VERSION, `${flagship.slug}: "${tool}"`);
  }
});

test("a public case study's languages are its evidence", () => {
  // /skills' Languages row once marked only the flagships: the public stacks
  // listed frameworks but no language, as if DBWhisper used no Python.
  for (const slug of ["dbwhisper", "tradepulse"]) {
    assert.ok(slugs("Python").includes(slug), `${slug}: "Python"`);
    assert.ok(slugs("TypeScript").includes(slug), `${slug}: "TypeScript"`);
  }
});

test("a tool no case study lists links nowhere", () => {
  assert.deepEqual(evidenceFor("Kubernetes"), []);
  assert.deepEqual(evidenceForAny(["Kubernetes", "Terraform"]), []);
});

test("the flagships come first, then the public case studies, each once", () => {
  const postgres = slugs("PostgreSQL");
  assert.deepEqual(postgres.slice(0, 2), ["bench-discovery", "careltc"]);
  assert.ok(postgres.includes("dbwhisper"), "DBWhisper lists Postgres (an alias of PostgreSQL)");
  const any = evidenceForAny(["FastAPI", "PostgreSQL", "Next.js"]).map((e) => e.slug);
  assert.equal(new Set(any).size, any.length, "each case study once");
  assert.deepEqual(any.slice(0, 2), ["bench-discovery", "careltc"]);
});
