<?php
session_start();
require_once('config.php');

// Procesamiento de Login
if (isset($_POST['login_pass'])) {
    if ($_POST['login_pass'] === $PANEL_PASSWORD) {
        $_SESSION['logged_in'] = true;
    } else {
        $error_login = "Contraseña incorrecta";
    }
}

// Cierre de Sesión
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: gestionmapa.php");
    exit();
}

// Bloqueo si no hay sesión
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SSM Location Dashboard</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #e2e8f0; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .login-box { background: white; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); width: 100%; max-width: 320px; text-align: center; }
        .logo-c { width: 50px; height: 50px; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; color: white; margin-bottom: 20px; }
        h2 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 5px 0; }
        p { color: #64748b; font-size: 0.85rem; margin-bottom: 25px; }
        input { width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #e2e8f0; border-radius: 8px; box-sizing: border-box; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        input:focus { border-color: #6366f1; }
        button { width: 100%; padding: 12px; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.95rem; transition: background 0.2s; }
        button:hover { background: #4f46e5; }
        .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 15px; font-weight: 500; }
    </style>
</head>
<body>
    <div class="login-box">
        <div class="logo-c">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
            </svg>
        </div>
        <h2>Acceso Restringido</h2>
        <p>Panel de Gestión de Mapa</p>
        <?php if(isset($error_login)) echo "<div class='error'>$error_login</div>"; ?>
        <form method="POST">
            <input type="password" name="login_pass" placeholder="Contraseña secreta" required autofocus>
            <button type="submit">Entrar</button>
        </form>
    </div>
</body>
</html>
<?php
    exit(); // Previene que cargue el resto del dashboard
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <title>SSM Location Dashboard</title>
    <meta charset="utf-8" />
    <!-- Configuración Viewport: Crítica para el comportamiento responsive en móviles -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />

    <!-- ========================================================= -->
    <!-- LIBRERÍAS EXTERNAS -->
    <!-- ========================================================= -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="css/Control.FullScreen.css" />
    <script src="js/Control.FullScreen.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <!-- ========================================================= -->
    <!-- ESTILOS CSS - ESTRUCTURA "SPLIT VIEW" -->
    <!-- ========================================================= -->
    <style>
        /* Variables Globales para consistencia */
        :root {
            --primary: #6366f1;
            /* Azul índigo principal */
            --surface: #ffffff;
            /* Fondo de paneles */
            --bg-body: #f1f5f9;
            /* Fondo general de la página */
            --text-main: #1e293b;
            /* Texto principal */
            --text-secondary: #64748b;
            /* Texto secundario */
            --border: #e2e8f0;
            /* Color de bordes */
            --header-height: 64px;
            /* Altura fija de la cabecera */
        }

        /* 
           LAYOUT GENERAL: FLEXBOX VERTICAL
           La página se divide en:
           1. Header (fijo arriba)
           2. Contenedor Principal (ocupa el resto)
        */
        body,
        html {
            height: 100%;
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background: var(--bg-body);
            display: flex;
            flex-direction: column;
            /* Apila Header sobre Cuerpo */
            overflow: hidden;
            /* Evita el scroll en el body, el scroll va dentro de los paneles */
        }

        /* 
           1. CABECERA SUPERIOR (HEADER)
           Fija en la parte superior, contiene el branding.
           No se superpone al mapa.
        */
        .app-header {
            height: var(--header-height);
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            padding: 0 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            z-index: 2000;
            flex-shrink: 0;
            /* Impide que la cabecera se encoja */
            justify-content: space-between;
        }

        /* Área de Marca (Logo + Texto) */
        .brand-section {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .brand-logo {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .brand-info {
            line-height: 1.2;
        }

        .brand-title {
            display: block;
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--text-main);
        }

        .brand-subtitle {
            font-size: 0.75rem;
            color: var(--text-secondary);
            font-weight: 500;
            letter-spacing: 0.02em;
        }

        /* 
           2. CONTENEDOR PRINCIPAL (MAIN LAYOUT)
           Contiene el MAPA y el SIDEBAR.
           Usa Flexbox para ponerlos uno al lado del otro en Escritorio.
        */
        .main-layout {
            display: flex;
            flex: 1;
            /* Ocupa todo el espacio vertical sobrante debajo del header */
            overflow: hidden;
            position: relative;
        }

        /* 
           SECCIÓN A: EL MAPA
           Crece (flex-grow: 1) para ocupar todo el espacio que el sidebar no use.
        */
        .map-section {
            flex-grow: 1;
            position: relative;
            background: #e2e8f0;
        }

        #map {
            width: 100%;
            height: 100%;
            z-index: 1;
        }

        /* 
           SECCIÓN B: BARRA LATERAL (SIDEBAR)
           Tiene un ancho fijo en escritorio.
        */
        .sidebar {
            width: 340px;
            background: var(--surface);
            border-left: 1px solid var(--border);
            /* Línea separadora con el mapa */
            display: flex;
            flex-direction: column;
            z-index: 100;
            flex-shrink: 0;
        }

        .sidebar-header {
            padding: 16px 20px;
            border-bottom: 1px solid var(--border);
            background: #f8fafc;
        }

        .sidebar-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Lista escrolleable de hermandades */
        .brotherhood-list {
            flex: 1;
            overflow-y: auto;
            /* Scroll vertical solo aquí dentro */
            padding: 0;
        }

        /* Estilos de cada ítem de lista */
        .list-item {
            display: flex;
            align-items: center;
            padding: 14px 20px;
            border-bottom: 1px solid var(--bg-body);
            cursor: pointer;
            transition: background 0.15s;
        }

        .list-item:hover {
            background: #f1f5f9;
        }

        /* INTÉRROPTOR (SWITCH) CSS PURO */
        .switch {
            position: relative;
            width: 40px;
            height: 22px;
            margin-right: 14px;
            flex-shrink: 0;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #cbd5e1;
            transition: .3s;
            border-radius: 34px;
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .3s;
            border-radius: 50%;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        input:checked+.slider {
            background-color: var(--primary);
        }

        input:checked+.slider:before {
            transform: translateX(18px);
        }

        .hermandad-name {
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--text-main);
        }

        /* 
           RESPONSIVE: DISEÑO MÓVIL (< 768px)
           Cambia la dirección del Flex a COLUMNA.
           El sidebar pasa a estar ABAJO.
        */
        @media (max-width: 768px) {
            .main-layout {
                flex-direction: column;
                /* Mapa arriba, Panel abajo */
            }

            .sidebar {
                width: 100%;
                /* Ancho total */
                height: 40%;
                /* Ocupa el 40% inferior de la pantalla */
                border-left: none;
                border-top: 1px solid var(--border);
                /* Borde arriba ahora */
                box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
            }

            .map-section {
                height: 60%;
                /* El mapa se queda con el 60% superior */
            }

            .sidebar-header {
                padding: 12px 16px;
            }

            .list-item {
                padding: 12px 16px;
            }
        }

        /* Personalización de Popups del Mapa */
        .custom-popup .leaflet-popup-content-wrapper {
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            padding: 0;
        }

        .custom-popup .leaflet-popup-content {
            margin: 0;
            padding: 12px;
        }

        .battery-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.75rem;
            padding: 3px 6px;
            border-radius: 4px;
            background: #f1f5f9;
            font-weight: 500;
            margin-top: 5px;
        }
    </style>
</head>

<body>
    <!-- CONEXIÓN PHP INICIAL -->
    <?php
    require_once('config.php');
    $conn = new mysqli($DB_ADDRESS, $DB_USER, $DB_PASS, $DB_NAME);
    $conn->set_charset("utf8mb4");
    ?>

    <!-- 1. CABECERA FIJA SUPERIOR -->
    <header class="app-header">
        <div class="brand-section">
            <div class="brand-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                </svg>
            </div>
            <div class="brand-info">
                <span class="brand-title">SSM Location</span>
                <span class="brand-subtitle">Panel de Control</span>
            </div>
        </div>
        <a href="?logout=1" style="color: #64748b; font-size: 0.9rem; font-weight: 500; text-decoration: none; padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">Cerrar Sesión</a>
    </header>

    <!-- 2. LAYOUT DIVIDIDO (SPLIT SCREEN) -->
    <div class="main-layout">

        <!-- ZONA IZQUIERDA: MAPA -->
        <section class="map-section">
            <div id="map"></div>
        </section>

        <!-- ZONA DERECHA (Escritorio) o INFERIOR (Móvil): CONTROLES -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-title">Hermandades</div>
            </div>

            <div class="brotherhood-list">
                <?php
                if ($conn->connect_error) {
                    echo "<div style='padding:20px; color:red'>Error conexión BD</div>";
                } else {
                    $query = "SELECT id_hermandad, nombre_coloquial, activa FROM hermandades ORDER BY id_hermandad";
                    $result = $conn->query($query);

                    if ($result && $result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            $id = $row['id_hermandad'];
                            $nombre = $row['nombre_coloquial']; // Nombre para mostrar
                            $activa = $row['activa'] == 1; // Estado del checkbox
                            ?>
                            <!-- Ítem de Lista con Checkbox -->
                            <label class="list-item">
                                <div class="switch">
                                    <input type="checkbox" id="<?= $id ?>" value="<?= $id ?>" <?= $activa ? 'checked' : '' ?>>
                                    <span class="slider"></span>
                                </div>
                                <span class="hermandad-name"><?= $nombre ?></span>
                            </label>
                            <?php
                        }
                    } else {
                        echo "<div style='padding:20px; text-align:center; color:#94a3b8'>No hay datos disponibles</div>";
                    }
                    $result->close();
                }
                $conn->close();
                ?>
            </div>
        </aside>

    </div>

    <!-- ========================================================= -->
    <!-- LÓGICA JAVASCRIPT -->
    <!-- ========================================================= -->
    <script>
        $(document).ready(function () {
            // --- 1. GESTIÓN DE INTERRUPTORES (CHECKBOXES) ---
            // Escucha cambios en los interruptores para activar/desactivar hermandades.
            $("input:checkbox").change(function () {
                var activas = [];
                $("input:checkbox:checked").each(function () {
                    activas.push($(this).val());
                });

                // Enviar la nueva configuración al servidor por AJAX
                $.ajax({
                    url: 'actualizar_activos.php',
                    type: 'POST',
                    dataType: 'JSON',
                    data: { activas: activas },
                    success: function (resp) { console.log('Configuración guardada:', resp); },
                    error: function (err) { console.error('Error guardando configuración:', err); }
                });
            });

            // --- 2. CONFIGURACIÓN DEL MAPA ---
            var map = L.map('map', {
                zoomControl: false, // Desactivamos el zoom por defecto para reubicarlo
                fullscreenControl: true // Habilitamos botón pantalla completa
            }).setView([38.9163169, -6.3463233], 13); // Coordenadas iniciales (Mérida)

            // Ponemos el control de zoom abajo a la derecha
            L.control.zoom({ position: 'bottomright' }).addTo(map);

            // Capa del mapa base (Estilo Voyager de CartoDB - Limpio y moderno)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '© OpenStreetMap © CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            // Definición de icono estándar
            var LeafIcon = L.Icon.extend({
                options: { iconSize: [50, 59], iconAnchor: [25, 58], popupAnchor: [-1, -60] }
            });

            // --- 3. ALGORITMO 'FLICKER-FREE' (MOVIMIENTO SUAVE) ---
            // Almacenamos los marcadores activos en memoria para no borrarlos en cada refresco.
            var activeMarkers = {};

            function updateMapMarkers() {
                $.ajax({
                    type: 'POST',
                    url: 'consulta_hermandades_activas.php',
                    dataType: "json",
                    success: function (data) {
                        // Protección contra respuestas vacías o errores
                        if (!Array.isArray(data)) return;

                        // Set para control de qué marcadores siguen existiendo
                        const currentIds = new Set();

                        data.forEach(function (evento) {
                            const id = evento.hermandad;
                            currentIds.add(id);

                            // Preparar datos visuales
                            const iconoUrl = 'img_Marcadores/' + evento.icono;
                            const coords = [evento.lat, evento.lng];

                            // HTML del Popup con indicador de batería
                            let batHTML = "";
                            if (evento.bateria !== null) {
                                const nivel = parseInt(evento.bateria);
                                const color = nivel < 20 ? '#ef4444' : '#10b981'; // Rojo/Verde
                                const ico = nivel < 20 ? '🪫' : '🔋';
                                batHTML = `<span class="battery-badge" style="color:${color}">${ico} ${nivel}%</span>`;
                            }

                            const contenido = `
                                <div style="font-weight:600; color:#0f172a; margin-bottom:2px">${evento.nombre_coloquial}</div>
                                <div style="font-size:0.85rem; color:#64748b">${evento.address}</div>
                                ${batHTML}
                            `;

                            // LÓGICA DE ACTUALIZACIÓN (DIFFING)
                            if (activeMarkers[id]) {
                                // SI EXISTE: Actualizamos posición suavemente
                                const m = activeMarkers[id];
                                m.setLatLng(coords);

                                // Actualizamos contenido del popup (incluso si está abierto)
                                if (m.getPopup() && m.getPopup().isOpen()) {
                                    m.getPopup().setContent(contenido);
                                } else {
                                    m.bindPopup(contenido, { className: 'custom-popup' });
                                }

                                // Si cambia el icono, lo actualizamos
                                if (m.options.icon.options.iconUrl !== iconoUrl) {
                                    m.setIcon(new LeafIcon({ iconUrl: iconoUrl }));
                                }
                            } else {
                                // SI NO EXISTE: Lo creamos
                                const nm = L.marker(coords, { icon: new LeafIcon({ iconUrl: iconoUrl }) });
                                nm.bindPopup(contenido, { className: 'custom-popup' });
                                nm.addTo(map);
                                activeMarkers[id] = nm;
                            }
                        });

                        // LIMPIEZA DE MARCADORES ANTIGUOS
                        // Si un marcador está en memoria pero no en el JSON nuevo, lo borramos.
                        Object.keys(activeMarkers).forEach(function (k) {
                            if (!currentIds.has(k)) {
                                map.removeLayer(activeMarkers[k]);
                                delete activeMarkers[k];
                            }
                        });
                    },
                    error: function (e) { console.error(e); }
                });
            }

            // Iniciar bucle de actualizaciones cada 2 segundos
            updateMapMarkers();
            setInterval(updateMapMarkers, 2000);
        });
    </script>
</body>

</html>