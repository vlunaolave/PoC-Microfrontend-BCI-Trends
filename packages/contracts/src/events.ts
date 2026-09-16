import type {
  AppMode,
  ClassificationResult,
  EEGFeatures,
  EEGWindow,
  MfeId,
  MotorTask,
} from "./types";

export const EVENT_NAMES = {
  APP_MODE_CHANGED: "app:mode-changed",
  MOTOR_TASK_SELECTED: "motor:task-selected",
  MOTOR_TASK_CLEARED: "motor:task-cleared",
  MFE_READY: "mfe:ready",
  MFE_ERROR: "mfe:error",
  EEG_CALIBRATION_STARTED: "eeg:calibration-started",
  EEG_CALIBRATION_COMPLETED: "eeg:calibration-completed",
  EEG_TRIAL_STARTED: "eeg:trial-started",
  EEG_WINDOW_READY: "eeg:window-ready",
  SIGNAL_PROCESSING_STARTED: "signal:processing-started",
  SIGNAL_FEATURES_EXTRACTED: "decoder:features-extracted",
  CLASSIFICATION_RESULT: "decoder:classification-result",
  TRIAL_GROUND_TRUTH_REVEALED: "trial:ground-truth-revealed",
  ARCHITECTURE_TOGGLED: "app:architecture-toggled",
  NEW_BCI_TRIAL_REQUESTED: "bci:new-trial-requested",
  RECALIBRATE_REQUESTED: "eeg:recalibrate-requested",
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];

export interface AppModeChangedPayload {
  mode: AppMode;
  timestamp: number;
}

export interface MotorTaskSelectedPayload {
  task: MotorTask;
  source: MfeId;
  timestamp: number;
}

export interface MotorTaskClearedPayload {
  timestamp: number;
}

export interface MfeReadyPayload {
  id: MfeId;
  version: string;
  timestamp: number;
}

export interface MfeErrorPayload {
  id: MfeId;
  message: string;
  timestamp: number;
}

export interface EegCalibrationStartedPayload {
  timestamp: number;
}

export interface EegCalibrationCompletedPayload {
  window: EEGWindow;
  timestamp: number;
}

export interface EegTrialStartedPayload {
  trialId: string;
  mode: AppMode;
  timestamp: number;
}

export interface EegWindowReadyPayload {
  window: EEGWindow;
  timestamp: number;
}

export interface SignalProcessingStartedPayload {
  trialId: string;
  timestamp: number;
}

export interface SignalFeaturesExtractedPayload {
  trialId: string;
  features: EEGFeatures;
  timestamp: number;
}

export interface ClassificationResultPayload extends ClassificationResult {
  timestamp: number;
}

export interface TrialGroundTruthRevealedPayload {
  trialId: string;
  actualTask: MotorTask;
  predictedTask: MotorTask;
  match: boolean;
  timestamp: number;
}

export interface ArchitectureToggledPayload {
  enabled: boolean;
  timestamp: number;
}

export interface NewBciTrialRequestedPayload {
  timestamp: number;
}

export interface RecalibrateRequestedPayload {
  timestamp: number;
}

export interface NeuroEventMap {
  [EVENT_NAMES.APP_MODE_CHANGED]: AppModeChangedPayload;
  [EVENT_NAMES.MOTOR_TASK_SELECTED]: MotorTaskSelectedPayload;
  [EVENT_NAMES.MOTOR_TASK_CLEARED]: MotorTaskClearedPayload;
  [EVENT_NAMES.MFE_READY]: MfeReadyPayload;
  [EVENT_NAMES.MFE_ERROR]: MfeErrorPayload;
  [EVENT_NAMES.EEG_CALIBRATION_STARTED]: EegCalibrationStartedPayload;
  [EVENT_NAMES.EEG_CALIBRATION_COMPLETED]: EegCalibrationCompletedPayload;
  [EVENT_NAMES.EEG_TRIAL_STARTED]: EegTrialStartedPayload;
  [EVENT_NAMES.EEG_WINDOW_READY]: EegWindowReadyPayload;
  [EVENT_NAMES.SIGNAL_PROCESSING_STARTED]: SignalProcessingStartedPayload;
  [EVENT_NAMES.SIGNAL_FEATURES_EXTRACTED]: SignalFeaturesExtractedPayload;
  [EVENT_NAMES.CLASSIFICATION_RESULT]: ClassificationResultPayload;
  [EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED]: TrialGroundTruthRevealedPayload;
  [EVENT_NAMES.ARCHITECTURE_TOGGLED]: ArchitectureToggledPayload;
  [EVENT_NAMES.NEW_BCI_TRIAL_REQUESTED]: NewBciTrialRequestedPayload;
  [EVENT_NAMES.RECALIBRATE_REQUESTED]: RecalibrateRequestedPayload;
}

export function summarizeEvent(eventName: EventName, payload: unknown): string {
  if (eventName === EVENT_NAMES.EEG_WINDOW_READY) {
    const window = (payload as EegWindowReadyPayload).window;
    const samples = window.channels[0]?.samples.length ?? 0;
    return `${window.channels.length} channels / ${samples} samples`;
  }
  if (eventName === EVENT_NAMES.MOTOR_TASK_SELECTED) {
    return (payload as MotorTaskSelectedPayload).task;
  }
  if (eventName === EVENT_NAMES.CLASSIFICATION_RESULT) {
    const result = payload as ClassificationResultPayload;
    return `${result.predictedTask} (${Math.round(result.confidence * 100)}%)`;
  }
  if (eventName === EVENT_NAMES.MFE_READY) {
    return (payload as MfeReadyPayload).id;
  }
  return "";
}
