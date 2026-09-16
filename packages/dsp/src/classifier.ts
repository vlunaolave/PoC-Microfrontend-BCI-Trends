import type { ClassificationResult, EEGChannel, EEGFeatures, MotorTask } from "@neuromfe/contracts";
import { MAX_CONFIDENCE, MIN_CONFIDENCE, MOVEMENT_THRESHOLD } from "./constants";
import { clamp } from "./math";

export interface ChannelScore {
  channel: EEGChannel;
  task: MotorTask;
  score: number;
}

function combinedSuppression(features: EEGFeatures, channel: EEGChannel): number {
  const channelFeatures = features[channel];
  return 0.6 * channelFeatures.muSuppression + 0.4 * channelFeatures.betaSuppression;
}

export function scoreChannels(features: EEGFeatures): ChannelScore[] {
  return [
    { channel: "C3", task: "RIGHT_HAND", score: combinedSuppression(features, "C3") },
    { channel: "CZ", task: "FEET", score: combinedSuppression(features, "CZ") },
    { channel: "C4", task: "LEFT_HAND", score: combinedSuppression(features, "C4") },
  ];
}

const HAND_SCORE = 0.78;
const TONGUE_SPREAD = 0.16;
const TONGUE_FLOOR = 0.28;

function lateralTask(channel: EEGChannel, score: number): MotorTask {
  if (channel === "C3") return score >= HAND_SCORE ? "RIGHT_HAND" : "RIGHT_ARM";
  if (channel === "C4") return score >= HAND_SCORE ? "LEFT_HAND" : "LEFT_ARM";
  return "FEET";
}

export function classifyMotorImagery(features: EEGFeatures, trialId: string): ClassificationResult {
  const scores = [...scoreChannels(features)].sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];
  const third = scores[2];

  if (!best || best.score < MOVEMENT_THRESHOLD) {
    return {
      trialId,
      predictedTask: "REST",
      confidence: clamp(0.72 - (best?.score ?? 0), MIN_CONFIDENCE, 0.86),
      dominantChannel: null,
      features,
    };
  }

  const spread = best.score - (third?.score ?? 0);
  const bilateral =
    best.score >= TONGUE_FLOOR &&
    (second?.score ?? 0) >= TONGUE_FLOOR &&
    (third?.score ?? 0) >= TONGUE_FLOOR &&
    spread < TONGUE_SPREAD;

  if (bilateral) {
    return {
      trialId,
      predictedTask: "TONGUE",
      confidence: clamp(0.6 + best.score * 0.3, MIN_CONFIDENCE, MAX_CONFIDENCE),
      dominantChannel: "CZ",
      features,
    };
  }

  const margin = best.score - (second?.score ?? 0);
  const predictedTask = lateralTask(best.channel, best.score);
  const confidence = clamp(0.58 + best.score * 0.35 + margin * 0.45, MIN_CONFIDENCE, MAX_CONFIDENCE);

  return {
    trialId,
    predictedTask,
    confidence,
    dominantChannel: best.channel,
    features,
  };
}
