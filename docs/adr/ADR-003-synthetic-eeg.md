# ADR-003 — Utilizar EEG sintético para la PoC

## Contexto

Una BCI real exige hardware, consentimiento, ruido y modelos por sujeto. La demo debe ejecutarse offline tras instalar dependencias.

## Decisión

Implementar `SyntheticEEGSource` (250 Hz, ERD educativo). Dejar `DatasetEEGSource` y `HardwareEEGSource` como stubs no operativos.

## Alternativas

- Dataset público: más realismo, peor control de la demo y licencias.
- OpenBCI / WebUSB: frágil en exposición, permisos, no offline.
- Números aleatorios en la UI: inválido pedagógicamente.

## Consecuencias positivas

Reproducible, testeable con seed, honesto (“SIMULACIÓN”), sustituible vía `EEGSource`.

## Consecuencias negativas

No se pueden extraer conclusiones clínicas. El clasificador heurístico está afinado al generador.
