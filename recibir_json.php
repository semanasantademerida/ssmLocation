<?php
// Recibir datos JSON de la App de Geolocalización SSM
// NOTA: No enviamos cabeceras CORS aquí porque el servidor PLESK ya las está añadiendo automáticamente.
// Si las enviamos dos veces, el navegador dará error.
header("Content-Type: application/json; charset=UTF-8");

// Manejar peticiones OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Incluir configuración privada
require_once('config.php');

// Leer el cuerpo de la petición (JSON)
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

// Verificar que llegaron datos JSON válidos
if (json_last_error() !== JSON_ERROR_NONE) {
    // Intento de fallback para x-www-form-urlencoded si por alguna razón no llega JSON
    if (isset($_POST['key'])) {
        $data = $_POST;
    } else {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Invalid JSON format"]);
        exit();
    }
}

// Verificar autenticación
if (!isset($data['key']) || $data['key'] !== $APP_SECRET) {
    http_response_code(401);
    echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid key"]);
    exit();
}

// Verificar datos necesarios
if (!isset($data['latitude']) || !isset($data['longitude']) || !isset($data['hermandad'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit();
}

// Conexión segura a BD
$conn = new mysqli($DB_ADDRESS, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    exit();
}

$conn->set_charset("utf8mb4");

try {
    // Datos recibidos
    $id_dispositivo = isset($data['device_id']) ? $data['device_id'] : "unknown";
    $hermandad = $data['hermandad'];
    $lat = $data['latitude'];
    $lon = $data['longitude'];
    $address = isset($data['address']) ? $data['address'] : "";

    // Fecha actual del servidor
    $fecha = date('Y-m-d H:i:s');

    // 1. Borrar registros anteriores de esta hermandad (Prepared Statement)
    $stmt_del = $conn->prepare("DELETE FROM location WHERE hermandad = ?");
    $stmt_del->bind_param("s", $hermandad);
    $stmt_del->execute();
    $stmt_del->close();

    // 2. Insertar nueva ubicación (Prepared Statement)
    // Schema: id, now, lat, lng, address, hermandad
    $stmt_ins = $conn->prepare("INSERT INTO location (id, now, lat, lng, address, hermandad) VALUES (?, ?, ?, ?, ?, ?)");

    // Asumiendo que la tabla tiene 6 columnas en ese orden específico.
// Si la estructura es diferente, ajusta los nombres de columnas en el INSERT.
// Tipos: s=string, d=double/float
    $stmt_ins->bind_param("ssddss", $id_dispositivo, $fecha, $lat, $lon, $address, $hermandad);

    if ($stmt_ins->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "Location updated",
            "data" => [
                "hermandad" => $hermandad,
                "time" => $fecha
            ]
        ]);
    } else {
        throw new Exception($stmt_ins->error);
    }

    $stmt_ins->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "SQL Error: " . $e->getMessage()]);
}

$conn->close();
?>