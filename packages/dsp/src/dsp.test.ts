import { describe, expect, it } from "vitest";
import { SAMPLE_RATE_HZ } from "@neuromfe/contracts";
import { classifyMotorImagery } from "./classifier";
import { extractFeatures } from "./features";
import { bandpassFilter } from "./filter";
import { computeBandPower, computeSpectrum } from "./fft";
import { removeDC } from "./remove-dc";
import { generateSyntheticWindow } from "./synthetic";

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
