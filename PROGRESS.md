# NeuroMFE Lab — Progress

## Current phase

Completado. PoC funcional verificada.

## Completed

- [x] Workspace pnpm + TypeScript strict + ESLint
- [x] Contracts, event bus, design tokens, DSP
- [x] Shell + Body + Brain + Signal + Decoder
- [x] Module Federation real (`remoteEntry.js`)
- [x] Modo Explorar y modo BCI ciego
- [x] Architecture Mode + Event Monitor + Error Boundaries
- [x] Tests unitarios y E2E Playwright
- [x] Documentación (README, ARCHITECTURE, BCI, DEMO, DEPLOYMENT, ADRs)

## Validation

Typecheck: OK
Lint: OK
Unit tests: OK (7)
Build: OK (5 apps, cada remote genera `remoteEntry.js`)
E2E: OK (6/6)

## Known issues

- El plugin DTS de Module Federation puede emitir un `EPIPE` ruidoso en el build del Shell; se desactivó `dts` y el bundle se genera igual.
- HMR entre host y remotes es limitado (limitación conocida de MF + Vite); recargar el Shell si un remote se detiene o se actualiza de forma agresiva.
- Vista 3D omitida a propósito: SVG estable.

## Next exact action

Ninguna para el MVP. Para exposición: `pnpm install && pnpm dev` y seguir `docs/DEMO-SCRIPT.md`.
