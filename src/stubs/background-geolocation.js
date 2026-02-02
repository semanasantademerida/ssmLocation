// Stub dinámico para @capacitor-community/background-geolocation
// Durante el BUILD de Vite: Este archivo se usa para evitar errores de resolución
// Durante RUNTIME: Carga el plugin nativo real desde Capacitor

// Intentar cargar el plugin nativo real
let nativePlugin = null;

try {
    // En runtime, Capacitor habrá registrado el plugin nativo
    if (typeof window !== 'undefined' && window.Capacitor && window.Capacitor.Plugins) {
        nativePlugin = window.Capacitor.Plugins.BackgroundGeolocation;
    }
} catch (e) {
    console.warn('No se pudo cargar el plugin nativo de BackgroundGeolocation:', e);
}

// Si no hay plugin nativo (solo durante build), usar stub
export const BackgroundGeolocation = nativePlugin || {
    addWatcher: () => {
        console.warn('⚠️ USANDO STUB - El plugin nativo no está disponible');
        return Promise.resolve('stub');
    },
    removeWatcher: () => Promise.resolve(),
    requestPermissions: () => Promise.resolve()
};
