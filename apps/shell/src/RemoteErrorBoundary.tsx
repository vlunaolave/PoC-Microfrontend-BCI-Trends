import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./app.module.css";

interface Props {
  name: string;
  children: ReactNode;
  onError?: () => void;
}

interface State {
  hasError: boolean;
  retry: number;
}

export class RemoteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, retry: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`[NeuroMFE] ${this.props.name} no pudo cargarse`, error, info.componentStack);
    this.props.onError?.();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className={styles.fallback} data-testid={`fallback-${this.props.name}`}>
          <div>
            <strong>{this.props.name}</strong>
            <p>Estado: No disponible</p>
            <p>El resto de NeuroMFE Lab continúa funcionando.</p>
            <button
              type="button"
              onClick={() => this.setState((current) => ({ hasError: false, retry: current.retry + 1 }))}
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }
    return <div key={this.state.retry}>{this.props.children}</div>;
  }
}

export function RemoteSkeleton({ label }: { label: string }) {
  return (
    <div className={styles.skeleton} role="status" aria-label={`Cargando ${label}`}>
      <span className={styles.fallback}>{`Cargando ${label}...`}</span>
    </div>
  );
}
