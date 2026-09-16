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
    <svg
      className={styles.svg}
      viewBox="0 0 363 930"
      role="img"
      aria-label="Silueta humana frontal. La mano derecha del sujeto está a la izquierda de la imagen."
      data-disabled={disabled}
    >
      <title>Figura humana educativa, vista frontal</title>
      <defs>
        <filter id="bodyGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <image href={silhouette} width="363" height="930" preserveAspectRatio="xMidYMid meet" />

      <g
        className={`${styles.region} ${task === "RIGHT_HAND" ? styles.regionActive : ""}`}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Seleccionar mano derecha"
        onClick={() => activate("RIGHT_HAND")}
        onKeyDown={onKey("RIGHT_HAND")}
        filter={task === "RIGHT_HAND" ? "url(#bodyGlow)" : undefined}
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
        filter={task === "LEFT_HAND" ? "url(#bodyGlow)" : undefined}
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
        filter={task === "FEET" ? "url(#bodyGlow)" : undefined}
      >
        <ellipse cx="133" cy="878" rx="44" ry="50" />
        <ellipse cx="230" cy="878" rx="44" ry="50" />
      </g>
    </svg>
  );
}
