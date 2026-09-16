import styles from "./brain.module.css";

interface BrainFigureProps {
  zone: "left" | "right" | "medial" | "none";
}

const TIPS = {
  C3: "Electrodo EEG aproximado sobre región sensoriomotora izquierda.",
  CZ: "Electrodo EEG aproximado sobre la línea media / región de pies.",
  C4: "Electrodo EEG aproximado sobre región sensoriomotora derecha.",
};

export function BrainFigure({ zone }: BrainFigureProps) {
  return (
    <svg
      className={styles.svg}
      viewBox="0 0 520 300"
      role="img"
      aria-label="Vista superior educativa del cerebro con electrodos C3, Cz y C4"
    >
      <title>Representación educativa del cerebro. No es un mapa médico exacto.</title>
      <defs>
        <linearGradient id="cortexLeft" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#e3c2b8" />
          <stop offset="45%" stopColor="#c48b84" />
          <stop offset="100%" stopColor="#7a4d52" />
        </linearGradient>
        <linearGradient id="cortexRight" x1="80%" y1="10%" x2="20%" y2="90%">
          <stop offset="0%" stopColor="#e3c2b8" />
          <stop offset="45%" stopColor="#c48b84" />
          <stop offset="100%" stopColor="#7a4d52" />
        </linearGradient>
        <linearGradient id="cortexMedial" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#d7a8a0" />
          <stop offset="100%" stopColor="#6e4248" />
        </linearGradient>
        <filter id="brainShadow" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.35" />
        </filter>
        <filter id="zoneGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="leftClip">
          <path d="M258 36c-24 6-86 16-128 48-40 30-62 74-54 118 10 52 62 78 140 84 22 2 40-8 46-24V48c-2-6-4-10-4-12z" />
        </clipPath>
        <clipPath id="rightClip">
          <path d="M262 36c24 6 86 16 128 48 40 30 62 74 54 118-10 52-62 78-140 84-22 2-40-8-46-24V48c2-6 4-10 4-12z" />
        </clipPath>
      </defs>

      <ellipse cx="260" cy="268" rx="150" ry="16" fill="#000" opacity="0.22" />

      <g filter="url(#brainShadow)">
        <path
          className={`${styles.hemisphere} ${zone === "left" ? styles.leftActive : ""}`}
          fill="url(#cortexLeft)"
          d="M258 36c-24 6-86 16-128 48-40 30-62 74-54 118 10 52 62 78 140 84 22 2 40-8 46-24V48c-2-6-4-10-4-12z"
        />
        <path
          className={`${styles.hemisphere} ${zone === "right" ? styles.rightActive : ""}`}
          fill="url(#cortexRight)"
          d="M262 36c24 6 86 16 128 48 40 30 62 74 54 118-10 52-62 78-140 84-22 2-40-8-46-24V48c2-6 4-10 4-12z"
        />
        <path
          className={`${styles.medial} ${zone === "medial" ? styles.medialActive : ""}`}
          fill="url(#cortexMedial)"
          d="M252 46c2-4 8-8 8-8s6 4 8 8v176c-2 8-6 14-8 14s-6-6-8-14z"
        />
      </g>

      <g clipPath="url(#leftClip)" fill="none" stroke="#5a3038" strokeOpacity="0.55" strokeWidth="1.35" strokeLinecap="round">
        <path d="M150 70c28 8 62 10 90 4" />
        <path d="M132 92c36 12 78 14 112 6" />
        <path d="M118 118c42 14 86 16 122 6" />
        <path d="M112 146c44 12 90 12 128 2" />
        <path d="M118 174c40 10 84 10 120 0" />
        <path d="M132 200c34 8 72 8 104-2" />
        <path d="M154 222c28 6 56 4 80-4" />
        <path d="M168 78c-10 28-14 62-8 96" />
        <path d="M198 70c-8 32-10 70-4 108" />
        <path d="M226 64c-6 36-6 80 2 122" />
        <path d="M140 108c18 18 22 40 16 66" />
        <path d="M176 160c16 14 18 32 10 52" />
      </g>
      <g clipPath="url(#rightClip)" fill="none" stroke="#5a3038" strokeOpacity="0.55" strokeWidth="1.35" strokeLinecap="round">
        <path d="M370 70c-28 8-62 10-90 4" />
        <path d="M388 92c-36 12-78 14-112 6" />
        <path d="M402 118c-42 14-86 16-122 6" />
        <path d="M408 146c-44 12-90 12-128 2" />
        <path d="M402 174c-40 10-84 10-120 0" />
        <path d="M388 200c-34 8-72 8-104-2" />
        <path d="M366 222c-28 6-56 4-80-4" />
        <path d="M352 78c10 28 14 62 8 96" />
        <path d="M322 70c8 32 10 70 4 108" />
        <path d="M294 64c6 36 6 80-2 122" />
        <path d="M380 108c-18 18-22 40-16 66" />
        <path d="M344 160c-16 14-18 32-10 52" />
      </g>

      <path d="M260 44c-2 20-2 70 0 128 2 40 2 70 0 88" fill="none" stroke="#3a2228" strokeWidth="3.2" strokeLinecap="round" />

      <g className={styles.cerebellum} opacity="0.9">
        <path d="M188 236c18 18 46 26 72 26 8 0 8 0 16-2" fill="none" stroke="#8a5a60" strokeWidth="6" strokeLinecap="round" />
        <path d="M332 236c-18 18-46 26-72 26-8 0-8 0-16-2" fill="none" stroke="#8a5a60" strokeWidth="6" strokeLinecap="round" />
      </g>

      {zone === "left" ? (
        <path
          d="M148 108c28 8 58 10 86 4 4 18 6 40 4 62-30 8-62 8-92-2-4-20-4-42 2-64z"
          fill="#7c8cff"
          opacity="0.42"
          filter="url(#zoneGlow)"
        />
      ) : null}
      {zone === "right" ? (
        <path
          d="M372 108c-28 8-58 10-86 4-4 18-6 40-4 62 30 8 62 8 92-2 4-20 4-42-2-64z"
          fill="#b07cff"
          opacity="0.42"
          filter="url(#zoneGlow)"
        />
      ) : null}
      {zone === "medial" ? (
        <path
          d="M248 78c8-6 16-6 24 0 4 36 6 84 2 132-8 8-20 8-28 0-4-48-2-96 2-132z"
          fill="#67d4c4"
          opacity="0.4"
          filter="url(#zoneGlow)"
        />
      ) : null}

      <g className={styles.electrode}>
        <circle cx="168" cy="132" r="9" fill="#1a222c" stroke="#e8eef4" strokeWidth="2">
          <title>{TIPS.C3}</title>
        </circle>
        <circle cx="168" cy="132" r="3.2" fill="#8be0ff" />
        <circle cx="260" cy="118" r="9" fill="#1a222c" stroke="#e8eef4" strokeWidth="2">
          <title>{TIPS.CZ}</title>
        </circle>
        <circle cx="260" cy="118" r="3.2" fill="#8be0ff" />
        <circle cx="352" cy="132" r="9" fill="#1a222c" stroke="#e8eef4" strokeWidth="2">
          <title>{TIPS.C4}</title>
        </circle>
        <circle cx="352" cy="132" r="3.2" fill="#8be0ff" />
      </g>
      <text className={styles.electrodeLabel} x="154" y="160">
        C3
      </text>
      <text className={styles.electrodeLabel} x="250" y="104">
        Cz
      </text>
      <text className={styles.electrodeLabel} x="338" y="160">
        C4
      </text>
    </svg>
  );
}

export { TIPS };
