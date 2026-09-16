import type { EventName, NeuroEventMap } from "./events";

const EVENT_PREFIX = "neuromfe:";

type Listener<T> = (payload: T) => void;

function fullName(eventName: EventName): string {
  return `${EVENT_PREFIX}${eventName}`;
}

function getTarget(): EventTarget | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window;
}

export function publish<K extends EventName>(eventName: K, payload: NeuroEventMap[K]): void {
  const target = getTarget();
  if (!target) {
    return;
  }
  target.dispatchEvent(
    new CustomEvent(fullName(eventName), {
      detail: payload,
    }),
  );
}

export function subscribe<K extends EventName>(
  eventName: K,
  callback: Listener<NeuroEventMap[K]>,
): () => void {
  const target = getTarget();
  if (!target) {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const custom = event as CustomEvent<NeuroEventMap[K]>;
    callback(custom.detail);
  };

  target.addEventListener(fullName(eventName), handler);
  return () => {
    target.removeEventListener(fullName(eventName), handler);
  };
}

export function unsubscribeAll(unsubscribers: Array<() => void>): void {
  for (const unsubscribe of unsubscribers) {
    unsubscribe();
  }
}
