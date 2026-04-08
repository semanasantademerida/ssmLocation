-- SSM Location - Esquema de Base de Datos
-- Versión compatible con MariaDB / MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `hermandades`
-- --------------------------------------------------------

CREATE TABLE `hermandades` (
  `id_hermandad` int(11) NOT NULL,
  `hermandad` text NOT NULL,
  `nombre_coloquial` text NOT NULL,
  `icono` text NOT NULL,
  `activa` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

--
-- Volcado de datos inicial para la tabla `hermandades`
--

INSERT INTO `hermandades` (`id_hermandad`, `hermandad`, `nombre_coloquial`, `icono`, `activa`) VALUES
(1, 'JuntaCofradias', 'Junta de Cofradías', 'gpsJuntaCofradias.png', 0),
(2, 'Calvario', 'Hermandad del Calvario', 'gpsCalvario.png', 0),
(3, 'Castillos', 'Cofradía de los Castillos', 'gpsCastillos.png', 0),
(4, 'Ferroviarios', 'Cofradía Ferroviaria', 'gpsFerroviarios.png', 0),
(5, 'Infantiles', 'Cofradía Infantil', 'gpsInfantiles.png', 0),
(6, 'Paz', 'Cofradía de la Paz', 'gpsPaz.png', 0),
(7, 'Veracruz', 'Cofradía de la Veracruz', 'gpsVeracruz.png', 0),
(8, 'TresCaidas', 'Cofradía de las Tres Caídas', 'gpsTrescaidas.png', 0),
(9, 'Lagrimas', 'Hermandad de las Lágrimas', 'gpsLagrimas.png', 0),
(10, 'SagradaCena', 'Hermandad Sagrada Cena', 'gpsCena.png', 0),
(11, 'Cabalgata', 'Cabalgata Reyes Magos', 'logoMerida.png', 0),
(12, 'Carnaval', 'Desfile de Carnaval', 'gpsCarnaval.png', 0),
(13, 'SantaEulalia', 'Procesión de Santa Eulalia', 'gpsEulalia.png', 0),
(14, 'CorpusChristi', 'Procesión Corpus Christi', 'gpsLogojunta.png', 0);

-- --------------------------------------------------------
-- Estructura de tabla para la tabla `location`
-- --------------------------------------------------------

CREATE TABLE `location` (
  `id` varchar(32) NOT NULL,
  `now` datetime NOT NULL,
  `lat` double DEFAULT NULL,
  `lng` double DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `hermandad` varchar(40) DEFAULT NULL,
  `bateria` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

-- (Los datos de ubicación se generan dinámicamente por la aplicación)

-- --------------------------------------------------------
-- Índices para tablas volcadas
-- --------------------------------------------------------

--
-- Indices de la tabla `hermandades`
--
ALTER TABLE `hermandades`
  ADD PRIMARY KEY (`id_hermandad`);

--
-- Indices de la tabla `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`,`now`);

--
-- AUTO_INCREMENT de la tabla `hermandades`
--
ALTER TABLE `hermandades`
  MODIFY `id_hermandad` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

COMMIT;
