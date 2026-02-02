<!DOCTYPE html>
<html lang="es">

<head>

    <title>SSM Location Mérida</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" type="image/x-icon" href="docs/images/favicon.ico" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    <script src="https://code.jquery.com/jquery-3.2.1.js"></script>

    <link rel="stylesheet" href="css/Control.FullScreen.css" />
    <script src="js/Control.FullScreen.js"></script>

    <style>
        html,
        body {
            height: 100%;
            margin: 0;
        }

        .leaflet-container {
            height: 100%;
            width: 100%;
            max-width: 100%;
            max-height: 100%;
        }

        .centrado {
            display: block;
            margin-left: auto;
            margin-right: auto;
        }

        .contenedor {
            height: 49%;
            margin: 1% 1%;
        }
    </style>


</head>

<body>

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
    ?>

    <div class="contenedor">

        <div id='map' class="centrado"></div>

    </div>

    <div class="contenedor">
        <b>Eventos que se pueden seguir: </b><br />
        <ul>

            <?php
            if ($conn->connect_error) {                                                           //checks connection
                header("HTTP/1.0 400 Bad Request");
                echo "ERROR Database Connection Failed: " . $conn->connect_error, E_USER_ERROR;   //reports a DB connection failure
            } else {
                $query_hermandades = "SELECT id_hermandad, hermandad, nombre_coloquial,icono,activa FROM hermandades order by id_hermandad;";
                $result_hermandades = $conn->query($query_hermandades);
            }
            ;

            if ($result_hermandades->num_rows > 0) {
                while ($row = mysqli_fetch_assoc($result_hermandades)) {
                    ?>
                    <input type="checkbox" id="<?= $row["id_hermandad"] ?>" name="hermandades" value="<?= $row["id_hermandad"] ?>"
                        <?php if ($row["activa"] == 1) {
                            echo "checked";
                        } else {
                            echo "unchecked";
                        }
                        ; ?>><?= $row["nombre_coloquial"] ?><br />
                    <?php
                }
                ;
            } else {
                echo "0 resultados";
            }
            ;

            $conn->close();
            ?>
        </ul>
    </div>



</body>

</html>

<script type="text/javascript">



    $(document).ready(function () {


        var hermandades_activas = [];

        $("input:checkbox").change(function () {
            hermandades_activas.length = 0;
            $("input:checkbox").each(function () {
                if ($(this).is(':checked')) {
                    hermandades_activas.push($(this).val());
                }
            });

            $.ajax({
                url: 'actualizar_activos.php',
                type: 'POST',
                dataType: 'JSON',
                data: { activas: hermandades_activas },
                success: function (resp) {
                    //alert(resp.responseText);
                },
                error: function (error) {
                    //alert(error.responseText);
                }
            })
        });

        function pintarMapa() {

            //borramos los marcadores anteriores
            $(".leaflet-marker-icon").remove();

            $.ajax({
                type: 'POST',
                url: 'consulta_hermandades_activas.php',
                dataType: "json",
                success: function (data) {
                    longitud = data.length;
                    //recorrer los registros que ha devuelto la consulta
                    contador = 0;
                    icono = "";
                    while (contador <= longitud) {
                        icono = 'img_Marcadores/' + data[contador].icono;
                        var myIcon = new LeafIcon({ iconUrl: icono });

                        // [v2.33] Visualización de batería en el mapa
                        var bateriaHTML = "";
                        if (data[contador].bateria !== null && data[contador].bateria !== undefined) {
                            var batNivel = data[contador].bateria;
                            var batIcono = "🔋";
                            // Icono de pila baja si es menor al 20%
                            if (batNivel < 20) batIcono = "🪫";
                            bateriaHTML = "<br><span style='font-size:0.9em; color:#555; margin-top:4px; display:block;'>" + batIcono + " Batería: <b>" + batNivel + "%</b></span>";
                        }

                        var mIcon = L.marker([data[contador].lat, data[contador].lng], { icon: myIcon })
                            .bindPopup('<b>' + data[contador].nombre_coloquial + '</b> aprox. en: ' + data[contador].address + bateriaHTML)
                            .addTo(map);
                        contador = contador + 1;
                    };

                }
            });
        };

        var map = L.map('map', {
            fullscreenControl: true,
            fullscreenControlOptions: { // optional
                title: "Pantalla completa",
                titleCancel: "Salir Pantalla completa"
            }
        }).setView([38.9163169, -6.3463233], 13);


        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.control.scale().addTo(map);

        var LeafIcon = L.Icon.extend({
            options: {
                //shadowUrl: 'img_Marcadores/gpsTrescaidas.png',
                //iconSize:     [38, 95],
                iconSize: [50, 59],
                //shadowSize:   [50, 64],
                //iconAnchor:   [22, 94],
                iconAnchor: [25, 58],
                //shadowAnchor: [4, 62],
                //popupAnchor:  [-3, -76]
                popupAnchor: [-1, -60]
            }
        });



        pintarMapa();
        setInterval(pintarMapa, 2000);
    });

</script>