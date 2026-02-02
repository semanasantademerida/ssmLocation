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
            headers: { 'Accept-Language': 'es' }
        });

        if (respuesta.data && respuesta.data.address) {
            const a = respuesta.data.address;
            const calle = a.road || a.pedestrian || a.suburb || '';
            const numero = a.house_number ? `, ${a.house_number}` : '';
            return calle ? `${calle}${numero}` : 'Sin nombre de calle';
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

    try {
        const payload = {
            id_dispositivo: dispositivoId,
            latitud: latitude,
            longitud: longitude,
            hermandad: hermandadCodigo,
            direccion: direccion,
            api_key: API_KEY
        };

        const opciones = {
            url: API_URL,
            headers: { 'Content-Type': 'application/json' },
            data: payload
        };

        const respuesta = await CapacitorHttp.post(opciones);

        if (respuesta.status === 200) {
            return {
                exito: true,
                mensaje: '✓ Envío exitoso',
                sql: `UPDATE ubicacion SET lat=${latitude.toFixed(5)}, lon=${longitude.toFixed(5)} WHERE id='${hermandadCodigo}'`,
                hora: ahora
            };
        } else {
            throw new Error(`Servidor respondió con código ${respuesta.status}`);
        }
    } catch (error) {
        console.error('Error enviando a servidor:', error);
        return {
            exito: false,
            mensaje: `❌ Error: ${error.message}`,
            sql: 'Fallo de conexión o API Key inválida',
            hora: ahora
        };
    }
};
