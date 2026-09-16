# Simulación BCI — NeuroMFE Lab

## BCI

Una Brain Computer Interface traduce actividad cerebral medida en comandos. Esta PoC **simula** ese flujo con EEG sintético. No registra cerebro real.

## EEG

El electroencefalograma mide potenciales eléctricos en el cuero cabelludo. Aquí se sintetizan tres canales educativos.

## C3, Cz y C4

Posiciones aproximadas del sistema 10-20 sobre la corteza sensoriomotora:

- C3 ≈ hemisferio izquierdo (mano derecha).
- Cz ≈ línea media (pies).
- C4 ≈ hemisferio derecho (mano izquierda).

No son estructuras anatómicas internas.

## Motor imagery

Imaginar un movimiento puede modular ritmos sensoriomotores. La PoC usa esa idea de forma esquemática.

## Mu y Beta

- Mu: ~8–13 Hz.
- Beta: ~13–30 Hz.

Frecuentemente estudiados en tareas motoras. Los valores de la UI salen de la FFT de la ventana simulada.

## ERD

Event Related Desynchronization: reducción de potencia en esas bandas durante (o al imaginar) movimiento. Se simula bajando las amplitudes Mu/Beta del canal asociado.

## Baseline

Al arrancar se genera una ventana de reposo. El Decoder calcula potencias base. Recalibrar sustituye ese baseline. No hay constantes mágicas de potencia en el clasificador.

## FFT y band power

Tras quitar DC y filtrar 8–30 Hz, una FFT de 512 puntos (500 muestras + padding) estima potencia por banda.

## Feature extraction

Para cada canal: `muPower`, `betaPower`, `muSuppression` y `betaSuppression` respecto al baseline.

```
suppression = 1 - currentPower / baselinePower
```

## Clasificador

Heurístico, no IA ni ML: el canal con mayor supresión combinada gana si supera un umbral; si no, REST. La confianza sale del margen entre el primer y el segundo score, limitada visualmente entre 50 % y 98 %.

## Simulación vs BCI real

| PoC | BCI real |
| --- | --- |
| Senos + ruido | Señal biológica ruidosa y no estacionaria |
| 3 canales | Montajes densos, artefactos, EEG de calidad variable |
| 4 clases fijas | Calibración por sujeto, modelos estadísticos o ML |
| 2 segundos fijos | Ventanas, umbrales y feedback adaptativos |
| Clasificador heurístico | Entrenamiento y validación rigurosos |

Una BCI real tampoco debería recibir la etiqueta correcta en el mismo canal que la señal. El modo BCI de esta PoC ilustra esa separación.
