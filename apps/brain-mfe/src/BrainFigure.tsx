import type { MotorTask } from "@neuromfe/contracts";
import silhouette from "./assets/brain-silhouette.png";
import styles from "./brain.module.css";

interface BrainFigureProps {
  task: MotorTask | null;
}

interface Site {
  id: string;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
  tip: string;
  activeFor: MotorTask[];
  fill: string;
}

const TIPS = {
  Fp1: "Frontal polar izquierdo, aproximación educativa.",
  F3: "Frontal izquierdo, cerca de áreas premotoras.",
  Fz: "Frontal medial. Útil como referencia de línea media.",
  C3: "Electrodo EEG aproximado sobre región sensoriomotora izquierda.",
  Cz: "Vértice / región medial, asociada a pies.",
  C4: "Sensoriomotor derecho, marcado de forma esquemática en esta vista.",
  T3: "Temporal izquierdo, aproximación educativa.",
  P3: "Parietal izquierdo.",
  Pz: "Parietal medial.",
  O1: "Occipital izquierdo.",
} as const;

const SITES: Site[] = [
  { id: "Fp1", x: 150, y: 310, labelX: 78, labelY: 300, tip: "Frontal polar izquierdo, aproximación educativa.", activeFor: ["TONGUE"], fill: "#f0c38a" },
  { id: "F3", x: 268, y: 188, labelX: 198, labelY: 168, tip: "Frontal izquierdo, cerca de áreas premotoras.", activeFor: ["TONGUE", "RIGHT_ARM"], fill: "#e8b84a" },
  { id: "Fz", x: 402, y: 108, labelX: 348, labelY: 88, tip: "Frontal medial. Útil como referencia de línea media.", activeFor: ["TONGUE"], fill: "#e8b84a" },
  { id: "C3", x: 410, y: 248, labelX: 348, labelY: 290, tip: "Electrodo EEG aproximado sobre región sensoriomotora izquierda.", activeFor: ["RIGHT_HAND", "RIGHT_ARM"], fill: "#7c8cff" },
  { id: "Cz", x: 528, y: 92, labelX: 548, labelY: 64, tip: "Vértice / región medial, asociada a pies.", activeFor: ["FEET"], fill: "#67d4c4" },
  { id: "C4", x: 628, y: 168, labelX: 652, labelY: 148, tip: "Sensoriomotor derecho, marcado de forma esquemática en esta vista.", activeFor: ["LEFT_HAND", "LEFT_ARM"], fill: "#b07cff" },
  { id: "T3", x: 356, y: 430, labelX: 286, labelY: 470, tip: "Temporal izquierdo, aproximación educativa.", activeFor: ["TONGUE"], fill: "#8aa0b5" },
  { id: "P3", x: 690, y: 300, labelX: 718, labelY: 338, tip: "Parietal izquierdo.", activeFor: ["RIGHT_HAND"], fill: "#6ba4f8" },
  { id: "Pz", x: 742, y: 150, labelX: 770, labelY: 130, tip: "Parietal medial.", activeFor: ["FEET"], fill: "#67d4c4" },
  { id: "O1", x: 880, y: 330, labelX: 900, labelY: 372, tip: "Occipital izquierdo.", activeFor: [], fill: "#9aa8b6" },
];

export function BrainFigure({ task }: BrainFigureProps) {
  return (
    <div className={styles.figure}>
      <img
        className={styles.photo}
        src={silhouette}
        alt="Vista lateral izquierda educativa del cerebro con posiciones 10-20 aproximadas"
        draggable={false}
      />
      <svg
        className={styles.hitLayer}
        viewBox="0 0 1024 871"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Vista lateral del cerebro con electrodos Fp1, F3, Fz, C3, Cz, C4, T3, P3, Pz y O1"
      >
        <title>Representación educativa del cerebro. No es un mapa médico exacto.</title>
        <defs>
          <filter id="zoneGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {SITES.filter((site) => task && site.activeFor.includes(task)).map((site) => (
          <ellipse
            key={`glow-${site.id}`}
            className={styles.zone}
            cx={site.x}
            cy={site.y}
            rx={90}
            ry={70}
            fill={site.fill}
            opacity="0.34"
            filter="url(#zoneGlow)"
          />
        ))}

        {SITES.map((site) => {
          const active = Boolean(task && site.activeFor.includes(task));
          return (
            <g key={site.id} className={active ? styles.siteActive : styles.site}>
              <circle cx={site.x} cy={site.y} r={active ? 16 : 11} fill="#1a222c" stroke="#e8eef4" strokeWidth={active ? 4 : 2.5}>
                <title>{site.tip}</title>
              </circle>
              {active ? <circle cx={site.x} cy={site.y} r={5} fill="#8be0ff" /> : null}
              <text className={styles.electrodeLabel} x={site.labelX} y={site.labelY}>
                {site.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export { TIPS };
