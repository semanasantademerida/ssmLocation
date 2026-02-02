/**
 * SSM LOCATION - CONSTANTES GLOBALES
 * 
 * Este archivo contiene todas las configuraciones estáticas de la aplicación.
 * Centralizar aquí estos datos permite cambiar el comportamiento de la app 
 * sin tener que buscar entre el código lógico.
 */

export const VERSION_APP = '2.33';

// Intervalos de tiempo
export const INTERVALO_ENVIO_MS = 60000; // 60 segundos entre envíos a servidor
export const INTERVALO_CHEQUEO_GPS_MS = 20000; // 20 segundos entre comprobaciones (v2.29)
export const INTERVALO_CONTEO_MS = 1000;  // 1 segundo para la actualización visual
export const UMBRAL_DISTANCIA_METROS = 15; // 15 metros para disparo por movimiento

// Lista oficial de Hermandades de la Semana Santa de Mérida
export const HERMANDADES = [
    { nombre: 'Las Lágrimas', codigo: 'lagrimas' },
    { nombre: 'Sagrada Cena', codigo: 'sagradacena' },
    { nombre: 'Tres Caídas', codigo: 'trescaidas' },
    { nombre: 'Veracruz', codigo: 'veracruz' },
    { nombre: 'La Paz', codigo: 'paz' },
    { nombre: 'Infantil', codigo: 'infantiles' },
    { nombre: 'Nazareno', codigo: 'castillos' },
    { nombre: 'Calvario', codigo: 'calvario' },
    { nombre: 'Ferroviarios', codigo: 'ferroviarios' },
    { nombre: 'Santa Eulalia', codigo: 'santaeulalia' },
    { nombre: 'Cabalgata', codigo: 'cabalgata' },
    { nombre: 'Junta Cofradías', codigo: 'juntacofradias' },
    { nombre: 'Otros', codigo: 'otros' }
];
