#!/bin/bash
# Script para reemplazar variables en inglés por castellano

FILE="src/App.jsx"

# Estados de UI
sed -i '' 's/\bscreen\b/pantalla/g' "$FILE"
sed -i '' 's/\bsetScreen\b/setPantalla/g' "$FILE"
sed -i '' 's/\bselectedHermandad\b/hermandadSeleccionada/g' "$FILE"
sed -i '' 's/\bsetSelectedHermandad\b/setHermandadSeleccionada/g' "$FILE"
sed -i '' 's/\bisTracking\b/estaRastreando/g' "$FILE"
sed -i '' 's/\bsetIsTracking\b/setEstaRastreando/g' "$FILE"
sed -i '' 's/\blastLocation\b/ultimaUbicacion/g' "$FILE"
sed -i '' 's/\bsetLastLocation\b/setUltimaUbicacion/g' "$FILE"
sed -i '' 's/\bstatusMessage\b/mensajeEstado/g' "$FILE"
sed -i '' 's/\bsetStatusMessage\b/setMensajeEstado/g' "$FILE"
sed -i '' 's/\blastConnectionTime\b/ultimaHoraConexion/g' "$FILE"
sed -i '' 's/\bsetLastConnectionTime\b/setUltimaHoraConexion/g' "$FILE"
sed -i '' 's/\bshowDiagnostic\b/mostrarDiagnostico/g' "$FILE"
sed -i '' 's/\bsetShowDiagnostic\b/setMostrarDiagnostico/g' "$FILE"
sed -i '' 's/\blastFullPoint\b/ultimoPuntoCompleto/g' "$FILE"
sed -i '' 's/\bsetLastFullPoint\b/setUltimoPuntoCompleto/g' "$FILE"

# Estados internos
sed -i '' 's/\bwatcherId\b/idObservador/g' "$FILE"
sed -i '' 's/\bsetWatcherId\b/setIdObservador/g' "$FILE"
sed -i '' 's/\bsentQueries\b/consultasEnviadas/g' "$FILE"
sed -i '' 's/\bsetSentQueries\b/setConsultasEnviadas/g' "$FILE"
sed -i '' 's/\bnextUpdateIn\b/proximaActualizacionEn/g' "$FILE"
sed -i '' 's/\bsetNextUpdateIn\b/setProximaActualizacionEn/g' "$FILE"

# Referencias
sed -i '' 's/\blastUpdateTimestampRef\b/timestampUltimaActualizacionRef/g' "$FILE"
sed -i '' 's/\bwatcherIdRef\b/idObservadorRef/g' "$FILE"
sed -i '' 's/\bisProcessingRef\b/estaProcesandoRef/g' "$FILE"
sed -i '' 's/\blastGpsLogTimestampRef\b/timestampUltimoLogGpsRef/g' "$FILE"
sed -i '' 's/\bisTrackingRef\b/estaRastreandoRef/g' "$FILE"
sed -i '' 's/\bmapRef\b/mapaRef/g' "$FILE"
sed -i '' 's/\bselectedHermandadRef\b/hermandadSeleccionadaRef/g' "$FILE"

# Constantes
sed -i '' 's/\bAPP_VERSION\b/VERSION_APP/g' "$FILE"
sed -i '' 's/\bSEND_INTERVAL_MS\b/INTERVALO_ENVIO_MS/g' "$FILE"

# Funciones
sed -i '' 's/\bgetAddressFromCoords\b/obtenerDireccionDesdeCoordenadas/g' "$FILE"
sed -i '' 's/\baddBackgroundLog\b/agregarLogSegundoPlano/g' "$FILE"
sed -i '' 's/\bclearLogs\b/limpiarLogs/g' "$FILE"
sed -i '' 's/\bcopyLogs\b/copiarLogs/g' "$FILE"
sed -i '' 's/\bgetDeviceId\b/obtenerIdDispositivo/g' "$FILE"
sed -i '' 's/\bsendLocationToServer\b/enviarUbicacionAlServidor/g' "$FILE"
sed -i '' 's/\binitMap\b/inicializarMapa/g' "$FILE"
sed -i '' 's/\bupdateMapMarker\b/actualizarMarcadorMapa/g' "$FILE"
sed -i '' 's/\bprocessLocation\b/procesarUbicacion/g' "$FILE"
sed -i '' 's/\bstartTracking\b/iniciarRastreo/g' "$FILE"
sed -i '' 's/\bstopTracking\b/detenerRastreo/g' "$FILE"

# Estados de logs
sed -i '' 's/\bbackgroundLogs\b/logsSegundoPlano/g' "$FILE"
sed -i '' 's/\bsetBackgroundLogs\b/setLogsSegundoPlano/g' "$FILE"

echo "✅ Reemplazos completados"
