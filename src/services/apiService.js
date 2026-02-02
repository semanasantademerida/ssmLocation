/**
 * SSM LOCATION - SERVICIO DE API
 * 
 * Este servicio maneja toda la comunicación externa de la aplicación:
 * 1. Envío de coordenadas al servidor PHP de la Semana Santa de Mérida.
 * 2. Conversión de coordenadas GPS a direcciones legibles (Reverse Geocoding).
 * 
 * Utiliza CapacitorHttp para asegurar que las peticiones se realicen a nivel 
 * nativo, evitando problemas de CORS y bloqueos en segundo plano.
 * 
 * @author Rubén D. Mancera Morán
 * @version 2.25
 */

import { CapacitorHttp } from '@capacitor/core';
import { Device } from '@capacitor/device'; // v2.33: Telemetría de batería
import { obtenerIdDispositivo } from '../utils/deviceUtils';

// Variables de entorno (definidas en .env)
const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

/**
 * Recibe latitud/longitud y devuelve un String con la dirección (Calle y número).
 * Utiliza el servicio Nominatim de OpenStreetMap.
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<string>} Dirección formateada o 'Ubicación desconocida'
 */
export const obtenerDireccionDesdeCoordenadas = async (latitude, longitude) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

        const respuesta = await CapacitorHttp.get({
            url: url,
            headers: {
                'Accept-Language': 'es',
                'User-Agent': 'SSM Location App v2.27'
            }
        });

        if (respuesta.data) {
            if (respuesta.data.address) {
                const a = respuesta.data.address;
                const calle = a.road || a.pedestrian || a.suburb || a.city || '';
                const numero = a.house_number ? `, ${a.house_number}` : '';
                if (calle) return `${calle}${numero}`;
            }
            return respuesta.data.display_name || 'Ubicación detectada';
        }
        return 'Dirección no encontrada';
    } catch (error) {
        console.error('Error en Reverse Geocoding:', error);
        return 'Error al obtener dirección';
    }
};

/**
 * Transmite la ubicación actual al servidor oficial.
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {string} hermandadCodigo - Código identificador de la hermandad (ej: 'cena')
 * @param {string} direccion - Texto legible de la calle actual
 * @returns {Promise<Object>} Resultado de la operación para el historial de logs
 */
export const enviarUbicacionAlServidor = async (latitude, longitude, hermandadCodigo, direccion) => {
    const dispositivoId = obtenerIdDispositivo();
    const ahora = new Date().toLocaleTimeString();

    // v2.33: Obtener nivel de batería antes de enviar
    let bateriaNivel = 0;
    try {
        const info = await Device.getBatteryInfo();
        // info.batteryLevel devuelve de 0 a 1. Lo pasamos a porcentaje entero (ej: 95)
        bateriaNivel = Math.round((info.batteryLevel || 0) * 100);
    } catch (e) {
        console.warn('Error leyendo batería:', e);
    }

    try {
        const payload = {
            key: API_KEY,
            device_id: dispositivoId,
            hermandad: hermandadCodigo,
            latitude: latitude,
            longitude: longitude,
            address: direccion,
            bateria: bateriaNivel // Nuevo campo v2.33
        };

        const opciones = {
            url: API_URL,
            headers: { 'Content-Type': 'application/json' },
            data: payload
        };

        const respuesta = await CapacitorHttp.post(opciones);

        if (respuesta.status >= 200 && respuesta.status < 300) {
            return {
                exito: true,
                status: `${respuesta.status} OK`,
                sql: JSON.stringify(payload),
                time: ahora
            };
        } else {
            throw new Error(`Error ${respuesta.status}`);
        }
    } catch (error) {
        console.error('Error enviando a servidor:', error);
        return {
            exito: false,
            status: error.message.includes('Error') ? error.message : 'Fallo Red',
            sql: error.message || 'Error de conexión',
            time: ahora
        };
    }
};
