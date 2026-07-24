type AnalyticsWindow = Window & {
  va?: (...args: unknown[]) => void;
};

export type AnalyticsData = Record<string, unknown>;

/**
 * Privacy-first custom analytics helper with graceful fallbacks.
 *
 * Primary shape: Vercel-style `va("event", { name, data })`.
 * Fallback shape: `va("track", name, payload)`.
 */
export function emitAnalyticsEvent(name: string, data: AnalyticsData = {}): void {
  if (typeof window === "undefined") return;

  const analytics = (window as AnalyticsWindow).va;
  if (typeof analytics !== "function") return;

  const payload = { ...data, event: name };

  try {
    analytics("event", { name, data: payload });
    return;
  } catch {
    // Fallback for alternate signatures.
  }

  try {
    analytics("track", name, payload);
  } catch {
    // Analytics is optional and intentionally fail-open.
  }
}

