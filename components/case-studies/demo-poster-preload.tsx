"use client";

import ReactDOM from "react-dom";

/**
 * Route-scoped resource hint for the product-tour poster.
 *
 * A video poster is fetched like an image, but unlike `next/image` it has no
 * built-in priority API. Emitting the hint from the case-study route keeps the
 * asset out of unrelated pages while letting the browser request it with the
 * rest of the critical document resources.
 */
export function DemoPosterPreload({ href }: { href: string }) {
  ReactDOM.preload(href, { as: "image", fetchPriority: "high" });
  return null;
}
