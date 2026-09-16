import { describe, expect, it } from "vitest";
import { SAMPLE_RATE_HZ, emptyChannelBuffers, type MotorTask } from "@neuromfe/contracts";
import { classifyMotorImagery } from "./classifier";
import { extractFeatures } from "./features";
import { bandpassFilter } from "./filter";
import { computeBandPower, computeSpectrum } from "./fft";
import { removeDC } from "./remove-dc";
import { generateSyntheticWindow, LiveEEGStream } from "./synthetic";

function sine(freq: number, seconds = 2, sampleRate = SAMPLE_RATE_HZ): number[] {
  const n = sampleRate * seconds;
  return Array.from({ length: n }, (_, i) => Math.sin((2 * Math.PI * freq * i) / sampleRate));
}

describe("removeDC", () => {
  it("removes the mean from a constant offset", () => {
    const result = removeDC([3, 3, 3, 3]);
    expect(result.every((value) => Math.abs(value) < 1e-10)).toBe(true);
  });
});

describe("bandpassFilter", () => {
  it("keeps mu-band energy and attenuates DC and mains", () => {
    const mu = sine(10);
    const slow = sine(1);
    const mains = sine(60);
    const muPower = computeBandPower(computeSpectrum(bandpassFilter(mu, SAMPLE_RATE_HZ), SAMPLE_RATE_HZ), 8, 13);
    const slowPower = computeBandPower(computeSpectrum(bandpassFilter(slow, SAMPLE_RATE_HZ), SAMPLE_RATE_HZ), 8, 13);
    const mainsPower = computeBandPower(computeSpectrum(bandpassFilter(mains, SAMPLE_RATE_HZ), SAMPLE_RATE_HZ), 8, 13);
    expect(muPower).toBeGreaterThan(slowPower * 8);
    expect(muPower).toBeGreaterThan(mainsPower * 8);
  });
});

describe("synthetic EEG + classifier", () => {
  const baseline = extractFeatures(generateSyntheticWindow("REST", 11, "cal"));

  it("RIGHT_HAND produces greater suppression on C3", () => {
    const features = extractFeatures(generateSyntheticWindow("RIGHT_HAND", 21, "right"), baseline);
    expect(features.C3.muSuppression).toBeGreaterThan(features.C4.muSuppression);
    expect(features.C3.muSuppression).toBeGreaterThan(features.CZ.muSuppression);
    expect(classifyMotorImagery(features, "right").predictedTask).toBe("RIGHT_HAND");
  });

  it("LEFT_HAND produces greater suppression on C4", () => {
    const features = extractFeatures(generateSyntheticWindow("LEFT_HAND", 22, "left"), baseline);
    expect(features.C4.muSuppression).toBeGreaterThan(features.C3.muSuppression);
    expect(classifyMotorImagery(features, "left").predictedTask).toBe("LEFT_HAND");
  });

  it("FEET produces greater suppression on Cz", () => {
    const features = extractFeatures(generateSyntheticWindow("FEET", 23, "feet"), baseline);
    expect(features.CZ.muSuppression).toBeGreaterThan(features.C3.muSuppression);
    expect(features.CZ.muSuppression).toBeGreaterThan(features.C4.muSuppression);
    expect(classifyMotorImagery(features, "feet").predictedTask).toBe("FEET");
  });

  it("RIGHT_ARM is weaker than RIGHT_HAND on C3", () => {
    const hand = extractFeatures(generateSyntheticWindow("RIGHT_HAND", 25, "hand"), baseline);
    const arm = extractFeatures(generateSyntheticWindow("RIGHT_ARM", 26, "arm"), baseline);
    expect(hand.C3.muSuppression).toBeGreaterThan(arm.C3.muSuppression);
    expect(classifyMotorImagery(arm, "arm").predictedTask).toBe("RIGHT_ARM");
  });

  it("TONGUE looks bilateral rather than focal", () => {
    const features = extractFeatures(generateSyntheticWindow("TONGUE", 27, "tongue"), baseline);
    const result = classifyMotorImagery(features, "tongue");
    expect(result.predictedTask).toBe("TONGUE");
    expect(Math.abs(features.C3.muSuppression - features.C4.muSuppression)).toBeLessThan(0.2);
  });

  it("REST stays below the motor threshold", () => {
    const features = extractFeatures(generateSyntheticWindow("REST", 24, "rest"), baseline);
    expect(classifyMotorImagery(features, "rest").predictedTask).toBe("REST");
  });
});

describe("live EEG stream follows the body zone", () => {
  function rms(samples: number[]): number {
    return Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / Math.max(samples.length, 1));
  }

  function capture(task: MotorTask) {
    const stream = new LiveEEGStream(7);
    stream.setTask(task);
    const buffers = emptyChannelBuffers();
    stream.push(500, buffers, true);
    buffers.C3.length = 0;
    buffers.CZ.length = 0;
    buffers.C4.length = 0;
    stream.push(600, buffers, true);
    return { C3: rms(buffers.C3), CZ: rms(buffers.CZ), C4: rms(buffers.C4) };
  }

  it("RIGHT_HAND makes C3 much larger than C4 and Cz", () => {
    const energy = capture("RIGHT_HAND");
    expect(energy.C3).toBeGreaterThan(energy.C4 * 4);
    expect(energy.C3).toBeGreaterThan(energy.CZ * 4);
  });

  it("LEFT_HAND makes C4 much larger than C3 and Cz", () => {
    const energy = capture("LEFT_HAND");
    expect(energy.C4).toBeGreaterThan(energy.C3 * 4);
    expect(energy.C4).toBeGreaterThan(energy.CZ * 4);
  });

  it("FEET makes Cz much larger than C3 and C4", () => {
    const energy = capture("FEET");
    expect(energy.CZ).toBeGreaterThan(energy.C3 * 4);
    expect(energy.CZ).toBeGreaterThan(energy.C4 * 4);
  });

  it("TONGUE boosts frontal sites and leaves O1 quiet", () => {
    const stream = new LiveEEGStream(7);
    stream.setTask("TONGUE");
    const buffers = emptyChannelBuffers();
    stream.push(500, buffers, true);
    for (const channel of Object.keys(buffers) as Array<keyof typeof buffers>) {
      buffers[channel].length = 0;
    }
    stream.push(600, buffers, true);
    const rms = (samples: number[]) => Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / Math.max(samples.length, 1));
    expect(rms(buffers.FP1)).toBeGreaterThan(rms(buffers.O1) * 4);
    expect(rms(buffers.F3)).toBeGreaterThan(rms(buffers.O1) * 4);
    expect(rms(buffers.T3)).toBeGreaterThan(rms(buffers.O1) * 4);
    expect(rms(buffers.C3)).toBeLessThan(rms(buffers.FP1));
  });

  it("FEET also boosts Pz alongside Cz", () => {
    const stream = new LiveEEGStream(7);
    stream.setTask("FEET");
    const buffers = emptyChannelBuffers();
    stream.push(500, buffers, true);
    for (const channel of Object.keys(buffers) as Array<keyof typeof buffers>) {
      buffers[channel].length = 0;
    }
    stream.push(600, buffers, true);
    const rms = (samples: number[]) => Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / Math.max(samples.length, 1));
    expect(rms(buffers.PZ)).toBeGreaterThan(rms(buffers.O1) * 4);
    expect(rms(buffers.CZ)).toBeGreaterThan(rms(buffers.O1) * 4);
  });
});
