import { afterEach, describe, expect, it, vi } from "vitest";
import { EVENT_NAMES } from "./events";
import { publish, subscribe } from "./event-bus";

class MemoryTarget extends EventTarget {}

describe("event bus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("delivers typed payloads and unsubscribes", () => {
    const target = new MemoryTarget();
    vi.stubGlobal("window", target);

    const received: string[] = [];
    const unsubscribe = subscribe(EVENT_NAMES.MFE_READY, (payload) => {
      received.push(payload.id);
    });

    publish(EVENT_NAMES.MFE_READY, {
      id: "body-mfe",
      version: "1.0.0",
      timestamp: 1,
    });

    unsubscribe();

    publish(EVENT_NAMES.MFE_READY, {
      id: "brain-mfe",
      version: "1.0.0",
      timestamp: 2,
    });

    expect(received).toEqual(["body-mfe"]);
  });
});
