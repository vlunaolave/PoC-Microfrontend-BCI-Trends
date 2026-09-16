import { mean } from "./math";

export function removeDC(samples: number[]): number[] {
  const dc = mean(samples);
  return samples.map((sample) => sample - dc);
}
