/**
 * SSM LOCATION - UTILIDADES DE DISTANCIA
 * 
 * Este módulo contiene funciones matemáticas para calcular distancias 
 * geodésicas (sobre la superficie terrestre) entre dos pares de coordenadas.
 */

/**
 * Calcula la distancia en metros entre dos puntos usando la fórmula de Haversine.
 * 
 * @param {number} lat1 - Latitud del punto origen
 * @param {number} lon1 - Longitud del punto origen
 * @param {number} lat2 - Latitud del punto destino
 * @param {number} lon2 - Longitud del punto destino
 * @returns {number} Distancia en metros
 */
export const calcularDistanciaMetros = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;

    const R = 6371e3; // Radio de la Tierra en metros
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
};
