# ADR-001 — Usar Micro Frontends con Module Federation

## Contexto

Hay que demostrar, en una exposición universitaria, que una UI unitaria puede estar hecha de aplicaciones independientes desplegables.

## Decisión

Usar pnpm workspaces + Vite + `@module-federation/vite`. Shell host; Body, Brain, Signal y Decoder remotes.

## Alternativas

- Monolito React con carpetas: más simple, no demuestra aislamiento ni deploy independiente.
- iframes: aislamiento fuerte, peor UX, peor composición y comunicación.
- Web Components sin federation: posible, peor encaje con React y shared runtime.

## Consecuencias positivas

Remotes reales, URLs distintas, fallbacks parciales, React singleton.

## Consecuencias negativas

Tooling más frágil, HMR limitado entre host y remotes, contratos de eventos versionables.
