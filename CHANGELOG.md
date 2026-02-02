## [2.33] - 2026-02-02
### Nuevas Funcionalidades
- **Telemetría de Batería**: Integración con `@capacitor/device` para enviar el porcentaje de batería en cada actualización de ubicación.
- **Backend Actualizado**: Adaptado script `recibir_json.php` y esquema SQL para almacenar el nuevo dato.
- **Documentación**: Añadida guía de actualización de servidor `SERVER_UPDATE_v2.33.md`.

## [2.32] - 2026-02-02
### Estabilidad y Caso Borde
- **Auto-Reconexión Robusta**: Corregido fallo donde la app no reanudaba el envío tras un reinicio forzado.
- **Persistencia de Estado**: Implementado mecanismo de lectura directa de `localStorage` para recuperar la hermandad activa antes de que React hidrate el estado.
- **Sincronización v2.32**: Versión unificada en código, UI y nativo.

## [2.31] - 2026-02-02
### Usabilidad y Feedback Visual
- **Feedback de Copiado**: Implementado estado de éxito interactivo en el botón de copiar. Cambia a "¡Copiado!" durante 2 segundos con efecto de escala.
- **Mejora de Consola**: Refinado el contraste y la interactividad de la terminal técnica.
- **Sincronización Nativa**: Actualizada la versión v2.31 en todos los manifiestos de Android.

## [2.30] - 2026-02-02
### Experiencia de Usuario y Pulido Visual
- **Cronómetro Fluido**: Implementado temporizador independiente del GPS para una cuenta atrás segundo a segundo constante.
- **Versión Dinámica**: La pantalla de bienvenida ahora muestra la versión real de la aplicación de forma automatizada.
- **Identidad Nativa**: Actualizado el mensaje de notificación persistente de Android con la versión correcta.
- **Sincronización**: Alineación de versiones nativas (Gradle) y lógicas (JS) para coherencia en el análisis de seguridad.

## [2.29] - 2026-02-02
### Optimización Extrema de Batería (Throttling)
- **Regulación de GPS**: Implementado un sistema de despertador cada 20 segundos para reducir la carga del procesador.
- **Reducción de Latidos**: El motor nativo ahora solo procesa datos significativos cada 20s, manteniendo la precisión de 15m/60s.
- **Limpieza de Logs**: Reducción del 90% del ruido en la consola de diagnóstico para un mantenimiento más sencillo.
- **Estabilidad**: Corregida redundancia en las llamadas al sensor cuando el dispositivo está en movimiento lento.

## [2.28] - 2026-02-02
### Seguimiento Híbrido (Mejora de Precisión)
- **Motor de Decisión**: Implementada lógica de envío dual (60 segundos **o** 15 metros).
- **Cálculo Geodésico**: Integración de la Fórmula de Haversine (`distanceUtils.js`) para precisión métrica.
- **Optimización de Batería**: El sistema ignora oscilaciones menores de 15m para evitar transmisiones espurias.
- **Feedback Técnico**: Logs detallados que indican el motivo del envío ("Tiempo" vs "Movimiento").

## [2.27] - 2026-02-02
### Sincronización y Diagnóstico
- **Versión Nativa**: Actualizado `build.gradle` para reflejar la versión correcta en el análisis de seguridad de Android.
- **Geocoding Fix**: Restaurado `User-Agent` obligatorio para la API de Nominatim. Soluciona el error "Dirección no encontrada".
- **Logs Técnicos**: Incrementada la verbosidad en la consola. Ahora muestra latidos de "GPS Nativo" y estados HTTP detallados (ej: `200 OK`).
- **Resiliencia**: Implementado fallback a `display_name` si la dirección estructurada no está disponible.

## [2.25b] - 2026-02-02
### Refactorización y Branding
- **Arquitectura Modular**: División de `App.jsx` en componentes y servicios especializados (`src/components`, `src/services`, `src/utils`).
- **Documentación Total**: Cada archivo nuevo incluye una cabecera detallada en español explicando su función.
- **Identidad Visual**: Integración definitiva del logotipo `appLogo.png`. Sin sombras redundantes.
- **Optimización de Assets**: Logo movido a carpeta `public` para corrección de carga en APK.
- **Seguridad**: Implementación de `.env` y limpieza de historial de Git (credenciales protegidas).
- **Consolidación Estética**: Animaciones de entrada y diseño premium unificado.

## [2.24] - 2026-01-29
### Cambios
- Refactorización completa del código: nombres de variables y comentarios traducidos al castellano para mejor mantenimiento.
- Mejoras en la persistencia del tracking tras reinicio de la aplicación.
- Implementación de logs de diagnóstico para el seguimiento en segundo plano.

## [2.14] - Versión estable previa
- Implementación inicial del motor de Background Geolocation.
- Soporte para múltiples hermandades.
