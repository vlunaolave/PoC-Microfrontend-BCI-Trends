export interface BiquadCoefficients {
  b0: number;
  b1: number;
  b2: number;
  a1: number;
  a2: number;
}

export function highpassCoeffs(sampleRate: number, cutoffHz: number, q = 0.7071): BiquadCoefficients {
  const w0 = (2 * Math.PI * cutoffHz) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * q);
  const b0 = (1 + cos) / 2;
  const b1 = -(1 + cos);
  const b2 = (1 + cos) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

export function lowpassCoeffs(sampleRate: number, cutoffHz: number, q = 0.7071): BiquadCoefficients {
  const w0 = (2 * Math.PI * cutoffHz) / sampleRate;
  const cos = Math.cos(w0);
  const sin = Math.sin(w0);
  const alpha = sin / (2 * q);
  const b0 = (1 - cos) / 2;
  const b1 = 1 - cos;
  const b2 = (1 - cos) / 2;
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0 };
}

export function applyBiquad(samples: number[], coeffs: BiquadCoefficients): number[] {
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  const output = new Array<number>(samples.length);
  for (let i = 0; i < samples.length; i += 1) {
    const x0 = samples[i] ?? 0;
    const y0 = coeffs.b0 * x0 + coeffs.b1 * x1 + coeffs.b2 * x2 - coeffs.a1 * y1 - coeffs.a2 * y2;
    output[i] = y0;
    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }
  return output;
}

export function bandpassFilter(
  samples: number[],
  sampleRate: number,
  lowHz = 8,
  highHz = 30,
): number[] {
  const highpassed = applyBiquad(samples, highpassCoeffs(sampleRate, lowHz));
  return applyBiquad(highpassed, lowpassCoeffs(sampleRate, highHz));
}
