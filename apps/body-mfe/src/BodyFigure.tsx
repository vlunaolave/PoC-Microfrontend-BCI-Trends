import type { KeyboardEvent } from "react";
import type { MotorTask } from "@neuromfe/contracts";
import silhouette from "./assets/human-silhouette.png";
import styles from "./body.module.css";

interface BodyFigureProps {
  task: MotorTask | null;
  disabled: boolean;
  onSelect: (task: MotorTask) => void;
  onFocus?: (task: MotorTask | null) => void;
}

interface Region {
  task: MotorTask;
  label: string;
  aria: string;
  shapes: Array<{ cx: number; cy: number; rx: number; ry: number }>;
  caption: { x: number; y: number };
}

const REGIONS: Region[] = [
  {
    task: "TONGUE",
    label: "Cara",
    aria: "Seleccionar lengua / cara",
    shapes: [{ cx: 181, cy: 78, rx: 48, ry: 58 }],
    caption: { x: 236, y: 70 },
  },
  {
    task: "RIGHT_ARM",
    label: "Brazo D",
    aria: "Seleccionar brazo derecho",
    shapes: [{ cx: 58, cy: 300, rx: 38, ry: 92 }],
    caption: { x: 4, y: 248 },
  },
  {
    task: "LEFT_ARM",
    label: "Brazo I",
    aria: "Seleccionar brazo izquierdo",
    shapes: [{ cx: 305, cy: 300, rx: 38, ry: 92 }],
    caption: { x: 312, y: 248 },
  },
  {
    task: "RIGHT_HAND",
    label: "Mano D",
    aria: "Seleccionar mano derecha",
    shapes: [{ cx: 40, cy: 540, rx: 50, ry: 78 }],
    caption: { x: 2, y: 500 },
  },
  {
    task: "LEFT_HAND",
    label: "Mano I",
    aria: "Seleccionar mano izquierda",
    shapes: [{ cx: 323, cy: 540, rx: 50, ry: 78 }],
    caption: { x: 300, y: 500 },
  },
  {
    task: "FEET",
    label: "Piernas",
    aria: "Seleccionar piernas y pies",
    shapes: [
      { cx: 142, cy: 700, rx: 36, ry: 88 },
      { cx: 220, cy: 700, rx: 36, ry: 88 },
      { cx: 133, cy: 878, rx: 42, ry: 46 },
      { cx: 230, cy: 878, rx: 42, ry: 46 },
    ],
    caption: { x: 250, y: 760 },
  },
];

export function BodyFigure({ task, disabled, onSelect, onFocus }: BodyFigureProps) {
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
        role="img"
        aria-label="Zonas de tarea motora sobre la silueta: cara, brazos, manos, piernas y pies"
      >
        <title>Figura humana educativa, vista frontal</title>
        {REGIONS.map((region) => (
          <g
            key={region.task}
            className={`${styles.region} ${task === region.task ? styles.regionActive : ""}`}
            tabIndex={disabled ? -1 : 0}
            role="button"
            aria-label={region.aria}
            onClick={() => activate(region.task)}
            onKeyDown={onKey(region.task)}
            onPointerEnter={() => {
              if (!disabled) onFocus?.(region.task);
            }}
            onPointerLeave={() => {
              if (!disabled) onFocus?.(null);
            }}
          >
            {region.shapes.map((shape) => (
              <ellipse key={`${shape.cx}-${shape.cy}`} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />
            ))}
            <text className={styles.regionLabel} x={region.caption.x} y={region.caption.y}>
              {region.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
