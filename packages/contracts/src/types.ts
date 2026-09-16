export type AppMode = "EXPLORE" | "BCI";

export type MotorTask =
  | "REST"
  | "LEFT_HAND"
  | "RIGHT_HAND"
  | "LEFT_ARM"
  | "RIGHT_ARM"
  | "FEET"
  | "TONGUE";

export type MotorChannel = "C3" | "CZ" | "C4";

export type EEGChannel =
  | "FP1"
  | "F3"
  | "FZ"
  | MotorChannel
  | "T3"
  | "P3"
  | "PZ"
  | "O1";

export type MfeId = "shell" | "body-mfe" | "brain-mfe" | "signal-mfe" | "decoder-mfe";

export type MfeStatus = "LOADING" | "ONLINE" | "ERROR";

export const MOTOR_CHANNELS: readonly MotorChannel[] = ["C3", "CZ", "C4"];

export const EEG_CHANNELS: readonly EEGChannel[] = [
  "FP1",
  "F3",
  "FZ",
  "C3",
  "CZ",
  "C4",
  "T3",
  "P3",
  "PZ",
  "O1",
];

export const MOTOR_TASKS: readonly MotorTask[] = [
  "REST",
  "LEFT_HAND",
  "RIGHT_HAND",
  "LEFT_ARM",
  "RIGHT_ARM",
  "FEET",
  "TONGUE",
];

export const SAMPLE_RATE_HZ = 250;
export const WINDOW_DURATION_MS = 2000;
export const SAMPLES_PER_WINDOW = (SAMPLE_RATE_HZ * WINDOW_DURATION_MS) / 1000;

export interface EEGSample {
  timestamp: number;
  value: number;
}

export interface EEGChannelData {
  channel: EEGChannel;
  samples: number[];
}

export interface EEGWindow {
  trialId: string;
  sampleRate: number;
  durationMs: number;
  channels: EEGChannelData[];
}

export interface ChannelFeatures {
  muPower: number;
  betaPower: number;
  muSuppression: number;
  betaSuppression: number;
}

export interface EEGFeatures {
  C3: ChannelFeatures;
  CZ: ChannelFeatures;
  C4: ChannelFeatures;
}

export interface ClassificationResult {
  trialId: string;
  predictedTask: MotorTask;
  confidence: number;
  dominantChannel: MotorChannel | null;
  features: EEGFeatures;
}

export interface EEGSource {
  calibrate(): Promise<EEGWindow>;
  startTrial(options?: { task?: MotorTask; seed?: number }): Promise<EEGWindow>;
}

export const MOTOR_TASK_LABELS: Record<MotorTask, string> = {
  REST: "Reposo",
  LEFT_HAND: "Mano izquierda",
  RIGHT_HAND: "Mano derecha",
  LEFT_ARM: "Brazo izquierdo",
  RIGHT_ARM: "Brazo derecho",
  FEET: "Pies",
  TONGUE: "Lengua / cara",
};

export const MOTOR_TASK_COMMANDS: Record<MotorTask, string> = {
  REST: "Reposo / Sin intención motora detectada",
  LEFT_HAND: "Mover mano izquierda",
  RIGHT_HAND: "Mover mano derecha",
  LEFT_ARM: "Mover brazo izquierdo",
  RIGHT_ARM: "Mover brazo derecho",
  FEET: "Mover pies",
  TONGUE: "Mover lengua / cara",
};

export const CHANNEL_LABELS: Record<EEGChannel, string> = {
  FP1: "Fp1",
  F3: "F3",
  FZ: "Fz",
  C3: "C3",
  CZ: "Cz",
  C4: "C4",
  T3: "T3",
  P3: "P3",
  PZ: "Pz",
  O1: "O1",
};

export function channelsForMotorTask(task: MotorTask | null): readonly EEGChannel[] {
  if (task === "RIGHT_HAND") return ["C3", "P3"];
  if (task === "RIGHT_ARM") return ["C3", "F3"];
  if (task === "LEFT_HAND" || task === "LEFT_ARM") return ["C4"];
  if (task === "FEET") return ["CZ", "PZ"];
  if (task === "TONGUE") return ["FP1", "F3", "FZ", "T3"];
  return [];
}

export const CHANNEL_BODY_HINTS: Record<EEGChannel, string> = {
  FP1: "frontal polar",
  F3: "frontal",
  FZ: "frontal medial",
  C3: "mano/brazo der.",
  CZ: "pies",
  C4: "mano/brazo izq.",
  T3: "temporal",
  P3: "parietal",
  PZ: "parietal medial",
  O1: "occipital",
};

export function emptyChannelBuffers(): Record<EEGChannel, number[]> {
  return {
    FP1: [],
    F3: [],
    FZ: [],
    C3: [],
    CZ: [],
    C4: [],
    T3: [],
    P3: [],
    PZ: [],
    O1: [],
  };
}

export function motorTaskWaveHint(task: MotorTask | null): string {
  if (task === "RIGHT_HAND") return "Mano derecha → C3 y P3 oscilan";
  if (task === "RIGHT_ARM") return "Brazo derecho → C3 y F3 oscilan";
  if (task === "LEFT_HAND") return "Mano izquierda → C4 oscila";
  if (task === "LEFT_ARM") return "Brazo izquierdo → C4 oscila";
  if (task === "FEET") return "Pies / piernas → Cz y Pz oscilan";
  if (task === "TONGUE") return "Lengua / cara → Fp1, F3, Fz y T3 oscilan";
  return "Reposo → las 10 derivaciones en baseline";
}
