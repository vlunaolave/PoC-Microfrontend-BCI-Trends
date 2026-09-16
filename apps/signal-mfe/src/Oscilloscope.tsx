import { useEffect, useRef } from "react";
import {
  CHANNEL_BODY_HINTS,
  CHANNEL_LABELS,
  EEG_CHANNELS,
  SAMPLE_RATE_HZ,
  channelsForMotorTask,
  emptyChannelBuffers,
  type EEGChannel,
  type MotorTask,
} from "@neuromfe/contracts";
import { LiveEEGStream } from "@neuromfe/dsp";
import styles from "./signal.module.css";

const COLORS: Record<EEGChannel, string> = {
  FP1: "#f0c38a",
  F3: "#e8b84a",
  FZ: "#d4a017",
  C3: "#4ec6e8",
  CZ: "#7ee0c5",
  C4: "#b07cff",
  T3: "#8aa0b5",
  P3: "#6ba4f8",
  PZ: "#67d4c4",
  O1: "#9aa8b6",
};

const GLOWS: Record<EEGChannel, string> = {
  FP1: "rgba(240, 195, 138, 0.45)",
  F3: "rgba(232, 184, 74, 0.45)",
  FZ: "rgba(212, 160, 23, 0.45)",
  C3: "rgba(78, 198, 232, 0.45)",
  CZ: "rgba(126, 224, 197, 0.45)",
  C4: "rgba(176, 124, 255, 0.45)",
  T3: "rgba(138, 160, 181, 0.45)",
  P3: "rgba(107, 164, 248, 0.45)",
  PZ: "rgba(103, 212, 196, 0.45)",
  O1: "rgba(154, 168, 182, 0.45)",
};

const SCOPE_COLUMNS = 2;

interface OscilloscopeProps {
  task: MotorTask | null;
  paused: boolean;
  viewLabel: "RAW" | "FILTERED";
}

export function Oscilloscope({ task, paused, viewLabel }: OscilloscopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const streamRef = useRef(new LiveEEGStream(2026));
  const buffersRef = useRef<Record<EEGChannel, number[]>>(emptyChannelBuffers());
  const carryRef = useRef(0);
  const lastRef = useRef(0);
  const taskRef = useRef<MotorTask>(task ?? "REST");
  const pausedRef = useRef(paused);
  const viewRef = useRef(viewLabel);
  const linked = new Set(channelsForMotorTask(task));

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

      const activeSet = new Set(channelsForMotorTask(taskRef.current));
      const focusing = activeSet.size > 0;
      const perColumn = Math.ceil(EEG_CHANNELS.length / SCOPE_COLUMNS);
      const colWidth = width / SCOPE_COLUMNS;
      const rowHeight = height / perColumn;

      context.strokeStyle = "rgba(255,255,255,0.08)";
      context.beginPath();
      context.moveTo(colWidth, 0);
      context.lineTo(colWidth, height);
      context.stroke();

      EEG_CHANNELS.forEach((channel, index) => {
        const col = Math.floor(index / perColumn);
        const row = index % perColumn;
        const left = col * colWidth;
        const top = row * rowHeight;
        const active = !focusing || activeSet.has(channel);

        context.save();
        context.beginPath();
        context.rect(left, top, colWidth, rowHeight);
        context.clip();
        context.globalAlpha = active ? 1 : 0.28;
        context.strokeStyle = "rgba(255,255,255,0.05)";
        context.lineWidth = 1;
        for (let g = 1; g < 4; g += 1) {
          const y = top + (rowHeight * g) / 4;
          context.beginPath();
          context.moveTo(left, y);
          context.lineTo(left + colWidth, y);
          context.stroke();
        }
        context.beginPath();
        context.moveTo(left, top + rowHeight / 2);
        context.lineTo(left + colWidth, top + rowHeight / 2);
        context.strokeStyle = "rgba(255,255,255,0.12)";
        context.stroke();

        if (active && focusing) {
          context.fillStyle = GLOWS[channel];
          context.globalAlpha = 0.12;
          context.fillRect(left, top, colWidth, rowHeight);
          context.globalAlpha = 1;
        }

        const samples = buffersRef.current[channel] ?? [];
        if (samples.length > 1) {
          const scale = active && focusing ? 0.42 : 0.24;
          const plot = (widthScale: number, color: string) => {
            context.beginPath();
            samples.forEach((sample, sampleIndex) => {
              const x = left + (sampleIndex / Math.max(samples.length - 1, 1)) * colWidth;
              const y = top + rowHeight / 2 - (sample / 92) * (rowHeight * scale);
              if (sampleIndex === 0) context.moveTo(x, y);
              else context.lineTo(x, y);
            });
            context.strokeStyle = color;
            context.lineWidth = widthScale * dpr;
            context.lineJoin = "round";
            context.lineCap = "round";
            context.stroke();
          };
          if (active) {
            context.save();
            context.shadowColor = GLOWS[channel];
            context.shadowBlur = (focusing && activeSet.has(channel) ? 10 : 5) * dpr;
            plot(focusing && activeSet.has(channel) ? 2.8 : 1.7, GLOWS[channel]);
            context.restore();
            plot(focusing && activeSet.has(channel) ? 1.7 : 1.15, COLORS[channel]);
          } else {
            plot(0.9, COLORS[channel]);
          }
        }

        context.globalAlpha = 1;
        context.fillStyle = COLORS[channel];
        context.font = `${(active && focusing ? 11 : 10) * dpr}px Segoe UI, sans-serif`;
        const label = CHANNEL_LABELS[channel];
        const body = CHANNEL_BODY_HINTS[channel];
        context.fillText(
          active && focusing ? `${label} · OSCILA · ${body}` : `${label} · ${body}`,
          left + 8 * dpr,
          top + 13 * dpr,
        );
        context.restore();
      });

      const sweepX = width - 3 * dpr;
      context.fillStyle = "rgba(238, 243, 248, 0.18)";
      context.fillRect(sweepX, 0, 2 * dpr, height);

      context.fillStyle = "#9aa8b6";
      context.font = `${10 * dpr}px Segoe UI, sans-serif`;
      context.fillText(`${viewRef.current} · vivo · 10-20 · µV simulados`, 10 * dpr, height - 8 * dpr);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className={styles.canvasWrap}>
      <ul className={styles.montage} data-testid="scope-montage" aria-label="Montaje EEG 10-20 simulado">
        {EEG_CHANNELS.map((channel) => (
          <li
            key={channel}
            data-testid={`scope-channel-${channel}`}
            data-active={linked.has(channel) ? "true" : "false"}
            style={{ color: COLORS[channel] }}
          >
            {CHANNEL_LABELS[channel]}
          </li>
        ))}
      </ul>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="Osciloscopio EEG simulado en vivo de Fp1, F3, Fz, C3, Cz, C4, T3, P3, Pz y O1"
      />
    </div>
  );
}
