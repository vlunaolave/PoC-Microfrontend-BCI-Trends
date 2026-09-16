import type { ChannelFeatures, EEGChannel, EEGFeatures, EEGWindow } from "@neuromfe/contracts";
import { BETA_BAND, MU_BAND } from "./constants";
import { bandpassFilter } from "./filter";
import { computeBandPower, computeSpectrum } from "./fft";
import { clamp } from "./math";
import { removeDC } from "./remove-dc";

export function calculateSuppression(currentPower: number, baselinePower: number): number {
  if (!Number.isFinite(currentPower) || !Number.isFinite(baselinePower) || baselinePower <= 1e-12) {
    return 0;
  }
  return clamp(1 - currentPower / baselinePower, -1, 1);
}

function channelPower(samples: number[], sampleRate: number): { muPower: number; betaPower: number } {
  const detrended = removeDC(samples);
  const filtered = bandpassFilter(detrended, sampleRate);
  const spectrum = computeSpectrum(filtered, sampleRate);
  return {
    muPower: computeBandPower(spectrum, MU_BAND.low, MU_BAND.high),
    betaPower: computeBandPower(spectrum, BETA_BAND.low, BETA_BAND.high),
  };
}

function emptyFeatures(): ChannelFeatures {
  return { muPower: 0, betaPower: 0, muSuppression: 0, betaSuppression: 0 };
}

export function extractChannelFeatures(
  samples: number[],
  sampleRate: number,
  baseline?: ChannelFeatures,
): ChannelFeatures {
  const power = channelPower(samples, sampleRate);
  return {
    muPower: power.muPower,
    betaPower: power.betaPower,
    muSuppression: baseline ? calculateSuppression(power.muPower, baseline.muPower) : 0,
    betaSuppression: baseline ? calculateSuppression(power.betaPower, baseline.betaPower) : 0,
  };
}

export function extractFeatures(window: EEGWindow, baseline?: EEGFeatures): EEGFeatures {
  const byChannel = new Map<EEGChannel, number[]>();
  for (const channel of window.channels) {
    byChannel.set(channel.channel, channel.samples);
  }
  const sampleRate = window.sampleRate;
  return {
    C3: extractChannelFeatures(byChannel.get("C3") ?? [], sampleRate, baseline?.C3),
    CZ: extractChannelFeatures(byChannel.get("CZ") ?? [], sampleRate, baseline?.CZ),
    C4: extractChannelFeatures(byChannel.get("C4") ?? [], sampleRate, baseline?.C4),
  };
}

export function emptyEegFeatures(): EEGFeatures {
  return { C3: emptyFeatures(), CZ: emptyFeatures(), C4: emptyFeatures() };
}
