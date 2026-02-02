# Changelog (Historial de Cambios)

Todos los cambios notables en este proyecto serán documentados en este archivo.

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
