import FFT from "fft.js";
import { FFT_SIZE } from "./constants";

export interface SpectrumBin {
  frequency: number;
  power: number;
}

export function padToFftSize(samples: number[], size = FFT_SIZE): number[] {
  const padded = new Array<number>(size).fill(0);
  const copyCount = Math.min(samples.length, size);
  for (let i = 0; i < copyCount; i += 1) {
    padded[i] = samples[i] ?? 0;
  }
  return padded;
}

export function computeSpectrum(samples: number[], sampleRate: number): SpectrumBin[] {
  const size = FFT_SIZE;
  const fft = new FFT(size);
  const input = padToFftSize(samples, size);
  const output = fft.createComplexArray() as number[];
  fft.realTransform(output, input);
  fft.completeSpectrum(output);

  const binHz = sampleRate / size;
  const bins: SpectrumBin[] = [];
  const nyquist = size / 2;
  for (let k = 0; k <= nyquist; k += 1) {
    const re = output[2 * k] ?? 0;
    const im = output[2 * k + 1] ?? 0;
    bins.push({
      frequency: k * binHz,
      power: (re * re + im * im) / size,
    });
  }
  return bins;
}

export function computeBandPower(
  spectrum: SpectrumBin[],
  lowHz: number,
  highHz: number,
): number {
  let sum = 0;
  let count = 0;
  for (const bin of spectrum) {
    if (bin.frequency >= lowHz && bin.frequency < highHz) {
      sum += bin.power;
      count += 1;
    }
  }
  if (count === 0) {
    return 0;
  }
  return sum / count;
}
