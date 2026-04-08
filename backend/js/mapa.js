/* ==========================================================================
   MAPA SSM - Lógica del mapa interactivo
   Página de seguimiento en directo de la Semana Santa de Mérida
   ========================================================================== */

$(document).ready(function () {

    // =========================================================================
    // CONFIGURACIÓN
    // =========================================================================

    // Intervalo de refresco del mapa en milisegundos.
    // Cambiar este valor aquí afecta a todo el comportamiento de refresco.
    var INTERVALO_REFRESCO_MS = 3000; // 3 segundos

    // =========================================================================
    // FUNCIONES AUXILIARES
    // =========================================================================

    /**
     * escaparHTML(): convierte caracteres especiales en entidades HTML
     * para evitar ataques XSS al insertar datos del servidor en el DOM.
     * @param {string} str - Cadena a escapar
     * @returns {string} - Cadena con caracteres especiales convertidos
     */
    function escaparHTML(str) {
        var entidades = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return String(str).replace(/[&<>"']/g, function (c) {
            return entidades[c];
        });
    }

    // =========================================================================
    // CONFIGURACIÓN DEL MAPA
    // =========================================================================

    var mapOptions = {};

    // Fullscreen solo si el navegador lo soporta (no disponible en iOS Safari)
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
        mapOptions.fullscreenControl = true;
        mapOptions.fullscreenControlOptions = {
            title: "Pantalla completa",
            titleCancel: "Salir Pantalla completa"
        };
    }

    // Mapa centrado en Mérida con zoom 13
    var map = L.map('map', mapOptions).setView([38.9163169, -6.3463233], 13);

    // Capa de teselas de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Control de escala
    L.control.scale().addTo(map);

    // Icono personalizado para los marcadores de hermandades
    var LeafIcon = L.Icon.extend({
        options: {
            iconSize: [50, 59],    // Ancho y alto del icono en píxeles
            iconAnchor: [25, 58],  // Punto del icono que coincide con la coordenada
            popupAnchor: [-1, -60] // Desplazamiento del popup respecto al icono
        }
    });

    // Capa dedicada a marcadores (permite limpiarlos sin afectar al mapa)
    var capaMarcadores = L.layerGroup().addTo(map);

    // =========================================================================
    // FUNCIÓN PRINCIPAL: PINTAR MARCADORES
    // =========================================================================

    /**
     * pintarMapa(): consulta al servidor las hermandades activas
     * y coloca un marcador en el mapa por cada una.
     * Se llama una vez al cargar y luego cada INTERVALO_REFRESCO_MS ms.
     */
    function pintarMapa() {
        // clearLayers() limpia SOLO los marcadores de nuestra capa,
        // sin afectar a controles u otros elementos del mapa.
        capaMarcadores.clearLayers();

        $.ajax({
            type: 'POST',
            url: 'consulta_hermandades_activas.php',
            dataType: "json",
            success: function (data) {
                data.forEach(function (item) {
                    var icono = 'img_Marcadores/' + item.icono;
                    var myIcon = new LeafIcon({ iconUrl: icono });

                    L.marker([item.lat, item.lng], { icon: myIcon })
                        .bindPopup('<b>' + escaparHTML(item.nombre_coloquial) + '</b><br>' + escaparHTML(item.address))
                        .addTo(capaMarcadores);
                });
            },
            error: function (xhr, status, err) {
                console.error('[SSM Mapa] Error al obtener posiciones:', status, err);
            }
        });
    }

    // =========================================================================
    // ARRANQUE
    // =========================================================================

    // Primera carga y refresco automático
    pintarMapa();
    setInterval(pintarMapa, INTERVALO_REFRESCO_MS);
});
