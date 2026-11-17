"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Caret } from "@/components/ui/caret-link";
import styles from "./case-study.module.css";

/** The window event the hero's "Watch the recording" pill sends. */
export const PLAY_DEMO_EVENT = "work:play-demo";
/** The frame's id, so the pill can scroll to it without JS too. */
export const DEMO_FRAME_ID = "demo";

/**
 * DemoPlayer — the real product recording inside the hero's browser frame.
 *
 * Nothing downloads until the visitor asks (`preload="none"`, poster only) and
 * nothing autoplays, reduced motion or not. The overlay is a real button; once
 * pressed, the native controls take over (keyboard, captions, seek). Captions
 * come from the recording's own `.vtt`.
 */
export function DemoPlayer({
  slug,
  alt,
  width,
  height,
  playLabel,
}: {
  slug: string;
  alt: string;
  width: number;
  height: number;
  playLabel: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const play = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    void video.play().catch(() => {
      // Autoplay policy or a codec the browser lacks: leave the controls up.
    });
    video.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    window.addEventListener(PLAY_DEMO_EVENT, play);
    return () => window.removeEventListener(PLAY_DEMO_EVENT, play);
  }, [play]);

  return (
    <div className={styles.player} data-started={started ? "" : undefined}>
      <video
        ref={videoRef}
        poster={`/demos/${slug}.webp`}
        aria-label={alt}
        width={width}
        height={height}
        controls={started}
        muted
        playsInline
        preload="none"
        tabIndex={started ? 0 : -1}
      >
        <source src={`/demos/${slug}.webm`} type="video/webm" />
        <track kind="captions" src={`/demos/${slug}.vtt`} srcLang="en" label="English" default />
      </video>
      {started ? null : (
        <button type="button" className={styles.playButton} onClick={play}>
          <span className={styles.playIcon} aria-hidden="true">
            <svg viewBox="0 0 16 16" width="14" height="14">
              <path d="M4.5 2.8v10.4L13 8z" fill="currentColor" />
            </svg>
          </span>
          {playLabel}
        </button>
      )}
    </div>
  );
}

/** The hero pill: scrolls to the frame and starts the recording. */
export function WatchDemoButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className={styles.watchPill}
      onClick={() => {
        document.getElementById(DEMO_FRAME_ID)?.scrollIntoView({ block: "center" });
        window.dispatchEvent(new Event(PLAY_DEMO_EVENT));
      }}
    >
      <span className={styles.watchIcon} aria-hidden="true">
        <svg viewBox="0 0 16 16" width="10" height="10">
          <path d="M4.5 2.8v10.4L13 8z" fill="currentColor" />
        </svg>
      </span>
      {label}
      <Caret />
    </button>
  );
}
