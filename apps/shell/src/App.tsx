import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  EVENT_NAMES,
  markShellHost,
  publish,
  setTimingScale,
  subscribe,
  summarizeEvent,
  type AppMode,
  type EventName,
  type MfeId,
  type MfeStatus,
  type MotorTask,
} from "@neuromfe/contracts";
import { Activity, HelpCircle, Layers } from "lucide-react";
import { RemoteErrorBoundary, RemoteSkeleton } from "./RemoteErrorBoundary";
import styles from "./app.module.css";

const BodyApp = lazy(() => import("body_mfe/BodyApp"));
const BrainApp = lazy(() => import("brain_mfe/BrainApp"));
const SignalApp = lazy(() => import("signal_mfe/SignalApp"));
const DecoderApp = lazy(() => import("decoder_mfe/DecoderApp"));

const MFE_META: Array<{ id: MfeId; label: string; port: string; version: string }> = [
  { id: "shell", label: "Shell", port: "3000", version: "1.0.0" },
  { id: "body-mfe", label: "Body MFE", port: "3001", version: "1.0.0" },
  { id: "brain-mfe", label: "Brain MFE", port: "3002", version: "1.0.0" },
  { id: "signal-mfe", label: "Signal MFE", port: "3003", version: "1.0.0" },
  { id: "decoder-mfe", label: "Decoder MFE", port: "3004", version: "1.0.0" },
];

interface MonitorEvent {
  time: string;
  name: EventName;
  source: string;
  summary: string;
}

const WHAT: Record<MotorTask, string[]> = {
  RIGHT_HAND: [
    "Se simula intención de mover la mano derecha.",
    "La actividad asociada se representa principalmente sobre la región sensoriomotora izquierda.",
    "En el osciloscopio, C3 y P3 oscilan; el resto del montaje 10-20 se queda quieto.",
    "El Decoder analiza la señal.",
    "El patrón se convierte en un comando.",
  ],
  LEFT_HAND: [
    "Se simula intención de mover la mano izquierda.",
    "La representación se asocia a la región sensoriomotora derecha.",
    "En el osciloscopio, la onda de C4 oscila con más amplitud.",
    "El Decoder extrae potencia Mu/Beta.",
    "El clasificador heurístico produce un comando.",
  ],
  RIGHT_ARM: [
    "Se simula intención de mover el brazo derecho.",
    "El homúnculo sitúa el brazo más medial que la mano, todavía en hemisferio izquierdo.",
    "En el osciloscopio, C3 y F3 oscilan (sensoriomotor + premotor).",
    "El clasificador distingue mano frente a brazo por la intensidad del ERD.",
    "El comando resultante es mover el brazo derecho.",
  ],
  LEFT_ARM: [
    "Se simula intención de mover el brazo izquierdo.",
    "La representación se asocia al hemisferio derecho (C4).",
    "C4 oscila, pero menos que al imaginar la mano.",
    "El pipeline calcula Mu/Beta.",
    "El comando resultante es mover el brazo izquierdo.",
  ],
  FEET: [
    "Se simula intención de mover los pies o las piernas.",
    "En el osciloscopio, Cz y Pz oscilan; C3/C4 y el resto se quedan quietos.",
    "C3 y C4 permanecen más cerca del baseline.",
    "El pipeline calcula características espectrales.",
    "El comando resultante es mover pies.",
  ],
  TONGUE: [
    "Se simula intención de mover la lengua o la cara.",
    "En el osciloscopio, Fp1, F3, Fz y T3 oscilan (cara / habla). O1 permanece en baseline.",
    "Ningún canal motor destaca tanto como en mano o pies.",
    "El clasificador interpreta un patrón bilateral.",
    "El comando resultante es mover lengua / cara.",
  ],
  REST: [
    "Se simula un estado de reposo.",
    "No hay una desincronización focal marcada.",
    "Mu y Beta se mantienen cerca del baseline.",
    "El Decoder compara contra el umbral motor.",
    "El resultado esperado es reposo.",
  ],
};

function eventLabel(name: EventName): string {
  const match = Object.entries(EVENT_NAMES).find(([, value]) => value === name);
  return match?.[0] ?? name;
}

function statusClass(status: MfeStatus): string {
  if (status === "ONLINE") return styles.online ?? "";
  if (status === "ERROR") return styles.error ?? "";
  return styles.loading ?? "";
}

