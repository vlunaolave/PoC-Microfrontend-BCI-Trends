const TIMING_KEY = "__NEUROMFE_TIMING_SCALE__";

declare global {
  interface Window {
    __NEUROMFE_TIMING_SCALE__?: number;
    __NEUROMFE_SHELL__?: boolean;
  }
}

export function getTimingScale(): number {
  if (typeof window !== "undefined" && typeof window[TIMING_KEY] === "number") {
    return window[TIMING_KEY];
  }
  return 1;
}

export function setTimingScale(scale: number): void {
  if (typeof window !== "undefined") {
    window[TIMING_KEY] = scale;
  }
}

export function demoDelay(ms: number): number {
  return Math.round(ms * getTimingScale());
}

export function wait(ms: number): Promise<void> {
  const delay = demoDelay(ms);
  if (delay <= 0) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export function markShellHost(): void {
  if (typeof window !== "undefined") {
    window.__NEUROMFE_SHELL__ = true;
  }
}

export function isEmbeddedInShell(): boolean {
  return typeof window !== "undefined" && window.__NEUROMFE_SHELL__ === true;
}
