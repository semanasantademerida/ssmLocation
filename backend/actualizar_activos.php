<?php
// CABECERA PARA QUE EL NAVEGADOR RECIBA UN JSON CORRECTO
header('Content-Type: application/json; charset=utf-8');

// 1. OBTENER DATOS (Y manejar el caso en el que no se marque ninguna)
$activas = isset($_POST["activas"]) ? $_POST["activas"] : [];

// 2. CONEXIÓN CON LA BASE DE DATOS (Usando credenciales ocultas)
require_once('config.php');
$conn = new mysqli($DB_ADDRESS, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error de conexión a BD"]);
    exit();
}

$conn->set_charset("utf8mb4");

try {
    // 3. PONER TODAS A 0 (Desactivadas)
    $conn->query("UPDATE hermandades SET activa = 0");

    // 4. ACTIVAR (1) LAS MARCADAS, PREVINIENDO INYECCIÓN SQL
    if (count($activas) > 0) {
        // Usamos prepare() para evitar que un hacker inyecte código en $activas[$i]
        $stmt = $conn->prepare("UPDATE hermandades SET activa = 1 WHERE id_hermandad = ?");
        
        foreach ($activas as $id) {
            // Forzamos que sea un número entero (intval) para seguridad extrema
            $id_seguro = intval($id);
            $stmt->bind_param("i", $id_seguro);
            $stmt->execute();
        }
        $stmt->close();
    }

    // Respuesta final correcta para que jQuery en gestionmapa la reconozca
    echo json_encode(["status" => "success", "message" => "Guardado", "activadas" => count($activas)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Error al ejecutar SQL"]);
}

$conn->close();
?>
