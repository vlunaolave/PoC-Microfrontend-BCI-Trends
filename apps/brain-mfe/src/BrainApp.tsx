import { useEffect, useRef, useState } from "react";
import {
  EVENT_NAMES,
  MOTOR_TASK_LABELS,
  isEmbeddedInShell,
  publish,
  subscribe,
  type AppMode,
  type MotorTask,
} from "@neuromfe/contracts";
import styles from "./brain.module.css";

const VERSION = "1.0.0";

const TIPS = {
  C3: "Electrodo EEG aproximado sobre región sensoriomotora izquierda.",
  CZ: "Electrodo EEG aproximado sobre la línea media / región de pies.",
  C4: "Electrodo EEG aproximado sobre región sensoriomotora derecha.",
};

function zoneForTask(task: MotorTask | null): "left" | "right" | "medial" | "none" {
  if (task === "RIGHT_HAND") return "left";
  if (task === "LEFT_HAND") return "right";
  if (task === "FEET") return "medial";
  return "none";
}

export default function BrainApp() {
  const [mode, setMode] = useState<AppMode>("EXPLORE");
  const [highlight, setHighlight] = useState<MotorTask | null>(null);
  const [prediction, setPrediction] = useState<MotorTask | null>(null);
  const [actual, setActual] = useState<MotorTask | null>(null);
  const [detecting, setDetecting] = useState(false);
  const modeRef = useRef(mode);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    publish(EVENT_NAMES.MFE_READY, { id: "brain-mfe", version: VERSION, timestamp: Date.now() });
    const unsubscribers = [
      subscribe(EVENT_NAMES.APP_MODE_CHANGED, (payload) => {
        setMode(payload.mode);
        setHighlight(null);
        setPrediction(null);
        setActual(null);
        setDetecting(false);
      }),
      subscribe(EVENT_NAMES.MOTOR_TASK_SELECTED, (payload) => {
        if (modeRef.current === "BCI") return;
        setHighlight(payload.task);
        setPrediction(null);
        setActual(null);
      }),
      subscribe(EVENT_NAMES.EEG_TRIAL_STARTED, (payload) => {
        if (payload.mode === "BCI") {
          setDetecting(true);
          setHighlight(null);
          setPrediction(null);
          setActual(null);
        }
      }),
      subscribe(EVENT_NAMES.CLASSIFICATION_RESULT, (payload) => {
        setDetecting(false);
        setPrediction(payload.predictedTask);
        if (modeRef.current === "BCI") {
          setHighlight(payload.predictedTask);
        }
      }),
      subscribe(EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED, (payload) => {
        setActual(payload.actualTask);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const zone = zoneForTask(highlight);

  return (
    <section className={styles.panel} data-testid="mfe-brain" aria-label="Brain Micro Frontend">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Cerebro</p>
          <h2 className={styles.title}>Corteza sensoriomotora</h2>
        </div>
        <div className={styles.status} data-testid="brain-status">
          {detecting
            ? "Actividad cortical simulada detectándose..."
            : highlight
              ? `Zona asociada: ${MOTOR_TASK_LABELS[highlight]}`
              : "Vista educativa superior"}
        </div>
      </header>
      <div className={styles.figureWrap}>
        <svg className={styles.svg} viewBox="0 0 420 240" role="img" aria-label="Vista superior esquemática del cerebro con electrodos C3, Cz y C4">
          <title>Representación educativa del cerebro. No es un mapa médico exacto.</title>
          <path
            className={`${styles.hemisphere} ${zone === "left" ? styles.leftActive : ""}`}
            d="M210 28c-28 8-92 18-132 52-28 24-42 58-36 92 8 42 54 58 118 62 18 1 34-8 40-22V40c-4-6-8-10-10-12z"
          />
          <path
            className={`${styles.hemisphere} ${zone === "right" ? styles.rightActive : ""}`}
            d="M210 28c28 8 92 18 132 52 28 24 42 58 36 92-8 42-54 58-118 62-18 1-34-8-40-22V40c4-6 8-10 10-12z"
          />
          <rect
            className={`${styles.medial} ${zone === "medial" ? styles.medialActive : ""}`}
            x="198"
            y="42"
            width="24"
            height="148"
            rx="10"
          />
          <circle className={styles.electrode} cx="132" cy="118" r="8">
            <title>{TIPS.C3}</title>
          </circle>
          <circle className={styles.electrode} cx="210" cy="108" r="8">
            <title>{TIPS.CZ}</title>
          </circle>
          <circle className={styles.electrode} cx="288" cy="118" r="8">
            <title>{TIPS.C4}</title>
          </circle>
          <text className={styles.electrodeLabel} x="118" y="146">
            C3
          </text>
          <text className={styles.electrodeLabel} x="201" y="96">
            Cz
          </text>
          <text className={styles.electrodeLabel} x="278" y="146">
            C4
          </text>
        </svg>
      </div>
      <div className={styles.legend}>
        <span title={TIPS.C3}>C3 · hemisferio izquierdo</span>
        <span title={TIPS.CZ}>Cz · zona medial</span>
        <span title={TIPS.C4}>C4 · hemisferio derecho</span>
      </div>
      {prediction && actual ? (
        <div className={styles.compare} data-testid="brain-compare">
          <span>Predicción: {MOTOR_TASK_LABELS[prediction]}</span>
          <span>Patrón generado: {MOTOR_TASK_LABELS[actual]}</span>
        </div>
      ) : null}
      <p className={styles.caption}>
        C3, Cz y C4 son posiciones aproximadas de electrodos EEG sobre región sensoriomotora. Las funciones corticales reales no son botones aislados.
        {!isEmbeddedInShell() ? " Standalone Micro Frontend." : ""}
      </p>
    </section>
  );
}
