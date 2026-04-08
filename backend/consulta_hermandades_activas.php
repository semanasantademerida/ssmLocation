<?php
/**
 * ============================================================================
 * CONSULTA DE HERMANDADES ACTIVAS - API ENDPOINT
 * ============================================================================
 * 
 * Este script actúa como una API JSON que devuelve la ubicación en tiempo real
 * de las hermandades que están procesionando actualmente.
 * 
 * Se consume desde:
 *  - La App Móvil (para pintar el mapa nativo si lo hubiera).
 *  - El Panel de Control Web (`gestionmapa.php`) vía AJAX.
 *  - El mapa público (si existe).
 * 
 * Funcionalidad:
 * 1. Conecta a la base de datos de forma segura.
 * 2. Consulta las tablas `hermandades` y `location` haciendo un JOIN.
 * 3. Filtra solo las hermandades marcadas como "activa=1".
 * 4. Devuelve un array JSON con latitud, longitud, dirección y estado de batería.
 */

// 1. CARGA DE CONFIGURACIÓN SEGURA
// Importamos las credenciales desde un archivo separado para no exponerlas en este fichero.
// Esto facilita el mantenimiento si cambia la contraseña de la BD.
require_once('config.php');

// 2. CABECERAS HTTP
// Es fundamental indicar que la respuesta es JSON y que usamos UTF-8 para
// soportar tildes y caracteres especiales (ñ) sin problemas de codificación.
header('Content-Type: application/json; charset=utf-8');

// 3. CONEXIÓN A BASE DE DATOS
// Creamos una nueva instancia de mysqli usando las variables de config.php.
$conn = new mysqli($DB_ADDRESS, $DB_USER, $DB_PASS, $DB_NAME);

// Verificación de errores de conexión
if ($conn->connect_error) {
    // Si falla, devolvemos un código HTTP 500 (Server Error) y el detalle en formato JSON.
    // Esto permite al frontend saber que ha habido un problema grave.
    http_response_code(500);
    echo json_encode(["error" => "Fallo de conexión a Base de Datos: " . $conn->connect_error]);
    exit(); // Detenemos la ejecución inmediatamente.
}

// Forzamos la codificación de la conexión a utf8mb4 (estándar moderno para emojis y tildes).
$conn->set_charset("utf8mb4");

// 4. CONSULTA SQL
// Seleccionamos los datos geográficos y de estado combinando dos tablas:
// - hermandades: Datos estáticos (nombre, icono, si está activa o no).
// - location: Datos dinámicos (lat, lng, batería, dirección actualizada).
//
// El 'WHERE ... activa=1' asegura que solo devolvemos las procesiones en curso,
// ahorrando ancho de banda y procesamiento en el cliente.
$query_eventos = "SELECT 
                    lat, 
                    lng, 
                    address, 
                    location.hermandad, 
                    nombre_coloquial, 
                    activa, 
                    icono, 
                    location.bateria 
                  FROM hermandades, location 
                  WHERE hermandades.hermandad = location.hermandad 
                  AND activa = 1";

$result_eventos = $conn->query($query_eventos);

// Inicializamos el array de resultados vacío.
// Importante: Si no hay resultados, devolveremos un array vacío [] y NO un error.
$resultado = array();

if ($result_eventos && $result_eventos->num_rows > 0) {
    // Si hay filas, las recorremos y añadimos al array.
    while ($row = $result_eventos->fetch_assoc()) {
        $resultado[] = $row;
    }
}

// 5. RESPUESTA AL CLIENTE
// Codificamos el array PHP a formato JSON texto para enviarlo por internet.
echo json_encode($resultado);

// 6. LIMPIEZA
// Cerramos la conexión para liberar recursos del servidor.
$conn->close();
?>