import type { EEGChannel, EEGSource, EEGWindow, MotorTask } from "@neuromfe/contracts";
import {
  EEG_CHANNELS,
  SAMPLE_RATE_HZ,
  SAMPLES_PER_WINDOW,
  WINDOW_DURATION_MS,
  channelsForMotorTask,
} from "@neuromfe/contracts";
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
  if (task === "RIGHT_ARM") {
    return {
      C3: { mu: 0.58, beta: 0.5 },
      CZ: { mu: 0.88, beta: 0.8 },
      C4: { mu: 0.94, beta: 0.88 },
    };
  }
  if (task === "LEFT_ARM") {
    return {
      C3: { mu: 0.94, beta: 0.88 },
      CZ: { mu: 0.88, beta: 0.8 },
      C4: { mu: 0.58, beta: 0.5 },
    };
  }
  if (task === "FEET") {
    return {
      C3: { mu: 0.92, beta: 0.86 },
      CZ: { mu: 0.22, beta: 0.16 },
      C4: { mu: 0.92, beta: 0.86 },
    };
  }
  if (task === "TONGUE") {
    return {
      C3: { mu: 0.52, beta: 0.46 },
      CZ: { mu: 0.5, beta: 0.44 },
      C4: { mu: 0.52, beta: 0.46 },
    };
  }
  return REST_PROFILE;
}

function liveDisplayProfiles(task: MotorTask): Record<EEGChannel, AmplitudeProfile> {
  const quiet = { mu: 0.08, beta: 0.04 };
  const idle = { mu: 0.48, beta: 0.24 };
  const strong = { mu: 3.6, beta: 1.9 };
  const medium = { mu: 2.25, beta: 1.2 };
  const bilateral = { mu: 2.05, beta: 1.1 };
  if (task === "RIGHT_HAND") return { C3: strong, CZ: quiet, C4: quiet };
  if (task === "RIGHT_ARM") return { C3: medium, CZ: quiet, C4: quiet };
  if (task === "LEFT_HAND") return { C3: quiet, CZ: quiet, C4: strong };
  if (task === "LEFT_ARM") return { C3: quiet, CZ: quiet, C4: medium };
  if (task === "FEET") return { C3: quiet, CZ: strong, C4: quiet };
  if (task === "TONGUE") return { C3: bilateral, CZ: medium, C4: bilateral };
  return { C3: idle, CZ: idle, C4: idle };
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
    const mu = profile.mu * jitterMu * 18 * Math.sin(2 * Math.PI * (10 + 0.35 * Math.sin(2 * Math.PI * 0.2 * t)) * t + muPhase);
    const beta = profile.beta * jitterBeta * 9 * Math.sin(2 * Math.PI * (20 + 0.5 * Math.sin(2 * Math.PI * 0.13 * t)) * t + betaPhase);
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
    const tasks: MotorTask[] = ["REST", "LEFT_HAND", "RIGHT_HAND", "LEFT_ARM", "RIGHT_ARM", "FEET", "TONGUE"];
    return tasks[Math.floor(rng() * tasks.length)] ?? "REST";
  }
}

interface ChannelOscillator {
  muPhase: number;
  betaPhase: number;
  driftPhase: number;
  mainsPhase: number;
  muFreq: number;
  betaFreq: number;
  mu: number;
  beta: number;
}

const BUFFER_SECONDS = 2.4;

export class LiveEEGStream {
  private time = 0;
  private task: MotorTask = "REST";
  private oscillators: Record<EEGChannel, ChannelOscillator>;
  private target: Record<EEGChannel, AmplitudeProfile> = { ...REST_PROFILE };

  constructor(seed = 2026) {
    const rng = createRng(seed);
    const make = (): ChannelOscillator => ({
      muPhase: rng() * Math.PI * 2,
      betaPhase: rng() * Math.PI * 2,
      driftPhase: rng() * Math.PI * 2,
      mainsPhase: rng() * Math.PI * 2,
      muFreq: 9.4 + rng() * 1.4,
      betaFreq: 18.5 + rng() * 3,
      mu: REST_PROFILE.C3.mu,
      beta: REST_PROFILE.C3.beta,
    });
    this.oscillators = { C3: make(), CZ: make(), C4: make() };
  }

  setTask(task: MotorTask): void {
    this.task = task;
    this.target = liveDisplayProfiles(task);
  }

  push(sampleCount: number, buffers: Record<EEGChannel, number[]>, filtered: boolean, maxLength = Math.round(SAMPLE_RATE_HZ * BUFFER_SECONDS)): void {
    const dt = 1 / SAMPLE_RATE_HZ;
    const linked = new Set(channelsForMotorTask(this.task));
    for (let i = 0; i < sampleCount; i += 1) {
      this.time += dt;
      const envelope = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 1.15 * this.time));
      for (const channel of EEG_CHANNELS) {
        const osc = this.oscillators[channel];
        const target = this.target[channel];
        osc.mu += (target.mu - osc.mu) * 0.18;
        osc.beta += (target.beta - osc.beta) * 0.18;
        const wander = 0.25 * Math.sin(2 * Math.PI * 0.18 * this.time + osc.driftPhase);
        osc.muPhase += 2 * Math.PI * (osc.muFreq + wander) * dt;
        osc.betaPhase += 2 * Math.PI * (osc.betaFreq + wander * 0.4) * dt;
        osc.driftPhase += 2 * Math.PI * 0.28 * dt;
        osc.mainsPhase += 2 * Math.PI * 60 * dt;
        const pulse = linked.has(channel) ? envelope : 1;
        const mu = osc.mu * 20 * pulse * Math.sin(osc.muPhase);
        const beta = osc.beta * 10 * pulse * Math.sin(osc.betaPhase);
        const drift = filtered ? 0 : 3.2 * Math.sin(osc.driftPhase);
        const mains = filtered ? 0 : 1.1 * Math.sin(osc.mainsPhase);
        const noise = (Math.sin(this.time * 37.1 + osc.muPhase) * 0.7 + Math.sin(this.time * 53.3 + osc.betaPhase)) * (filtered ? 0.35 : 0.9);
        const sample = mu + beta + drift + mains + noise;
        const buffer = buffers[channel];
        buffer.push(sample);
        if (buffer.length > maxLength) {
          buffer.splice(0, buffer.length - maxLength);
        }
      }
    }
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
