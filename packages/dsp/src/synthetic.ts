import type { EEGChannel, EEGSource, EEGWindow, MotorTask } from "@neuromfe/contracts";
import { EEG_CHANNELS, SAMPLE_RATE_HZ, SAMPLES_PER_WINDOW, WINDOW_DURATION_MS } from "@neuromfe/contracts";
import { createRng } from "./math";

export interface AmplitudeProfile {
  mu: number;
  beta: number;
}

const REST_PROFILE: Record<EEGChannel, AmplitudeProfile> = {
  C3: { mu: 1, beta: 0.55 },
  CZ: { mu: 1, beta: 0.55 },
  C4: { mu: 1, beta: 0.55 },
};

function taskProfiles(task: MotorTask): Record<EEGChannel, AmplitudeProfile> {
  if (task === "RIGHT_HAND") {
    return {
      C3: { mu: 0.22, beta: 0.16 },
      CZ: { mu: 0.9, beta: 0.82 },
      C4: { mu: 0.95, beta: 0.9 },
    };
  }
  if (task === "LEFT_HAND") {
    return {
      C3: { mu: 0.95, beta: 0.9 },
      CZ: { mu: 0.9, beta: 0.82 },
      C4: { mu: 0.22, beta: 0.16 },
    };
  }
  if (task === "FEET") {
    return {
      C3: { mu: 0.92, beta: 0.86 },
      CZ: { mu: 0.22, beta: 0.16 },
      C4: { mu: 0.92, beta: 0.86 },
    };
  }
  return REST_PROFILE;
}

function generateChannel(
  _channel: EEGChannel,
  profile: AmplitudeProfile,
  rng: () => number,
  sampleCount = SAMPLES_PER_WINDOW,
  sampleRate = SAMPLE_RATE_HZ,
): number[] {
  const samples = new Array<number>(sampleCount);
  const muPhase = rng() * Math.PI * 2;
  const betaPhase = rng() * Math.PI * 2;
  const driftPhase = rng() * Math.PI * 2;
  const mainsPhase = rng() * Math.PI * 2;
  const jitterMu = 0.92 + rng() * 0.16;
  const jitterBeta = 0.92 + rng() * 0.16;
  for (let n = 0; n < sampleCount; n += 1) {
    const t = n / sampleRate;
    const mu = profile.mu * jitterMu * 18 * Math.sin(2 * Math.PI * 10 * t + muPhase);
    const beta = profile.beta * jitterBeta * 9 * Math.sin(2 * Math.PI * 20 * t + betaPhase);
    const drift = 4 * Math.sin(2 * Math.PI * 0.3 * t + driftPhase);
    const mains = 1.2 * Math.sin(2 * Math.PI * 60 * t + mainsPhase);
    const noise = (rng() - 0.5) * 6;
    samples[n] = mu + beta + drift + mains + noise;
  }
  return samples;
}

export function generateSyntheticWindow(task: MotorTask, seed: number, trialId: string): EEGWindow {
  const rng = createRng(seed);
  const profiles = taskProfiles(task);
  return {
    trialId,
    sampleRate: SAMPLE_RATE_HZ,
    durationMs: WINDOW_DURATION_MS,
    channels: EEG_CHANNELS.map((channel) => ({
      channel,
      samples: generateChannel(channel, profiles[channel], rng),
    })),
  };
}

export class SyntheticEEGSource implements EEGSource {
  private trialCounter = 0;

  constructor(private readonly seedBase = 1337) {}

  async calibrate(): Promise<EEGWindow> {
    this.trialCounter += 1;
    return generateSyntheticWindow("REST", this.seedBase + this.trialCounter, `cal-${this.trialCounter}`);
  }

  async startTrial(options?: { task?: MotorTask; seed?: number }): Promise<EEGWindow> {
    this.trialCounter += 1;
    const task = options?.task ?? this.randomTask(this.seedBase + this.trialCounter);
    const seed = options?.seed ?? this.seedBase + this.trialCounter * 17;
    return generateSyntheticWindow(task, seed, `trial-${this.trialCounter}`);
  }

  randomTask(seed: number): MotorTask {
    const rng = createRng(seed);
    const tasks: MotorTask[] = ["REST", "LEFT_HAND", "RIGHT_HAND", "FEET"];
    return tasks[Math.floor(rng() * tasks.length)] ?? "REST";
  }
}

export class DatasetEEGSource implements EEGSource {
  async calibrate(): Promise<EEGWindow> {
    throw new Error("DatasetEEGSource no está implementado en esta PoC.");
  }

  async startTrial(): Promise<EEGWindow> {
    throw new Error("DatasetEEGSource no está implementado en esta PoC.");
  }
}

export class HardwareEEGSource implements EEGSource {
  async calibrate(): Promise<EEGWindow> {
    throw new Error("HardwareEEGSource no está implementado en esta PoC.");
  }

  async startTrial(): Promise<EEGWindow> {
    throw new Error("HardwareEEGSource no está implementado en esta PoC.");
  }
}
