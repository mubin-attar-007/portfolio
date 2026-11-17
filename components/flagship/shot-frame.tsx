import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { BrowserFrame } from "@/components/ui/browser-frame";
import { cx } from "@/components/ui/cx";
import { PhoneFrame, phoneFrameAspect } from "@/components/ui/phone-frame";
import { REAL_APP } from "@/content/flagship/shared";
import type { FrameKind, Screenshot } from "@/content/flagship/types";
import styles from "./frames.module.css";

/** The browser frame's title bar, in px (browser-frame.module.css `.bar`). */
const BROWSER_BAR = 34;

/**
 * The CSS a layout needs to fit a frame inside a box of known size: the
 * frame's width ÷ height (`--ar`) and any chrome that does not scale with it
 * (`--chrome`, the browser bar). See `.fit` in frames.module.css.
 */
export function frameFit(shot: Pick<Screenshot, "width" | "height" | "frame">): CSSProperties {
  const aspect = shot.frame === "phone" ? phoneFrameAspect(shot.width, shot.height) : shot.width / shot.height;
  const chrome = shot.frame === "browser" ? BROWSER_BAR : 0;
  return { "--ar": aspect.toFixed(4), "--chrome": `${chrome}px` } as CSSProperties;
}

/**
 * Frame — the surface a capture belongs to: a browser window for a web app,
 * the desktop app's own window, a phone, or a sheet of paper for a document
 * the app wrote. `product` names the browser frame's address pill (never a
 * real address).
 */
export function Frame({
  kind,
  product,
  className,
  children,
}: {
  kind: FrameKind;
  product: string;
  className?: string;
  children: ReactNode;
}) {
  switch (kind) {
    case "browser":
      return (
        <BrowserFrame url={product} className={className}>
          {children}
        </BrowserFrame>
      );
    case "phone":
      return <PhoneFrame className={className}>{children}</PhoneFrame>;
    case "window":
      return <div className={cx(styles.window, className)}>{children}</div>;
    case "page":
      return <div className={cx(styles.page, className)}>{children}</div>;
  }
}

/**
 * ShotFrame — one capture of the real app in its frame, labelled inside the
 * frame "Real app · dummy data" (the content law: a capture never reads as a
 * live result).
 *
 * Props: `shot` (content/flagship), `product` (the browser pill's text),
 * `sizes` (the image's rendered widths), `priority` (the one above-the-fold
 * capture: eager and high fetch priority; every other capture is lazy),
 * `label` (default true), `labelAt` (`bottom`, or `top` for a frame whose
 * lower part a stage crops away, so the label is never cut off with it).
 *
 * A11y: the image carries the shot's alt text; the label is plain text read
 * after it. Performance: `next/image` with the capture's intrinsic size.
 */
export function ShotFrame({
  shot,
  product,
  sizes,
  priority = false,
  label = true,
  labelAt = "bottom",
  className,
}: {
  shot: Screenshot;
  product: string;
  sizes: string;
  priority?: boolean;
  label?: boolean;
  labelAt?: "bottom" | "top";
  className?: string;
}) {
  return (
    <Frame kind={shot.frame} product={product} className={className}>
      <div className={styles.shot}>
        <Image
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
        />
        {label ? <span className={cx(styles.label, labelAt === "top" && styles.labelTop)}>{REAL_APP}</span> : null}
      </div>
    </Frame>
  );
}
