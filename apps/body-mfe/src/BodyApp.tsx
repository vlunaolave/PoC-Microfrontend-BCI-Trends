import { useEffect, useState } from "react";
import {
  EVENT_NAMES,
  MOTOR_TASK_LABELS,
  isEmbeddedInShell,
  publish,
  subscribe,
  type AppMode,
  type MotorTask,
} from "@neuromfe/contracts";
import { BodyFigure } from "./BodyFigure";
import styles from "./body.module.css";

const VERSION = "1.0.0";

function focusZone(task: MotorTask | null) {
  publish(EVENT_NAMES.MOTOR_ZONE_FOCUSED, {
    task,
    timestamp: Date.now(),
  });
}

function selectTask(task: MotorTask) {
  publish(EVENT_NAMES.MOTOR_TASK_SELECTED, {
    task,
    source: "body-mfe",
    timestamp: Date.now(),
  });
}

export default function BodyApp() {
  const [task, setTask] = useState<MotorTask | null>(null);
  const [mode, setMode] = useState<AppMode>("EXPLORE");
  const disabled = mode === "BCI";

  useEffect(() => {
    publish(EVENT_NAMES.MFE_READY, {
      id: "body-mfe",
      version: VERSION,
      timestamp: Date.now(),
    });
    const unsubscribers = [
      subscribe(EVENT_NAMES.APP_MODE_CHANGED, (payload) => {
        setMode(payload.mode);
        setTask(null);
      }),
      subscribe(EVENT_NAMES.MOTOR_TASK_SELECTED, (payload) => setTask(payload.task)),
      subscribe(EVENT_NAMES.MOTOR_TASK_CLEARED, () => setTask(null)),
      subscribe(EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED, (payload) => {
        setTask(payload.actualTask);
      }),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <section className={styles.panel} data-testid="mfe-body" aria-label="Body Micro Frontend">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Persona</p>
          <h2 className={styles.title}>Tarea motora</h2>
        </div>
        <div className={styles.task}>
          <div className={styles.taskName}>{task ? MOTOR_TASK_LABELS[task] : "Sin selección"}</div>
          <p className={styles.hint}>{disabled ? "Modo BCI: la clase se elige internamente" : "Simulación: motor imagery"}</p>
        </div>
      </header>

      <div className={styles.figureWrap}>
        <BodyFigure task={task} disabled={disabled} onSelect={selectTask} onFocus={focusZone} />
      </div>

      <div className={styles.controls}>
        {(["RIGHT_HAND", "LEFT_HAND", "RIGHT_ARM", "LEFT_ARM", "FEET", "TONGUE", "REST"] as MotorTask[]).map((item) => (
          <button
            key={item}
            type="button"
            data-testid={`task-${item}`}
            aria-pressed={task === item}
            disabled={disabled}
            onClick={() => selectTask(item)}
            onMouseEnter={() => {
              if (!disabled) focusZone(item);
            }}
            onMouseLeave={() => {
              if (!disabled) focusZone(null);
            }}
          >
            {MOTOR_TASK_LABELS[item]}
          </button>
        ))}
      </div>
      <p className={styles.note}>
        Vista frontal. Pasa el cursor o pulsa una zona: la onda EEG correspondiente oscila en el osciloscopio. La mano derecha del sujeto aparece a la izquierda.
        {!isEmbeddedInShell() ? " Standalone Micro Frontend." : ""}
      </p>
    </section>
  );
}
