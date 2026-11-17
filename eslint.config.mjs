import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Every next/link states how it prefetches: `false`, or on intent as the
    // primary nav does (components/layout/nav-links.tsx). The default viewport
    // prefetch downloads routes in the background and preloads their CSS, and
    // Chrome warns when that CSS goes unused — the site ships zero console
    // warnings (spec/ENGINEERING.md §2, §5).
    files: ["**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='Link']:not(:has(JSXAttribute[name.name='prefetch']))",
          message:
            "Set `prefetch` on every <Link>: `prefetch={false}`, or prefetch on intent like components/layout/nav-links.tsx (spec/ENGINEERING.md §5).",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    "dist/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
