import type { KeyboardEvent } from "react";
import type { MotorTask } from "@neuromfe/contracts";
import styles from "./body.module.css";

interface BodyFigureProps {
  task: MotorTask | null;
  disabled: boolean;
  onSelect: (task: MotorTask) => void;
}

const SILHOUETTE =
  "M 104 12 Q 96 16 93 22 Q 90 28 89 35 Q 88 42 90 49 Q 92 56 95 60 Q 98 64 100 68 Q 102 72 101 77 Q 100 82 86 86 Q 72 90 68 95 Q 64 100 61 114 Q 58 128 55 143 Q 52 158 49 173 Q 46 188 40 193 Q 34 198 29 204 Q 24 210 23 217 Q 22 224 26 230 Q 30 236 36 237 Q 42 238 46 232 Q 50 226 52 218 Q 54 210 57 189 Q 60 168 64 148 Q 68 128 72 118 Q 76 108 78 124 Q 80 140 81 159 Q 82 178 83 194 Q 84 210 80 216 Q 76 222 75 245 Q 74 268 75 293 Q 76 318 77 343 Q 78 368 79 388 Q 80 408 71 411 Q 62 414 55 417 Q 48 420 47 425 Q 46 430 58 431 Q 70 432 78 430 Q 86 428 88 420 Q 90 412 91 386 Q 92 360 93 330 Q 94 300 96 274 Q 98 248 101 237 Q 104 226 112 225 Q 120 224 128 225 Q 136 226 139 237 Q 142 248 144 274 Q 146 300 147 330 Q 148 360 149 386 Q 150 412 152 420 Q 154 428 162 430 Q 170 432 182 431 Q 194 430 193 425 Q 192 420 185 417 Q 178 414 169 411 Q 160 408 161 388 Q 162 368 163 343 Q 164 318 165 293 Q 166 268 165 245 Q 164 222 160 216 Q 156 210 157 194 Q 158 178 159 159 Q 160 140 162 124 Q 164 108 168 118 Q 172 128 176 148 Q 180 168 183 189 Q 186 210 188 218 Q 190 226 194 232 Q 198 238 204 237 Q 210 236 214 230 Q 218 224 217 217 Q 216 210 211 204 Q 206 198 200 193 Q 194 188 191 173 Q 188 158 185 143 Q 182 128 179 114 Q 176 100 172 95 Q 168 90 154 86 Q 140 82 139 77 Q 138 72 140 68 Q 142 64 145 60 Q 148 56 150 49 Q 152 42 151 35 Q 150 28 147 22 Q 144 16 140 14 T 136 12 Z";

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
      viewBox="0 0 240 448"
      role="img"
      aria-label="Silueta humana frontal. La mano derecha del sujeto está a la izquierda de la imagen."
      data-disabled={disabled}
    >
      <title>Figura humana educativa, vista frontal</title>
      <defs>
        <linearGradient id="skin" x1="18%" y1="0%" x2="88%" y2="100%">
          <stop offset="0%" stopColor="#efd7c4" />
          <stop offset="42%" stopColor="#c9a58c" />
          <stop offset="100%" stopColor="#7d5e4c" />
        </linearGradient>
        <linearGradient id="skinSheen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#2a1c16" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id="hair" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#3f342d" />
          <stop offset="100%" stopColor="#1a1512" />
        </linearGradient>
        <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="bodyGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="120" cy="438" rx="70" ry="8" fill="url(#groundShadow)" />
      <path d={SILHOUETTE} fill="url(#skin)" stroke="#3a2c26" strokeWidth="1.15" strokeLinejoin="round" />
      <path d={SILHOUETTE} fill="url(#skinSheen)" />
      <path d="M96 18c16-12 40-12 52 2 6 8 6 18 2 26-14-12-32-18-54-14 0-6 0-10 0-14z" fill="url(#hair)" />

      <g fill="none" stroke="#3a2c26" strokeOpacity="0.28" strokeWidth="0.95">
        <path d="M120 78v78" />
        <path d="M98 102c10 10 16 14 22 14s12-4 22-14" />
        <path d="M100 148c8 6 14 8 20 8s12-2 20-8" />
        <path d="M106 186c6 3 10 4 14 4s8-1 14-4" />
        <path d="M108 300c6-28 8-54 10-78" />
        <path d="M132 300c-6-28-8-54-10-78" />
        <ellipse cx="120" cy="42" rx="16" ry="20" />
      </g>
      <ellipse cx="110" cy="40" rx="2.6" ry="1.7" fill="#3a2c26" opacity="0.32" />
      <ellipse cx="130" cy="40" rx="2.6" ry="1.7" fill="#3a2c26" opacity="0.32" />
      <path d="M120 42v8" stroke="#3a2c26" strokeOpacity="0.25" strokeWidth="1.05" />
      <path d="M115 56c3.2 2.4 6.8 2.4 10 0" fill="none" stroke="#3a2c26" strokeOpacity="0.22" strokeWidth="1" />

      <g
        className={`${styles.region} ${task === "RIGHT_HAND" ? styles.regionActive : ""}`}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Seleccionar mano derecha"
        onClick={() => activate("RIGHT_HAND")}
        onKeyDown={onKey("RIGHT_HAND")}
        filter={task === "RIGHT_HAND" ? "url(#bodyGlow)" : undefined}
      >
        <path d="M20 196c12-8 28-6 38 8 6 10 6 24-2 34-8 8-20 10-32 6-10-4-16-16-12-28 2-6 4-14 8-20z" />
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
        <path d="M220 196c-12-8-28-6-38 8-6 10-6 24 2 34 8 8 20 10 32 6 10-4 16-16 12-28-2-6-4-14-8-20z" />
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
        <path d="M46 412h42v24H44z" />
        <path d="M152 412h42v24h-40z" />
      </g>
    </svg>
  );
}
