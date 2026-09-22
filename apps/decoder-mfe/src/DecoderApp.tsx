import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  EVENT_NAMES,
  MOTOR_TASK_COMMANDS,
  MOTOR_TASK_LABELS,
  getLastCalibrationWindow,
  publish,
  subscribe,
  wait,
  type ClassificationResult,
  type EEGFeatures,
  type MotorTask,
} from "@neuromfe/contracts";
import { classifyMotorImagery, emptyEegFeatures, extractFeatures } from "@neuromfe/dsp";
import { Footprints, Hand, Pause, Radio, Smile, User } from "lucide-react";
import styles from "./decoder.module.css";

function patternIcon(task: MotorTask | null): ReactNode {
  if (task === "RIGHT_HAND") return <Hand size={22} />;
  if (task === "LEFT_HAND") return <Hand size={22} className={styles.flip} />;
  if (task === "RIGHT_ARM") return <User size={22} />;
  if (task === "LEFT_ARM") return <User size={22} className={styles.flip} />;
  if (task === "FEET") return <Footprints size={22} />;
  if (task === "TONGUE") return <Smile size={22} />;
  if (task === "REST") return <Pause size={22} />;
  return <Radio size={22} />;
}

const VERSION = "1.0.0";

const STEPS = [
  { id: "received", label: "Señal recibida" },
  { id: "filter", label: "Filtrado 8–30 Hz" },
  { id: "fft", label: "FFT calculada" },
  { id: "power", label: "Potencia Mu/Beta" },
  { id: "features", label: "Features normalizadas" },
  { id: "classified", label: "Clasificación" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

export default function DecoderApp() {
  const [activeSteps, setActiveSteps] = useState<StepId[]>([]);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [truth, setTruth] = useState<{ actual: MotorTask; match: boolean } | null>(null);
  const baselineRef = useRef<EEGFeatures | null>(null);

  useEffect(() => {
    publish(EVENT_NAMES.MFE_READY, { id: "decoder-mfe", version: VERSION, timestamp: Date.now() });
    const existing = getLastCalibrationWindow();
    if (existing) {
      baselineRef.current = extractFeatures(existing);
    }
    const unsubscribers = [
      subscribe(EVENT_NAMES.EEG_CALIBRATION_COMPLETED, (payload) => {
        baselineRef.current = extractFeatures(payload.window);
      }),
      subscribe(EVENT_NAMES.EEG_WINDOW_READY, async (payload) => {
        if (!baselineRef.current) {
          const latest = getLastCalibrationWindow();
          if (latest) {
            baselineRef.current = extractFeatures(latest);
          }
        }
        if (!baselineRef.current) {
          return;
        }
        setTruth(null);
        setResult(null);
        setActiveSteps([]);
        publish(EVENT_NAMES.SIGNAL_PROCESSING_STARTED, {
          trialId: payload.window.trialId,
          timestamp: Date.now(),
        });
        const mark = async (step: StepId) => {
          await wait(120);
          setActiveSteps((current) => [...current, step]);
        };
        await mark("received");
        await mark("filter");
        await mark("fft");
        await mark("power");
        const features = extractFeatures(payload.window, baselineRef.current ?? emptyEegFeatures());
        publish(EVENT_NAMES.SIGNAL_FEATURES_EXTRACTED, {
          trialId: payload.window.trialId,
          features,
          timestamp: Date.now(),
        });
        await mark("features");
        const classification = classifyMotorImagery(features, payload.window.trialId);
        await mark("classified");
        setResult(classification);
        publish(EVENT_NAMES.CLASSIFICATION_RESULT, {
          ...classification,
          timestamp: Date.now(),
        });
      }),
      subscribe(EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED, (payload) => {
        setTruth({ actual: payload.actualTask, match: payload.match });
      }),
      subscribe(EVENT_NAMES.APP_MODE_CHANGED, () => {
        setResult(null);
        setTruth(null);
        setActiveSteps([]);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <section className={styles.panel} data-testid="mfe-decoder" aria-label="Decoder Micro Frontend">
      <div
        className={`${styles.result} ${result ? styles.resultLive : styles.resultIdle}`}
        data-testid="classification-result"
        data-task={result?.predictedTask ?? "idle"}
      >
        <div className={styles.resultHeader}>
          <p className={styles.kicker}>Patrón detectado</p>
          <span className={styles.statusPill}>{result ? "Clasificado" : "En espera"}</span>
        </div>
        <div className={styles.commandRow}>
          <span className={styles.glyph} aria-hidden="true">
            {patternIcon(result?.predictedTask ?? null)}
          </span>
          <p className={styles.intent}>
            {result ? MOTOR_TASK_COMMANDS[result.predictedTask] : "Esperando una ventana EEG"}
          </p>
        </div>
        {result ? (
          <>
            <div className={styles.meter} aria-hidden="true">
              <span style={{ width: `${Math.round(result.confidence * 100)}%` }} />
            </div>
            <div className={styles.meta}>
              <span>Confianza de la simulación {Math.round(result.confidence * 100)} %</span>
              <span>Canal dominante {result.dominantChannel ? result.dominantChannel : "ninguno"}</span>
              {result.predictedTask !== "REST" ? (
                <span>
                  Mu suppression {Math.round((result.features[result.dominantChannel ?? "C3"].muSuppression) * 100)} %
                  {" · "}
                  Beta suppression {Math.round((result.features[result.dominantChannel ?? "C3"].betaSuppression) * 100)} %
                </span>
              ) : (
                <span>No se detectó un patrón motor por encima del umbral.</span>
              )}
            </div>
          </>
        ) : (
          <p className={styles.idleHint}>El clasificador heurístico espera la siguiente ventana de 2 s.</p>
        )}
        {truth && result ? (
          <div className={styles.truth} data-testid="ground-truth">
            <div>Patrón real de la simulación: {MOTOR_TASK_LABELS[truth.actual]}</div>
            <div className={truth.match ? styles.match : styles.mismatch}>
              Clasificación: {truth.match ? "CORRECTA" : "NO COINCIDE"}
            </div>
          </div>
        ) : null}
        <div className={styles.live} aria-live="polite">
          {result ? `${MOTOR_TASK_COMMANDS[result.predictedTask]}. Confianza ${Math.round(result.confidence * 100)} por ciento.` : ""}
        </div>
      </div>
      <div className={styles.pipeline}>
        <div className={styles.pipelineHead}>
          <div>
            <p className={styles.kicker}>Processing Pipeline</p>
            <h2 className={styles.title}>RAW → Filter → FFT → Features → Classifier</h2>
          </div>
          <span className={styles.badge}>Clasificador heurístico basado en potencia Mu/Beta</span>
        </div>
        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.id} className={activeSteps.includes(step.id) ? styles.done : undefined}>
              <span>{activeSteps.includes(step.id) ? "✓" : "○"}</span>
              {step.label}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
