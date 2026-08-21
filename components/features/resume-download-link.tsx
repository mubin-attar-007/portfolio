"use client";

import { emitAnalyticsEvent } from "@/lib/analytics";
import type { ReactNode } from "react";

type ResumeDownloadLinkProps = {
  href: string;
  className: string;
  children: ReactNode;
};

export function ResumeDownloadLink({
  href,
  className,
  children,
}: ResumeDownloadLinkProps) {
  const onClick = () => {
    emitAnalyticsEvent("resume_downloaded", { resource: "resume_pdf" });
  };

  return (
    <a
      href={href}
      className={className}
      download
      onClick={onClick}
      // Hidden when printing: offering a PDF download on the page being turned
      // into a PDF is chrome inside the document.
      data-print="hide"
    >
      {children}
    </a>
  );
}
