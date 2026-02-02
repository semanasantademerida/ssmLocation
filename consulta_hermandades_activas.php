<?php

//CONEXIÓN CON LA BASE DE DATOS//
//$DB_ADDRESS="localhost:3306";
//$DB_USER="dbu2757792";
//$DB_PASS="#0123456789#";
//$DB_NAME="dbs4898003"; 
//CONEXIÓN CON LA BASE DE DATOS//
$DB_ADDRESS = 'localhost:3306';
$DB_USER = 'dbu2757792';
$DB_PASS = '#0123456789#';
$DB_NAME = 'dbs4898003';

$conn = new mysqli($DB_ADDRESS, $DB_USER, $DB_PASS, $DB_NAME);    //connect

//si la conexión es correcta buscamos los marcadores en la base de datos.

if ($conn->connect_error) {                                                           //checks connection
    header("HTTP/1.0 400 Bad Request");
    echo "ERROR Database Connection Failed: " . $conn->connect_error, E_USER_ERROR;   //reports a DB connection failure
} else {
    $query_eventos = "SELECT lat, lng, address, location.hermandad, nombre_coloquial, activa, icono, location.bateria FROM hermandades, location where hermandades.hermandad=location.hermandad and activa=1;";
    $result_eventos = $conn->query($query_eventos);

    if ($result_eventos->num_rows > 0) {
        $resultado = array();
        $i = 0;
        while ($row = mysqli_fetch_assoc($result_eventos)) {
            $resultado[$i] = $row;
            $i++;
        }
        echo json_encode($resultado);
    } else {
        echo "0 resultados";
    }
    ;

    $conn->close();

}
;
?>