"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { buttonClassName } from "@/components/ui/button";
import { Caret } from "@/components/ui/caret-link";
import { cx } from "@/components/ui/cx";
import { reveal } from "@/components/work/reveal";
import styles from "./case-study.module.css";

/** The window event a "Watch" button sends; `detail.id` names the player it starts. */
export const PLAY_DEMO_EVENT = "work:play-demo";
/** The public case study's frame id, so its pill can scroll to it without JS too. */
export const DEMO_FRAME_ID = "demo";

type PlayDetail = { id: string };

function PlayIcon({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true">
      <path d="M4.5 2.8v10.4L13 8z" fill="currentColor" />
    </svg>
  );
}

/**
 * DemoPlayer — a real product recording inside its frame.
 *
 * Nothing downloads until the visitor asks, and nothing autoplays, reduced
 * motion or not. The video is `preload="none"`; its poster is a `next/image`
 * laid over it, sized by `sizes` and lazy unless `priority` (a hero's one
 * frame above the fold), so a recording far down the page, or on a hidden tab,
 * costs nothing at load — a `poster` attribute would be fetched at once. The
 * overlay's button plays it: the poster becomes the video's own (the same
 * file, already loaded), so it stays up until the first frame, and the native
 * controls take over (keyboard, captions, seek). The caption track describes
 * each scene (the recordings are silent).
 *
 * Props: `id` — the name a `WatchDemoButton` targets (several players can
 * share a page); `src`, `poster`, `captions` — the .webm, its poster and its
 * .vtt; `alt` — the video's accessible name; `width`/`height` — its size, so
 * the frame never shifts; `playLabel` — the overlay button's text; `sizes` —
 * the poster's rendered widths; `priority` — load the poster at once.
 */
export function DemoPlayer({
  id,
  src,
  poster,
  captions,
  alt,
  width,
  height,
  playLabel,
  sizes,
  priority = false,
}: {
  id: string;
  src: string;
  poster: string;
  captions?: string;
  alt: string;
  width: number;
  height: number;
  playLabel: string;
  sizes: string;
  priority?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const [started, setStarted] = useState(false);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // The poster the visitor is looking at becomes the video's own, so it
    // stays up until the first frame arrives. "Watch the demo" can press play
    // before the lazy overlay has started loading; the file itself stands in.
    video.poster = posterRef.current?.currentSrc || poster;
    setStarted(true);
    void video.play().catch(() => {
      // Autoplay policy or a codec the browser lacks: leave the controls up.
    });
    video.focus({ preventScroll: true });
  }, [poster]);

  useEffect(() => {
    const onPlay = (event: Event) => {
      if ((event as CustomEvent<PlayDetail>).detail?.id === id) play();
    };
    window.addEventListener(PLAY_DEMO_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_DEMO_EVENT, onPlay);
  }, [id, play]);

  return (
    <div className={styles.player} data-started={started ? "" : undefined}>
      <video
        ref={videoRef}
        aria-label={alt}
        width={width}
        height={height}
        controls={started}
        muted
        playsInline
        preload="none"
        tabIndex={started ? 0 : -1}
      >
        <source src={src} type="video/webm" />
        {captions ? <track kind="captions" src={captions} srcLang="en" label="English" default /> : null}
      </video>
      {started ? null : (
        <>
          {/* Decorative: the video is named by `alt`, and the button says what it does. */}
          <Image
            ref={posterRef}
            src={poster}
            alt=""
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className={styles.poster}
            data-poster=""
          />
          <button type="button" className={styles.playButton} onClick={play}>
            <span className={styles.playIcon} aria-hidden="true">
              <PlayIcon size={14} />
            </span>
            {playLabel}
          </button>
        </>
      )}
    </div>
  );
}

/**
 * WatchDemoButton — scrolls to a recording's frame (the element with id
 * `target`) and starts the player of the same id. It first sends the reveal
 * event (components/work/reveal.ts) from the frame, so a frame inside a hidden
 * tab panel is shown before the scroll.
 *
 * `variant`: `pill` (the public case study's hero pill, a violet play mark) or
 * `button` (a light large button with an ink play mark, beside a violet one).
 */
export function WatchDemoButton({
  label,
  target,
  variant = "pill",
}: {
  label: string;
  target: string;
  variant?: "pill" | "button";
}) {
  const pill = variant === "pill";
  return (
    <button
      type="button"
      className={pill ? styles.watchPill : cx(buttonClassName("light", "lg"), styles.watchButton)}
      onClick={() => {
        const frame = document.getElementById(target);
        if (frame) {
          // A recording on a gallery surface the visitor switched away from is
          // hidden: ask for it to be shown before scrolling to it.
          reveal(frame);
          frame.scrollIntoView({ block: "center" });
        }
        window.dispatchEvent(new CustomEvent<PlayDetail>(PLAY_DEMO_EVENT, { detail: { id: target } }));
      }}
    >
      <span className={pill ? styles.watchIcon : styles.watchMark} aria-hidden="true">
        <PlayIcon size={pill ? 10 : 9} />
      </span>
      {label}
      <Caret />
    </button>
  );
}
