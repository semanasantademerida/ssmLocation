/**
 * SSM LOCATION - SERVICIO DE MAPA
 * 
 * Este servicio encapsula toda la interacción con la librería Leaflet para mostrar
 * el mapa visual en la aplicación.
 * 
 * @author Rubén D. Mancera Morán
 * @version 2.25
 */

/**
 * Inicializa el mapa de Leaflet en un elemento del DOM.
 * 
 * @param {HTMLElement} contenedor - La referencia al div donde se dibujará el mapa.
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Object|null} Objeto con la instancia del mapa y el marcador, o null si falla.
 */
export const inicializarMapa = (contenedor, latitude, longitude) => {
    if (!window.L || !contenedor) return null;

    try {
        // Creamos la instancia del mapa apuntando al centro inicial
        const map = window.L.map(contenedor, {
            zoomControl: false, // Quitamos botones +/- para un diseño más limpio
            attributionControl: false // Quitamos texto de créditos para ahorrar espacio en móvil
        }).setView([latitude, longitude], 17);

        // Añadimos la capa de azulejos (Tiles) de OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // Creamos un icono personalizado para el marcador (usando el color corporativo rojo)
        const iconoPersonalizado = window.L.divIcon({
            className: 'custom-div-icon',
            html: `
                <div style="background-color: #dc2626; width: 14px; height: 14px; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(220, 38, 38, 0.5);"></div>
                <div style="background-color: #dc2626; width: 14px; height: 14px; border-radius: 50%; position: absolute; top:0; left:0; animation: pulse-icon 2s infinite;"></div>
            `,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        // Colocamos el marcador en la posición actual
        const marcador = window.L.marker([latitude, longitude], { icon: iconoPersonalizado }).addTo(map);

        return { map, marcador };
    } catch (error) {
        console.error('Error inicializando Leaflet:', error);
        return null;
    }
};

/**
 * Actualiza la posición de la cámara y del marcador en el mapa existente.
 * 
 * @param {Object} mapInstance - Instancia de Leaflet Map
 * @param {Object} markerInstance - Instancia de Leaflet Marker
 * @param {number} latitude 
 * @param {number} longitude 
 */
export const actualizarMarcadorMapa = (mapInstance, markerInstance, latitude, longitude) => {
    if (!mapInstance || !markerInstance) return;

    try {
        const nuevaPos = [latitude, longitude];
        markerInstance.setLatLng(nuevaPos);
        mapInstance.panTo(nuevaPos, { animate: true, duration: 1.0 });
    } catch (error) {
        console.warn('No se pudo actualizar el marcador del mapa visual.');
    }
};
