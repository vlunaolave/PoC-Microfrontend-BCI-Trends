# Guion de demostración — NeuroMFE Lab

Duración orientativa: 8–12 minutos.

## 1. Aplicación integrada

Abrir http://localhost:3000. Frase: *“Lo que vemos parece un único laboratorio. Eso es deliberado.”*

## 2. Una sola aplicación

Recorrer silueta, cerebro, osciloscopio y decoder. Recordar el badge **SIMULACIÓN**.

## 3. Architecture Mode

Activar **Arquitectura**. Frase: *“Los bordes no son un layout: son aplicaciones distintas.”*

## 4. Cuatro Micro Frontends

Señalar Body, Brain, Signal, Decoder, versiones y estados ONLINE.

## 5. URLs distintas

http://localhost:3001 a 3004. Abrir Body standalone. Frase: *“Cada remote se puede desplegar y ejecutar solo.”*

## 6. Mano derecha

Volver al Shell, modo Explorar, pulsar **Mano derecha**.

## 7. Cadena Body → Brain → EEG → Decoder

Mano iluminada, hemisferio izquierdo, C3, osciloscopio, pipeline, “Mover mano derecha”.

## 8. Mano izquierda

Mostrar el cambio hacia C4.

## 9. Cambio en C4

Tabla de bandas: ERD mayor en C4.

## 10. Pies

Resaltar Cz / zona medial.

## 11. Cz

Frase: *“La diferenciación educativa usa tres canales, no un mapa clínico.”*

## 12. Modo BCI

Cambiar a BCI. El cuerpo deja de elegir la clase.

## 13. Prueba ciega

**Nueva prueba BCI**. Frase: *“Signal elige una clase y no se la cuenta al Decoder.”*

## 14. Señal

Osciloscopio RAW/FILTERED.

## 15. Procesamiento

Etapas ✓ del pipeline.

## 16. Clasificación

Comando y confianza de la simulación.

## 17. Ground truth

Solo ahora aparece el patrón real y CORRECTA / NO COINCIDE.

## 18. Fuente intercambiable

Panel: EEG simulado activo; dataset y hardware “Próximamente”. `EEGSource` admite otra implementación.

## 19. Tolerancia a fallos

1. `pnpm dev` completo y Architecture Mode ON.
2. Detener el proceso de `brain-mfe` (puerto 3002).
3. Recargar http://localhost:3000.
4. El Shell sigue.
5. Brain muestra fallback: *Brain MFE no disponible*.
6. Body, Signal y Decoder permanecen.

Nota: Module Federation cachea el módulo en la sesión. El fallback se ve al recargar con el remote caído. Reintentar tras volver a levantar el remote puede requerir recarga.

## 20. Cierre

Repetir el disclaimer. Frase: *“Arquitectura real de Micro Frontends; BCI educativa, no clínica.”*