export default function App() {
  const [mode, setMode] = useState<AppMode>("EXPLORE");
  const [architecture, setArchitecture] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [task, setTask] = useState<MotorTask | null>(null);
  const [events, setEvents] = useState<MonitorEvent[]>([]);
  const [status, setStatus] = useState<Record<MfeId, MfeStatus>>({
    shell: "ONLINE",
    "body-mfe": "LOADING",
    "brain-mfe": "LOADING",
    "signal-mfe": "LOADING",
    "decoder-mfe": "LOADING",
  });

  useEffect(() => {
    markShellHost();
    setTimingScale(import.meta.env.VITE_DEMO_TIMING === "0" ? 0 : 1);
    publish(EVENT_NAMES.MFE_READY, { id: "shell", version: "1.0.0", timestamp: Date.now() });
    publish(EVENT_NAMES.APP_MODE_CHANGED, { mode: "EXPLORE", timestamp: Date.now() });

    const push = (name: EventName, source: string, payload: unknown) => {
      const time = new Date().toLocaleTimeString("es-ES", { hour12: false });
      setEvents((current) =>
        [{ time, name, source, summary: summarizeEvent(name, payload) }, ...current].slice(0, 8),
      );
    };

    const unsubscribers = [
      subscribe(EVENT_NAMES.MFE_READY, (payload) => {
        setStatus((current) => ({ ...current, [payload.id]: "ONLINE" }));
        push(EVENT_NAMES.MFE_READY, payload.id, payload);
      }),
      subscribe(EVENT_NAMES.MFE_ERROR, (payload) => {
        setStatus((current) => ({ ...current, [payload.id]: "ERROR" }));
        push(EVENT_NAMES.MFE_ERROR, payload.id, payload);
      }),
      subscribe(EVENT_NAMES.MOTOR_TASK_SELECTED, (payload) => {
        setTask(payload.task);
        push(EVENT_NAMES.MOTOR_TASK_SELECTED, payload.source, payload);
      }),
      subscribe(EVENT_NAMES.EEG_TRIAL_STARTED, (payload) => push(EVENT_NAMES.EEG_TRIAL_STARTED, "signal-mfe", payload)),
      subscribe(EVENT_NAMES.EEG_WINDOW_READY, (payload) => push(EVENT_NAMES.EEG_WINDOW_READY, "signal-mfe", payload)),
      subscribe(EVENT_NAMES.SIGNAL_FEATURES_EXTRACTED, (payload) =>
        push(EVENT_NAMES.SIGNAL_FEATURES_EXTRACTED, "decoder-mfe", payload),
      ),
      subscribe(EVENT_NAMES.CLASSIFICATION_RESULT, (payload) =>
        push(EVENT_NAMES.CLASSIFICATION_RESULT, "decoder-mfe", payload),
      ),
      subscribe(EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED, (payload) =>
        {
          setTask(payload.actualTask);
          push(EVENT_NAMES.TRIAL_GROUND_TRUTH_REVEALED, "signal-mfe", payload);
        },
      ),
    ];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const explanation = useMemo(() => {
    if (mode === "BCI" && !task) {
      return [
        "Signal elige internamente una clase secreta.",
        "El Decoder solo recibe la ventana EEG, no la etiqueta.",
        "El pipeline calcula Mu/Beta contra el baseline.",
        "El patrón real se revela después de clasificar.",
      ];
    }
    return WHAT[task ?? "REST"];
  }, [mode, task]);

  function changeMode(next: AppMode) {
    setMode(next);
    setTask(null);
    publish(EVENT_NAMES.APP_MODE_CHANGED, { mode: next, timestamp: Date.now() });
  }

  function toggleArchitecture() {
    const enabled = !architecture;
    setArchitecture(enabled);
    publish(EVENT_NAMES.ARCHITECTURE_TOGGLED, { enabled, timestamp: Date.now() });
  }

  function remoteSlot(
    id: Exclude<MfeId, "shell">,
    label: string,
    port: string,
    node: ReactNode,
  ) {
    const meta = MFE_META.find((item) => item.id === id);
    return (
      <section className={`${styles.slot} ${architecture ? styles.slotExposed : ""}`} data-mfe={id}>
        {architecture ? (
          <div className={styles.mfeLabel}>
            <div>{label}</div>
            <div>Remote · v{meta?.version}</div>
            <div>localhost:{port}</div>
            <div className={statusClass(status[id])}>{status[id]}</div>
          </div>
        ) : null}
        {node}
      </section>
    );
  }

  return (
    <div className={styles.app}>
      <header className={styles.header} data-testid="app-header">
        <div className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 36 36" aria-hidden="true">
            <circle cx="18" cy="18" r="16" fill="#1b2531" stroke="#3db8e8" />
            <path d="M10 20c2-8 14-8 16 0" fill="none" stroke="#8b7cf6" strokeWidth="1.6" />
            <circle cx="12" cy="16" r="1.6" fill="#3db8e8" />
            <circle cx="18" cy="12" r="1.6" fill="#7ee0c5" />
            <circle cx="24" cy="16" r="1.6" fill="#6ba4f8" />
          </svg>
          <div>
            <div className={styles.brandName}>
              NeuroMFE<span>Lab</span>
            </div>
            <p className={styles.sub}>Micro Frontends + Brain Computer Interface</p>
          </div>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.seg} role="group" aria-label="Modo de la aplicación">
            <button type="button" aria-pressed={mode === "EXPLORE"} data-testid="mode-explore" onClick={() => changeMode("EXPLORE")}>
              Explorar
            </button>
            <button type="button" aria-pressed={mode === "BCI"} data-testid="mode-bci" onClick={() => changeMode("BCI")}>
              BCI
            </button>
          </div>
          {mode === "BCI" ? (
            <button
              type="button"
              className={styles.iconBtn}
              data-testid="new-bci-trial"
              onClick={() => publish(EVENT_NAMES.NEW_BCI_TRIAL_REQUESTED, { timestamp: Date.now() })}
            >
              Nueva prueba BCI
            </button>
          ) : null}
          <button
            type="button"
            className={styles.iconBtn}
            aria-pressed={architecture}
            data-testid="toggle-architecture"
            onClick={toggleArchitecture}
          >
            <Layers size={16} /> Arquitectura
          </button>
          <button type="button" className={styles.iconBtn} onClick={() => setHelpOpen(true)}>
            <HelpCircle size={16} /> Ayuda
          </button>
          <span className={styles.badge}>
            <span className={styles.dot} /> SIMULACIÓN
          </span>
        </div>
      </header>

      <div className={styles.workspace}>
        <div className={styles.bodyColumn}>
          {remoteSlot(
            "body-mfe",
            "BODY MFE",
            "3001",
            <RemoteErrorBoundary
              name="Body MFE"
              onError={() => publish(EVENT_NAMES.MFE_ERROR, { id: "body-mfe", message: "load failed", timestamp: Date.now() })}
            >
              <Suspense fallback={<RemoteSkeleton label="Body MFE" />}>
                <BodyApp />
              </Suspense>
            </RemoteErrorBoundary>,
          )}
        </div>
        <div className={styles.topRight}>
          {remoteSlot(
            "brain-mfe",
            "BRAIN MFE",
            "3002",
            <RemoteErrorBoundary
              name="Brain MFE"
              onError={() => publish(EVENT_NAMES.MFE_ERROR, { id: "brain-mfe", message: "load failed", timestamp: Date.now() })}
            >
              <Suspense fallback={<RemoteSkeleton label="Brain MFE" />}>
                <BrainApp />
              </Suspense>
            </RemoteErrorBoundary>,
          )}
          {remoteSlot(
            "signal-mfe",
            "SIGNAL MFE",
            "3003",
            <RemoteErrorBoundary
              name="Signal MFE"
              onError={() => publish(EVENT_NAMES.MFE_ERROR, { id: "signal-mfe", message: "load failed", timestamp: Date.now() })}
            >
              <Suspense fallback={<RemoteSkeleton label="Signal MFE" />}>
                <SignalApp />
              </Suspense>
            </RemoteErrorBoundary>,
          )}
        </div>
        <div className={styles.bottomRight}>
          {remoteSlot(
            "decoder-mfe",
            "DECODER MFE",
            "3004",
            <RemoteErrorBoundary
              name="Decoder MFE"
              onError={() => publish(EVENT_NAMES.MFE_ERROR, { id: "decoder-mfe", message: "load failed", timestamp: Date.now() })}
            >
              <Suspense fallback={<RemoteSkeleton label="Decoder MFE" />}>
                <DecoderApp />
              </Suspense>
            </RemoteErrorBoundary>,
          )}
          <div className={`${styles.card} ${styles.whatCard}`} data-testid="what-is-happening">
            <h2>¿Qué está pasando?</h2>
            <ol className={styles.steps}>
              {explanation.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            {architecture ? (
              <div className={styles.architecture}>
                <p className={styles.muted}>Body selecciona · Brain visualiza · Signal adquiere · Decoder clasifica.</p>
                <h3>Micro Frontends</h3>
                <div className={styles.statusList} data-testid="architecture-status">
                  {MFE_META.map((item) => (
                    <div key={item.id}>
                      {item.label} · <span className={statusClass(status[item.id])}>{status[item.id]}</span>
                    </div>
                  ))}
                </div>
                <h3>Communication · Domain Events</h3>
                <div className={styles.events} data-testid="event-monitor">
                  {events.map((event, index) => (
                    <div key={`${event.time}-${event.name}-${index}`}>
                      {event.time} {eventLabel(event.name)} {event.summary}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>NeuroMFE Lab es una simulación educativa. Las señales mostradas son sintéticas y no corresponden a mediciones clínicas ni permiten realizar diagnósticos.</span>
        <span>
          <Activity size={12} /> No es un dispositivo médico
        </span>
      </footer>

      {helpOpen ? (
        <div className={styles.overlay} role="dialog" aria-labelledby="help-title">
          <div className={styles.dialog}>
            <h2 id="help-title">Ayuda</h2>
            <p>
              NeuroMFE Lab demuestra Micro Frontends reales y una BCI educativa con EEG sintético. No lee pensamientos y no diagnostica.
            </p>
            <p>
              En Explorar, elige una parte del cuerpo. En BCI, inicia una prueba ciega: el Decoder solo ve la señal, no la clase secreta.
            </p>
            <button type="button" className={styles.iconBtn} onClick={() => setHelpOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
