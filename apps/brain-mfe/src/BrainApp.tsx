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
import { BrainFigure, TIPS } from "./BrainFigure";
import styles from "./brain.module.css";

const VERSION = "1.0.0";

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

  return (
    <section className={styles.panel} data-testid="mfe-brain" aria-label="Brain Micro Frontend">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Cerebro</p>
          <h2 className={styles.title}>Mapa 10-20 educativo</h2>
        </div>
        <div className={styles.status} data-testid="brain-status">
          {detecting
            ? "Actividad cortical simulada detectándose..."
            : highlight
              ? `Zona asociada: ${MOTOR_TASK_LABELS[highlight]}`
              : "Vista lateral izquierda educativa"}
        </div>
      </header>
      <div className={styles.figureWrap}>
        <BrainFigure task={highlight} />
      </div>
      <div className={styles.legend}>
        <span title={TIPS.F3}>F3 · frontal</span>
        <span title={TIPS.C3}>C3 · mano/brazo der.</span>
        <span title={TIPS.Cz}>Cz · pies</span>
        <span title={TIPS.C4}>C4 · mano/brazo izq.</span>
        <span title={TIPS.P3}>P3 · parietal</span>
        <span title={TIPS.O1}>O1 · occipital</span>
      </div>
      {prediction && actual ? (
        <div className={styles.compare} data-testid="brain-compare">
          <span>Predicción: {MOTOR_TASK_LABELS[prediction]}</span>
          <span>Patrón generado: {MOTOR_TASK_LABELS[actual]}</span>
        </div>
      ) : null}
      <p className={styles.caption}>
        Posiciones 10-20 aproximadas sobre una vista lateral izquierda. C4 se marca de forma esquemática. No es un mapa médico.
        {!isEmbeddedInShell() ? " Standalone Micro Frontend." : ""}
      </p>
    </section>
  );
}
