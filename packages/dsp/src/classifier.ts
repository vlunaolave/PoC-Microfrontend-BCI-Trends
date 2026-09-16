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

export function classifyMotorImagery(features: EEGFeatures, trialId: string): ClassificationResult {
  const scores = [...scoreChannels(features)].sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];

  if (!best || best.score < MOVEMENT_THRESHOLD) {
    return {
      trialId,
      predictedTask: "REST",
      confidence: clamp(0.72 - (best?.score ?? 0), MIN_CONFIDENCE, 0.86),
      dominantChannel: null,
      features,
    };
  }

  const margin = best.score - (second?.score ?? 0);
  const confidence = clamp(0.58 + best.score * 0.35 + margin * 0.45, MIN_CONFIDENCE, MAX_CONFIDENCE);

  return {
    trialId,
    predictedTask: best.task,
    confidence,
    dominantChannel: best.channel,
    features,
  };
}
