# SSM Location - Seguimiento en Tiempo Real

Aplicación móvil híbrida desarrollada con **React**, **Capacitor** y **Vite** para el seguimiento GPS en tiempo real de las Hermandades de la **Semana Santa de Mérida**.

## 🚀 Características Principales

- **Tracking en Segundo Plano**: Utiliza procesos nativos de Android para seguir enviando la ubicación incluso con la pantalla bloqueada o la app minimizada.
- **Geococing Inverso**: Convierte coordenadas GPS en direcciones legibles (Calles/Números) en tiempo real.
- **Interfaz Premium**: Diseño moderno optimizado para su uso en exteriores.
- **Bajo Consumo**: Optimizado para minimizar el impacto en la batería del dispositivo.

## 🛠️ Tecnologías

- **Frontend**: React.js + Vite.
- **Nativo**: Capacitor.js (Android).
- **Plugins Críticos**:
  - `@capacitor-community/background-geolocation`: Motor del servicio en segundo plano.
  - `@capacitor/geolocation`: Posicionamiento estándar.
  - `@capacitor/core`: Comunicación nativa.

## 📦 Instalación y Desarrollo

Para trabajar en este proyecto localmente:

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo (Web)**:
   ```bash
   npm run dev
   ```

3. **Compilar para Android**:
   ```bash
   npm run build
   # Sincronizar con la carpeta nativa
   npx cap sync android
   # Abrir en Android Studio
   npx cap open android
   ```

## 📋 Requisitos de Dispositivo (Android)

Para que el seguimiento en segundo plano funcione correctamente, el usuario debe:
1. Otorgar permiso de ubicación **"Permitir todo el tiempo"**.
2. Desactivar la **Optimización de Batería** para esta aplicación.

---
## ⚖️ Licencia

Este proyecto está bajo la licencia **Creative Commons Atribución-CompartirIgual (CC BY-SA)**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

© 2026 - Propiedad de la Junta de Cofradías de Mérida.  
Desarrollado por Rubén D. Mancera Morán.
