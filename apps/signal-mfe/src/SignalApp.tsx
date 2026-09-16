import { useEffect, useRef, useState } from "react";
import {
  EVENT_NAMES,
  SAMPLE_RATE_HZ,
  WINDOW_DURATION_MS,
  publish,
  subscribe,
  wait,
  demoDelay,
  type AppMode,
  type EEGFeatures,
  type EEGWindow,
  type MotorTask,
} from "@neuromfe/contracts";
import { bandpassFilter, emptyEegFeatures, extractFeatures, removeDC, SyntheticEEGSource } from "@neuromfe/dsp";
import { Oscilloscope, type ScopeBuffers } from "./Oscilloscope";
import styles from "./signal.module.css";

const VERSION = "1.0.0";
const source = new SyntheticEEGSource(2026);

function emptyBuffers(): ScopeBuffers {
  return { C3: [], CZ: [], C4: [] };
}

function filterWindow(eeg: EEGWindow): EEGWindow {
  return {
    ...eeg,
    channels: eeg.channels.map((channel) => ({
      channel: channel.channel,
      samples: bandpassFilter(removeDC(channel.samples), eeg.sampleRate),
    })),
  };
}

function samplesOf(window: EEGWindow, channel: "C3" | "CZ" | "C4"): number[] {
  return window.channels.find((item) => item.channel === channel)?.samples ?? [];
}

function formatPower(value: number): string {
  return value.toFixed(3);
}

function formatPct(value: number): string {
  return `${Math.round(value * 100)} %`;
}

