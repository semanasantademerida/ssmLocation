/**
 * SSM LOCATION - UTILIDADES DE DISPOSITIVO
 * 
 * Funciones relacionadas con la identificación y estado del hardware del móvil.
 * 
 * @author Rubén D. Mancera Morán
 * @version 2.25
 */

/**
 * Genera o recupera un ID de dispositivo único para esta instalación.
 * Se guarda en localStorage para que sea persistente aunque se cierre la app.
 * 
 * @returns {string} El ID del dispositivo (ej: 'DEV_A1B2C3')
 */
export const obtenerIdDispositivo = () => {
    let id = localStorage.getItem('ssm_device_id');
    if (!id) {
        // Generamos un ID aleatorio corto pero único para este uso
        id = 'DEV_' + Math.random().toString(36).substring(2, 8).toUpperCase();
        localStorage.setItem('ssm_device_id', id);
    }
    return id;
};
