import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { BROWSER_CHROME } from "@/constants/theme";

/**
 * The web manifest (/manifest.webmanifest): the name, colours and icons a
 * browser uses when someone saves the site to a home screen. It opens as an
 * ordinary browser tab (`display: "browser"`) — a portfolio, not an app that
 * wants a window of its own. The colours are the light theme's ground, as the
 * `theme-color` tag is (constants/theme.ts); the icons are app/icon.svg and the
 * apple icon rendered from it (`npm run build:icons`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} — ${SITE.role}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "browser",
    background_color: BROWSER_CHROME.light,
    theme_color: BROWSER_CHROME.light,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
