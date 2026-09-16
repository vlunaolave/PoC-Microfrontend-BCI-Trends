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
import styles from "./body.module.css";

const VERSION = "1.0.0";

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
        <svg
          className={styles.svg}
          viewBox="0 0 260 420"
          role="img"
          aria-label="Silueta humana frontal. La mano derecha del sujeto está a la izquierda de la imagen."
          data-disabled={disabled}
        >
          <title>Silueta humana educativa, vista frontal</title>
          <ellipse className={styles.silhouette} cx="130" cy="46" rx="28" ry="32" />
          <rect className={styles.silhouette} x="118" y="76" width="24" height="18" rx="6" />
          <path
            className={styles.silhouette}
            d="M78 102h104c16 0 28 14 28 30v78c0 14-10 26-24 28l-8 108c-2 18-18 32-36 32h-24c-18 0-34-14-36-32l-8-108c-14-2-24-14-24-28v-78c0-16 12-30 28-30z"
          />
          <path className={styles.silhouette} d="M78 118c-22 18-38 22-52 18 2 28 18 38 40 42" />
          <path className={styles.silhouette} d="M182 118c22 18 38 22 52 18-2 28-18 38-40 42" />
          <circle
            className={`${styles.region} ${task === "RIGHT_HAND" ? styles.regionActive : ""}`}
            cx="28"
            cy="168"
            r="22"
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label="Seleccionar mano derecha"
            onClick={() => !disabled && selectTask("RIGHT_HAND")}
            onKeyDown={(event) => {
              if (!disabled && (event.key === "Enter" || event.key === " ")) selectTask("RIGHT_HAND");
            }}
          />
          <circle
            className={`${styles.region} ${task === "LEFT_HAND" ? styles.regionActive : ""}`}
            cx="232"
            cy="168"
            r="22"
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label="Seleccionar mano izquierda"
            onClick={() => !disabled && selectTask("LEFT_HAND")}
            onKeyDown={(event) => {
              if (!disabled && (event.key === "Enter" || event.key === " ")) selectTask("LEFT_HAND");
            }}
          />
          <rect
            className={`${styles.region} ${task === "FEET" ? styles.regionActive : ""}`}
            x="78"
            y="372"
            width="104"
            height="32"
            rx="12"
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label="Seleccionar pies"
            onClick={() => !disabled && selectTask("FEET")}
            onKeyDown={(event) => {
              if (!disabled && (event.key === "Enter" || event.key === " ")) selectTask("FEET");
            }}
          />
        </svg>
      </div>

      <div className={styles.controls}>
        {(["RIGHT_HAND", "LEFT_HAND", "FEET", "REST"] as MotorTask[]).map((item) => (
          <button
            key={item}
            type="button"
            data-testid={`task-${item}`}
            aria-pressed={task === item}
            disabled={disabled}
            onClick={() => selectTask(item)}
          >
            {MOTOR_TASK_LABELS[item]}
          </button>
        ))}
      </div>
      <p className={styles.note}>
        Vista frontal. La mano derecha del sujeto aparece a la izquierda. Las regiones no son un mapa anatómico exacto.
        {!isEmbeddedInShell() ? " Standalone Micro Frontend." : ""}
      </p>
    </section>
  );
}
