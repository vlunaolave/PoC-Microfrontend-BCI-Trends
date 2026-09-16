# ADR-002 — Comunicación desacoplada mediante eventos

## Contexto

Los remotes no pueden importarse entre sí ni compartir estado React. Aun así deben coordinar una demo de ~2–3 segundos.

## Decisión

Event bus tipado sobre `CustomEvent` en `window`, contratos en `packages/contracts`. El Decoder no recibe `MotorTask` en la ventana EEG.

## Alternativas

- Store global (Redux/Zustand): acopla los MFEs y contradice el aislamiento.
- Props del Shell: convierte al host en orquestador de negocio.
- postMessage/iframes: innecesario sin iframes.

## Consecuencias positivas

Desacoplo, tipos compartidos, funciona aunque cada remote empaquete `contracts`.

## Consecuencias negativas

Eventos implícitos más difíciles de seguir; hay que documentar el mapa. Listeners deben limpiarse al desmontar.
