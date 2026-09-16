import type { KeyboardEvent } from "react";
import type { MotorTask } from "@neuromfe/contracts";
import silhouette from "./assets/human-silhouette.png";
import styles from "./body.module.css";

interface BodyFigureProps {
  task: MotorTask | null;
  disabled: boolean;
  onSelect: (task: MotorTask) => void;
}

export function BodyFigure({ task, disabled, onSelect }: BodyFigureProps) {
  const activate = (next: MotorTask) => {
    if (!disabled) onSelect(next);
  };

  const onKey = (next: MotorTask) => (event: KeyboardEvent) => {
    if (!disabled && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      onSelect(next);
    }
  };

  return (
    <div className={styles.figure} data-disabled={disabled}>
      <img
        className={styles.photo}
        src={silhouette}
        alt="Silueta humana frontal. La mano derecha del sujeto está a la izquierda de la imagen."
        draggable={false}
      />
      <svg
        className={styles.hitLayer}
        viewBox="0 0 363 930"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="false"
        role="img"
        aria-label="Zonas de tarea motora sobre la silueta"
      >
        <title>Figura humana educativa, vista frontal</title>
        <g
          className={`${styles.region} ${task === "RIGHT_HAND" ? styles.regionActive : ""}`}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Seleccionar mano derecha"
          onClick={() => activate("RIGHT_HAND")}
          onKeyDown={onKey("RIGHT_HAND")}
        >
          <ellipse cx="40" cy="540" rx="54" ry="92" />
        </g>
        <g
          className={`${styles.region} ${task === "LEFT_HAND" ? styles.regionActive : ""}`}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Seleccionar mano izquierda"
          onClick={() => activate("LEFT_HAND")}
          onKeyDown={onKey("LEFT_HAND")}
        >
          <ellipse cx="323" cy="540" rx="54" ry="92" />
        </g>
        <g
          className={`${styles.region} ${task === "FEET" ? styles.regionActive : ""}`}
          tabIndex={disabled ? -1 : 0}
          role="button"
          aria-label="Seleccionar pies"
          onClick={() => activate("FEET")}
          onKeyDown={onKey("FEET")}
        >
          <ellipse cx="133" cy="878" rx="44" ry="50" />
          <ellipse cx="230" cy="878" rx="44" ry="50" />
        </g>
      </svg>
    </div>
  );
}
