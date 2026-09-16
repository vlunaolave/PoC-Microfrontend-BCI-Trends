import { useEffect, useRef } from "react";
import { EEG_CHANNELS, SAMPLE_RATE_HZ, type EEGChannel, type MotorTask } from "@neuromfe/contracts";
import { LiveEEGStream } from "@neuromfe/dsp";
import styles from "./signal.module.css";

const COLORS: Record<EEGChannel, string> = {
  C3: "#4ec6e8",
  CZ: "#7ee0c5",
  C4: "#6ba4f8",
};

const GLOWS: Record<EEGChannel, string> = {
  C3: "rgba(78, 198, 232, 0.28)",
  CZ: "rgba(126, 224, 197, 0.28)",
  C4: "rgba(107, 164, 248, 0.28)",
};

interface OscilloscopeProps {
  task: MotorTask | null;
  paused: boolean;
  viewLabel: "RAW" | "FILTERED";
}

export function Oscilloscope({ task, paused, viewLabel }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const streamRef = useRef(new LiveEEGStream(2026));
  const buffersRef = useRef<Record<EEGChannel, number[]>>({ C3: [], CZ: [], C4: [] });
  const carryRef = useRef(0);
  const lastRef = useRef(0);
  const taskRef = useRef<MotorTask>(task ?? "REST");
  const pausedRef = useRef(paused);
  const viewRef = useRef(viewLabel);

  useEffect(() => {
    taskRef.current = task ?? "REST";
    streamRef.current.setTask(taskRef.current);
  }, [task]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    viewRef.current = viewLabel;
  }, [viewLabel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    lastRef.current = performance.now();
    streamRef.current.push(Math.round(SAMPLE_RATE_HZ * 2.2), buffersRef.current, viewRef.current === "FILTERED");

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;
      if (!pausedRef.current) {
        carryRef.current += dt * SAMPLE_RATE_HZ;
        const count = Math.floor(carryRef.current);
        carryRef.current -= count;
        if (count > 0) {
          streamRef.current.push(count, buffersRef.current, viewRef.current === "FILTERED");
        }
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.floor(rect.width * dpr));
      const height = Math.max(1, Math.floor(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      context.fillStyle = "#0b1118";
      context.fillRect(0, 0, width, height);

      const rowHeight = height / EEG_CHANNELS.length;
      EEG_CHANNELS.forEach((channel, index) => {
        const top = rowHeight * index;
        context.strokeStyle = "rgba(255,255,255,0.05)";
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
        if (samples.length > 1) {
          const plot = (widthScale: number, color: string) => {
            context.beginPath();
            samples.forEach((sample, sampleIndex) => {
              const x = (sampleIndex / Math.max(samples.length - 1, 1)) * width;
              const y = top + rowHeight / 2 - (sample / 48) * (rowHeight * 0.4);
              if (sampleIndex === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            });
            context.strokeStyle = color;
            context.lineWidth = widthScale * dpr;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke();
          };
          context.save();
          context.shadowColor = GLOWS[channel];
          context.shadowBlur = 10 * dpr;
          plot(3.1, GLOWS[channel]);
          context.restore();
          plot(1.55, COLORS[channel]);
        }

        context.fillStyle = COLORS[channel];
        context.font = `${11 * dpr}px Segoe UI, sans-serif`;
        context.fillText(channel === "CZ" ? "Cz" : channel, 10 * dpr, top + 16 * dpr);
      });

      const sweepX = width - 3 * dpr;
      context.fillStyle = "rgba(238, 243, 248, 0.18)";
      context.fillRect(sweepX, 0, 2 * dpr, height);

      context.fillStyle = "#9aa8b6";
      context.font = `${10 * dpr}px Segoe UI, sans-serif`;
      context.fillText(`${viewRef.current} · vivo · µV simulados`, 10 * dpr, height - 10 * dpr);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className={styles.canvasWrap}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Osciloscopio EEG simulado en vivo de C3, Cz y C4" />
    </div>
  );
}
