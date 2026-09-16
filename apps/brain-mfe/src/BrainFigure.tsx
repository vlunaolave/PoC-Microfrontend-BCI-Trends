import silhouette from "./assets/brain-silhouette.png";
import styles from "./brain.module.css";

interface BrainFigureProps {
  zone: "left" | "right" | "medial" | "none";
}

const TIPS = {
  C3: "Electrodo EEG aproximado sobre región sensoriomotora izquierda (visible en esta vista lateral).",
  CZ: "Electrodo EEG aproximado sobre el vértice / región medial de pies.",
  C4: "Electrodo EEG esquemático del hemisferio derecho, contralateral a esta vista.",
};

export function BrainFigure({ zone }: BrainFigureProps) {
  return (
    <div className={styles.figure}>
      <img
        className={styles.photo}
        src={silhouette}
        alt="Vista lateral izquierda educativa del cerebro con electrodos C3, Cz y C4"
        draggable={false}
      />
      <svg
        className={styles.hitLayer}
        viewBox="0 0 1024 871"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Electrodos C3, Cz y C4 sobre vista lateral del cerebro"
      >
        <title>Representación educativa del cerebro. No es un mapa médico exacto.</title>
        <defs>
          <filter id="zoneGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {zone === "left" ? (
          <ellipse className={styles.zone} cx="410" cy="248" rx="118" ry="92" fill="#7c8cff" opacity="0.38" filter="url(#zoneGlow)" />
        ) : null}
        {zone === "right" ? (
          <ellipse className={styles.zone} cx="628" cy="168" rx="110" ry="86" fill="#b07cff" opacity="0.38" filter="url(#zoneGlow)" />
        ) : null}
        {zone === "medial" ? (
          <ellipse className={styles.zone} cx="528" cy="92" rx="96" ry="70" fill="#67d4c4" opacity="0.4" filter="url(#zoneGlow)" />
        ) : null}

        <g className={styles.electrode}>
          <circle cx="410" cy="248" r="18" fill="#1a222c" stroke="#e8eef4" strokeWidth="4">
            <title>{TIPS.C3}</title>
          </circle>
          <circle cx="410" cy="248" r="6" fill="#8be0ff" />
          <circle cx="528" cy="92" r="18" fill="#1a222c" stroke="#e8eef4" strokeWidth="4">
            <title>{TIPS.CZ}</title>
          </circle>
          <circle cx="528" cy="92" r="6" fill="#8be0ff" />
          <circle cx="628" cy="168" r="18" fill="#1a222c" stroke="#e8eef4" strokeWidth="4">
            <title>{TIPS.C4}</title>
          </circle>
          <circle cx="628" cy="168" r="6" fill="#8be0ff" />
        </g>
        <text className={styles.electrodeLabel} x="358" y="300">
          C3
        </text>
        <text className={styles.electrodeLabel} x="500" y="64">
          Cz
        </text>
        <text className={styles.electrodeLabel} x="602" y="220">
          C4
        </text>
      </svg>
    </div>
  );
}

export { TIPS };
