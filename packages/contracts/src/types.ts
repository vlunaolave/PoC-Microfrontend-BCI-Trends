export type AppMode = "EXPLORE" | "BCI";

export type MotorTask =
  | "REST"
  | "LEFT_HAND"
  | "RIGHT_HAND"
  | "LEFT_ARM"
  | "RIGHT_ARM"
  | "FEET"
  | "TONGUE";

export type EEGChannel = "C3" | "CZ" | "C4";

export type MfeId = "shell" | "body-mfe" | "brain-mfe" | "signal-mfe" | "decoder-mfe";

export type MfeStatus = "LOADING" | "ONLINE" | "ERROR";

export const EEG_CHANNELS: readonly EEGChannel[] = ["C3", "CZ", "C4"];

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
  dominantChannel: EEGChannel | null;
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
  C3: "C3",
  CZ: "Cz",
  C4: "C4",
};

export function channelsForMotorTask(task: MotorTask | null): readonly EEGChannel[] {
  if (task === "RIGHT_HAND" || task === "RIGHT_ARM") return ["C3"];
  if (task === "LEFT_HAND" || task === "LEFT_ARM") return ["C4"];
  if (task === "FEET") return ["CZ"];
  if (task === "TONGUE") return ["C3", "CZ", "C4"];
  return [];
}

export const CHANNEL_BODY_HINTS: Record<EEGChannel, string> = {
  C3: "mano/brazo der.",
  CZ: "pies",
  C4: "mano/brazo izq.",
};

export function motorTaskWaveHint(task: MotorTask | null): string {
  if (task === "RIGHT_HAND") return "Mano derecha → la onda de C3 oscila";
  if (task === "RIGHT_ARM") return "Brazo derecho → la onda de C3 oscila";
  if (task === "LEFT_HAND") return "Mano izquierda → la onda de C4 oscila";
  if (task === "LEFT_ARM") return "Brazo izquierdo → la onda de C4 oscila";
  if (task === "FEET") return "Pies / piernas → la onda de Cz oscila";
  if (task === "TONGUE") return "Lengua / cara → C3, Cz y C4 oscilan juntas";
  return "Reposo → las tres ondas en baseline";
}