export default function SignalApp() {
  const [mode, setMode] = useState<AppMode>("EXPLORE");
  const [view, setView] = useState<"RAW" | "FILTERED">("RAW");
  const [paused, setPaused] = useState(false);
  const [calibrated, setCalibrated] = useState(false);
  const [features, setFeatures] = useState<EEGFeatures>(emptyEegFeatures());
  const buffersRef = useRef<ScopeBuffers>(emptyBuffers());
  const pausedRef = useRef(false);
  const viewRef = useRef<"RAW" | "FILTERED">("RAW");
  const rawRef = useRef<EEGWindow | null>(null);
  const filteredRef = useRef<EEGWindow | null>(null);
  const secretsRef = useRef<Map<string, MotorTask>>(new Map());
  const playToken = useRef(0);
  const modeRef = useRef<AppMode>("EXPLORE");
  const calibratedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    viewRef.current = view;
    showWindow(rawRef.current, filteredRef.current, 1);
  }, [view]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  function showWindow(raw: EEGWindow | null, filtered: EEGWindow | null, ratio: number) {
    const sourceWindow = viewRef.current === "FILTERED" ? filtered : raw;
    if (!sourceWindow) return;
    const slice = (channel: "C3" | "CZ" | "C4") => {
      const samples = samplesOf(sourceWindow, channel);
      const count = Math.max(1, Math.floor(samples.length * ratio));
      return samples.slice(0, count);
    };
    buffersRef.current = { C3: slice("C3"), CZ: slice("CZ"), C4: slice("C4") };
  }

  async function playWindow(raw: EEGWindow, filtered: EEGWindow) {
    const token = playToken.current + 1;
    playToken.current = token;
    rawRef.current = raw;
    filteredRef.current = filtered;
    const duration = demoDelay(WINDOW_DURATION_MS);
    if (duration <= 0) {
      showWindow(raw, filtered, 1);
      return;
    }
    let elapsed = 0;
    let last = performance.now();
    await new Promise<void>((resolve) => {
      const tick = () => {
        if (playToken.current !== token) {
          resolve();
          return;
        }
        const now = performance.now();
        if (!pausedRef.current) {
          elapsed += now - last;
        }
        last = now;
        const ratio = Math.min(1, elapsed / duration);
        showWindow(raw, filtered, ratio);
        if (ratio >= 1) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  async function calibrate() {
    calibratedRef.current = false;
    setCalibrated(false);
    publish(EVENT_NAMES.EEG_CALIBRATION_STARTED, { timestamp: Date.now() });
    const window = await source.calibrate();
    const filtered = filterWindow(window);
    await playWindow(window, filtered);
    publish(EVENT_NAMES.EEG_CALIBRATION_COMPLETED, { window, timestamp: Date.now() });
    setFeatures(extractFeatures(window));
    calibratedRef.current = true;
    setCalibrated(true);
  }

  async function runTrial(task: MotorTask, secret: boolean) {
    if (!calibratedRef.current) {
      await calibrate();
    }
    const trial = await source.startTrial({ task });
    if (secret) {
      secretsRef.current.set(trial.trialId, task);
    }
    publish(EVENT_NAMES.EEG_TRIAL_STARTED, {
      trialId: trial.trialId,
      mode: modeRef.current,
      timestamp: Date.now(),
    });
    const filtered = filterWindow(trial);
    await playWindow(trial, filtered);
    publish(EVENT_NAMES.EEG_WINDOW_READY, { window: trial, timestamp: Date.now() });
  }

  useEffect(() => {
    publish(EVENT_NAMES.MFE_READY, { id: "signal-mfe", version: VERSION, timestamp: Date.now() });
    void calibrate();
    const unsubscribers = [
      subscribe(EVENT_NAMES.APP_MODE_CHANGED, (payload) => setMode(payload.mode)),
      subscribe(EVENT_NAMES.MOTOR_TASK_SELECTED, (payload) => {
        if (modeRef.current === "EXPLORE") {
          void runTrial(payload.task, false);
        }
      }),
      subscribe(EVENT_NAMES.NEW_BCI_TRIAL_REQUESTED, () => {
        const task = source.randomTask(Date.now());
        void runTrial(task, true);
      }),
      subscribe(EVENT_NAMES.RECALIBRATE_REQUESTED, () => {
        void calibrate();
      }),
      subscribe(EVENT_NAMES.SIGNAL_FEATURES_EXTRACTED, (payload) => setFeatures(payload.features)),
      subscribe(EVENT_NAMES.CLASSIFICATION_RESULT, async (payload) => {
        const actual = secretsRef.current.get(payload.trialId);
        if (!actual) return;
        await wait(350);
        publish(EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED, {
          trialId: payload.trialId,
          actualTask: actual,
          predictedTask: payload.predictedTask,
          match: actual === payload.predictedTask,
          timestamp: Date.now(),
        });
        secretsRef.current.delete(payload.trialId);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.panel} data-testid="mfe-signal" aria-label="Signal Micro Frontend">
      <div className={styles.scope}>
        <div className={styles.toolbar}>
          <div>
            <p className={styles.kicker}>Adquisición</p>
            <h2 className={styles.title}>Osciloscopio EEG simulado</h2>
          </div>
          <div className={styles.meta}>
            <span>Sample Rate: {SAMPLE_RATE_HZ} Hz</span>
            <span>Window: {(WINDOW_DURATION_MS / 1000).toFixed(1)} s</span>
            <span>Channels: 3</span>
          </div>
        </div>
        <div className={styles.actions}>
          <div className={styles.viewToggle} role="group" aria-label="Vista de señal">
            <button type="button" aria-pressed={view === "RAW"} onClick={() => setView("RAW")}>
              RAW
            </button>
            <button type="button" aria-pressed={view === "FILTERED"} onClick={() => setView("FILTERED")}>
              FILTERED
            </button>
          </div>
          <button type="button" aria-pressed={paused} onClick={() => setPaused((value) => !value)}>
            {paused ? "Reanudar" : "Pausar señal"}
          </button>
          <button type="button" onClick={() => void calibrate()}>
            Recalibrar
          </button>
        </div>
        <Oscilloscope buffersRef={buffersRef} paused={paused} viewLabel={view} />
        <p className={styles.caption}>Unidades sintéticas (µV simulados). Fuente actual: SyntheticEEGSource. No hay hardware conectado.</p>
      </div>
      <aside className={styles.side}>
        <div className={styles.card}>
          <p className={styles.kicker}>Baseline EEG</p>
          <div className={styles.calRow}>
            <span>C3</span>
            <span className={calibrated ? styles.ok : undefined}>{calibrated ? "✓" : "…"}</span>
          </div>
          <div className={styles.calRow}>
            <span>Cz</span>
            <span className={calibrated ? styles.ok : undefined}>{calibrated ? "✓" : "…"}</span>
          </div>
          <div className={styles.calRow}>
            <span>C4</span>
            <span className={calibrated ? styles.ok : undefined}>{calibrated ? "✓" : "…"}</span>
          </div>
          <p className={styles.caption}>Estado: {calibrated ? "Calibrado" : "Calibrando señal de reposo..."}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.kicker}>Bandas</p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Canal</th>
                <th title="Ritmo EEG aproximadamente entre 8 y 13 Hz, frecuentemente estudiado en tareas sensoriomotoras.">
                  Mu
                </th>
                <th title="Actividad aproximada entre 13 y 30 Hz.">Beta</th>
                <th title="Event Related Desynchronization: reducción simulada de potencia respecto al baseline.">
                  ERD
                </th>
              </tr>
            </thead>
            <tbody>
              {(["C3", "CZ", "C4"] as const).map((channel) => {
                const row = features[channel];
                const suppression = 0.6 * row.muSuppression + 0.4 * row.betaSuppression;
                return (
                  <tr key={channel}>
                    <td>{channel === "CZ" ? "Cz" : channel}</td>
                    <td>{formatPower(row.muPower)}</td>
                    <td>{formatPower(row.betaPower)}</td>
                    <td>{formatPct(suppression)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </aside>
    </section>
  );
}
