<!DOCTYPE html>
<html lang="es">

<head>

    <title>SSM Location Mérida</title>
    <meta charset="utf-8" />
    <!-- viewport: impide el zoom automático en móviles y asegura que la página
         ocupe el 100% del ancho de la pantalla del dispositivo -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">

    <!-- Meta etiquetas para Redes Sociales (Open Graph) -->
    <meta property="og:title" content="SSM Location Mérida - Seguimiento en Directo">
    <meta property="og:description" content="Sigue la ubicación en tiempo real de las estaciones de penitencia de la Semana Santa de Mérida.">
    <meta property="og:image" content="https://gps.semanasantademerida.es/publicidad/cabecera%20ssm.png">
    <meta property="og:url" content="https://gps.semanasantademerida.es/">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="description" content="Portal oficial de seguimiento GPS para las procesiones de la Semana Santa de Mérida.">

    <!-- =====================================================================
         LIBRERÍAS EXTERNAS
         - Leaflet 1.9.4: librería para renderizar mapas interactivos con OSM
         - jQuery 3.7.1: simplifica las llamadas AJAX y la manipulación del DOM
         ===================================================================== -->
    <!-- Leaflet CSS con SRI: el hash sha256 garantiza que el navegador rechace
         el archivo si ha sido manipulado en el CDN (seguridad ante ataques) -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

    <!-- Leaflet JS con SRI -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>

    <!-- jQuery desde CDN con SRI + fallback local -->
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    <script>
        window.jQuery || document.write('<script src="js/jquery-3.7.1.min.js"><\/script>');
    </script>

    <!-- Plugin de pantalla completa para el mapa (solo activo en navegadores compatibles) -->
    <link rel="stylesheet" href="css/Control.FullScreen.css" />
    <script src="js/Control.FullScreen.js"></script>

    <!-- Tipografía Montserrat desde Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap" rel="stylesheet">

    <!-- Estilos propios del mapa (extraídos a archivo externo) -->
    <link rel="stylesheet" href="css/mapa.css" />

	
	
	
	
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1X2LGZCP04"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-1X2LGZCP04');
</script>
	
	
	

</head>

<body>

    <!-- LOGO SUPERIOR: imagen de cabecera de la Semana Santa de Mérida -->
    <div id="logo_superior">
        <img src="publicidad/cabecera ssm.png" alt="Cabecera SSM">
    </div>

    <!-- CABECERA: títulos descriptivos del servicio -->
    <div id="cabecera">
        <h1>SEGUIMIENTO EN DIRECTO</h1>
        <h2>Sigue la ubicación en cada momento de las estaciones de penitencia</h2>
        <h3>Por gentileza de:</h3>
    </div>

    <!-- BANNER: imagen publicitaria del patrocinador -->
    <div id="banner">
        <img src="publicidad/publicidad.jpg" alt="Publicidad">
    </div>

    <!-- CONTENEDOR DEL MAPA: Leaflet inyectará aquí el canvas del mapa -->
    <div id='map'></div>

    <!-- Lógica del mapa (extraída a archivo externo).
         Se carga justo antes de </body> para garantizar ejecución correcta en Safari/iOS -->
    <script src="js/mapa.js"></script>

</body>

</html>