import { useEffect, useRef } from "react";
import type { EEGChannel } from "@neuromfe/contracts";
import styles from "./signal.module.css";

const COLORS: Record<EEGChannel, string> = {
  C3: "#4ec6e8",
  CZ: "#7ee0c5",
  C4: "#6ba4f8",
};

export interface ScopeBuffers {
  C3: number[];
  CZ: number[];
  C4: number[];
}

interface OscilloscopeProps {
  buffersRef: React.MutableRefObject<ScopeBuffers>;
  paused: boolean;
  viewLabel: string;
}

export function Oscilloscope({ buffersRef, paused, viewLabel }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      context.clearRect(0, 0, width, height);
      context.fillStyle = "#0b1118";
      context.fillRect(0, 0, width, height);

      const channels: EEGChannel[] = ["C3", "CZ", "C4"];
      const rowHeight = height / 3;
      channels.forEach((channel, index) => {
        const top = rowHeight * index;
        context.strokeStyle = "rgba(255,255,255,0.06)";
        context.lineWidth = 1;
        for (let g = 1; g < 6; g += 1) {
          const y = top + (rowHeight * g) / 6;
          context.beginPath();
          context.moveTo(0, y);
          context.lineTo(width, y);
          context.stroke();
        }
        context.beginPath();
        context.moveTo(0, top + rowHeight / 2);
        context.lineTo(width, top + rowHeight / 2);
        context.strokeStyle = "rgba(255,255,255,0.12)";
        context.stroke();

        const samples = buffersRef.current[channel];
        const color = COLORS[channel];
        context.beginPath();
        samples.forEach((sample, sampleIndex) => {
          const x = (sampleIndex / Math.max(samples.length - 1, 1)) * width;
          const y = top + rowHeight / 2 - (sample / 50) * (rowHeight * 0.42);
          if (sampleIndex === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.strokeStyle = color;
        context.lineWidth = 1.6 * dpr;
        context.stroke();

        context.fillStyle = color;
        context.font = `${11 * dpr}px Segoe UI, sans-serif`;
        context.fillText(channel === "CZ" ? "Cz" : channel, 10 * dpr, top + 16 * dpr);
      });

      context.fillStyle = "#9aa8b6";
      context.font = `${10 * dpr}px Segoe UI, sans-serif`;
      context.fillText(`${viewLabel} · µV simulados`, 10 * dpr, height - 10 * dpr);

      if (!paused) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [buffersRef, paused, viewLabel]);

  return (
    <div className={styles.canvasWrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Osciloscopio EEG simulado de C3, Cz y C4" />
    </div>
  );
}
