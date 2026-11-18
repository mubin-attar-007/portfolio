"use client";

import { useState, type ReactNode } from "react";
import { PauseButton } from "./pause-button";

/**
 * Pausable — gives a server-rendered band that moves on its own (a
 * MarqueeGroup) a pause button: it marks its box `data-paused`, which the
 * band's CSS reads (marquee.module.css), and places the button with
 * `buttonClassName`.
 */
export function Pausable({
  labels,
  className,
  buttonClassName,
  children,
}: {
  labels: { pause: string; play: string };
  className?: string;
  buttonClassName?: string;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={className} data-paused={paused ? "" : undefined}>
      {children}
      <PauseButton paused={paused} onToggle={() => setPaused((value) => !value)} labels={labels} className={buttonClassName} />
    </div>
  );
}
