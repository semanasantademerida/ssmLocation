import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Play, Square, ChevronDown } from 'lucide-react';

// ============================================================================
// PLUGINS DE CAPACITOR
// ============================================================================
// IMPORTANTE: Usamos registerPlugin en lugar de imports npm porque los plugins
// de Capacitor son nativos (Android/iOS) y no tienen punto de entrada JavaScript.
// registerPlugin crea un proxy que llama directamente al código nativo.
import { registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';  // GPS manual (fallback)
import { CapacitorHttp } from '@capacitor/core';       // HTTP nativo (evita CORS)
import { App } from '@capacitor/app';                  // Lifecycle de la app
import { Info, ShieldCheck, Battery } from 'lucide-react'; // Iconos UI

// Plugin de geolocalización en segundo plano (el más crítico de la app)
const BackgroundGeolocation = registerPlugin('BackgroundGeolocation');


/**
 * ============================================================================
 * SSM LOCATION APP - COMPONENTE PRINCIPAL
 * ============================================================================
 * 
 * AUTOR: Rubén D. Mancera Morán
 * PROPIEDAD: Junta de Cofradías de Mérida
 * LICENCIA: Creative Commons Atribución-CompartirIgual (CC BY-SA)
 * 
 * TÉRMINOS:
 * - Se permite usar y modificar este código.
 * - Cualquier obra derivada debe licenciarse bajo los mismos términos.
 * - Se debe compartir los cambios con la comunidad.
 * - Siempre se debe mencionar al autor original y a la propiedad.
 * 
 * DESCRIPCIÓN TÉCNICA:
 * Esta aplicación permite el rastreo GPS en tiempo real de hermandades de 
 * Semana Santa, funcionando tanto en primer plano como en SEGUNDO PLANO 
 * (cuando el móvil está bloqueado o la app minimizada).
 * 
 * TECNOLOGÍAS CLAVE:
 * ------------------
 * 1. React + Vite: Framework UI y empaquetado.
 * 2. @capacitor-community/background-geolocation: Plugin vital que mantiene 
 *    el GPS activo en segundo plano usando un Servicio Foregound de Android.
 * 3. CapacitorHttp: Realiza peticiones HTTP nativas, evitando problemas de CORS
 *    típicos en WebViews híbridas.
 * 4. Leaflet: Muestra el mapa en la interfaz visual (solo visible en primer plano).
 * 
 * FLUJO DE FUNCIONAMIENTO:
 * ------------------------
 * 1. Usuario selecciona hermandad -> Se habilita botón de inicio.
 * 2. Iniciar Tracking -> Se solicitan permisos y se inicia el WATCHER del plugin.
 * 3. Watcher -> Detecta movimiento y ejecuta el callback `processLocation`.
 * 4. processLocation -> 
 *    a) Calcula dirección (Reverse Geoding).
 *    b) Envía datos a API PHP.
 *    c) Actualiza UI (mapa/logs) si la app está visible.
 */

// ============================================================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================================================

// Versión actual de la aplicación
const VERSION_APP = '2.24';

// Intervalo de envío de ubicaciones al servidor (60 segundos = 1 minuto)
// Este valor determina cada cuánto tiempo se envía la ubicación GPS
const INTERVALO_ENVIO_MS = 60 * 1000;

const hermandades = [
  { nombre: 'Las Lágrimas', codigo: 'lagrimas' },
  { nombre: 'Sagrada Cena', codigo: 'sagradacena' },
  { nombre: 'Tres Caídas', codigo: 'trescaidas' },
  { nombre: 'Veracruz', codigo: 'veracruz' },
  { nombre: 'La Paz', codigo: 'paz' },
  { nombre: 'Infantil', codigo: 'infantiles' },
  { nombre: 'Nazareno', codigo: 'castillos' },
  { nombre: 'Calvario', codigo: 'calvario' },
  { nombre: 'Ferroviarios', codigo: 'ferroviarios' },
  { nombre: 'Santa Eulalia', codigo: 'santaeulalia' },
  { nombre: 'Cabalgata', codigo: 'cabalgata' },
  { nombre: 'Junta Cofradías', codigo: 'juntacofradias' },
  { nombre: 'Otros', codigo: 'otros' }
];

export default function SSMLocationApp() {
  // ============================================================================
  // ESTADOS DE LA INTERFAZ DE USUARIO
  // ============================================================================
  // Estos estados controlan lo que el usuario ve en pantalla

  // Pantalla actual: 'welcome' (bienvenida) o 'tracking' (rastreando)
  const [pantalla, setPantalla] = useState('welcome');

  // Hermandad seleccionada por el usuario (código de la hermandad)
  const [hermandadSeleccionada, setHermandadSeleccionada] = useState('');

  // Indica si el rastreo GPS está activo (true) o detenido (false)
  // NOTA: Este es el estado de React para actualizar la UI
  const [estaRastreando, setEstaRastreando] = useState(false);

  // Última ubicación GPS recibida (objeto con lat, lon, etc.)
  const [ultimaUbicacion, setUltimaUbicacion] = useState(null);

  // Mensaje de estado para mostrar al usuario (ej: "✓ Ubicación enviada")
  const [mensajeEstado, setMensajeEstado] = useState('');

  // Timestamp de la última conexión exitosa al servidor
  const [ultimaHoraConexion, setUltimaHoraConexion] = useState(null);

  // Controla si se muestra el panel de diagnóstico de permisos
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);

  // Último punto completo enviado (con todos los detalles)
  const [ultimoPuntoCompleto, setUltimoPuntoCompleto] = useState(null);

  // ============================================================================
  // ESTADOS INTERNOS Y LÓGICA DE RASTREO
  // ============================================================================
  // Estos estados manejan la lógica interna del GPS y envíos

  // ID del watcher de background geolocation (devuelto por addWatcher)
  const [idObservador, setIdObservador] = useState(null);

  // Array de consultas enviadas al servidor (para mostrar en logs)
  const [consultasEnviadas, setConsultasEnviadas] = useState([]);

  // Contador de segundos hasta el próximo envío (para UI)
  const [proximaActualizacionEn, setProximaActualizacionEn] = useState(0);

  // ============================================================================
  // REFERENCIAS (useRef)
  // ============================================================================
  // Las referencias persisten entre renders y NO causan re-renders al cambiar.
  // Son cruciales para callbacks asíncronos que necesitan valores actuales.

  // Timestamp del último envío exitoso (en milisegundos)
  const timestampUltimaActualizacionRef = useRef(0);

  // Referencia persistente al ID del watcher (sincronizada con idObservador)
  const idObservadorRef = useRef(null);

  // Bandera de bloqueo para evitar envíos concurrentes (race conditions)
  const estaProcesandoRef = useRef(false);

  // Timestamp del último log GPS (para throttling de logs)
  const timestampUltimoLogGpsRef = useRef(0);

  // Referencia absoluta del estado de rastreo (crítica para detener callbacks)
  // IMPORTANTE: Se usa en callbacks asíncronos donde el estado de React puede estar desactualizado
  const estaRastreandoRef = useRef(false);

  // Referencia al contenedor del mapa Leaflet
  const mapaRef = useRef(null);

  // Referencia a la hermandad seleccionada (sincronizada con hermandadSeleccionada)
  // TRUCO IMPORTANTE: Los callbacks de los plugins de Capacitor a veces pierden el contexto 
  // del estado de React debido a "cierres" (closures). Usamos un useRef para garantizar que 
  // dentro del callback del GPS SIEMPRE tengamos el valor más actual de la hermandad.
  const hermandadSeleccionadaRef = useRef(hermandadSeleccionada);

  // Mantener el ref sincronizado con el estado cada vez que cambie
  useEffect(() => {
    hermandadSeleccionadaRef.current = hermandadSeleccionada;
  }, [hermandadSeleccionada]);

  /**
   * EFECTO INICIAL: Restaurar estado guardado al montar el componente.
   * Permite que la app recuerde si estaba rastreando tras un reinicio del móvil o de la app.
   */
  useEffect(() => {
    const inicializar = async () => {
      const estadoGuardado = localStorage.getItem('ssm_tracking_state');
      if (estadoGuardado) {
        try {
          const {
            isTracking: estabaRastreando,
            selectedHermandad: hermandadGuardada,
            lastSuccess,
            lastPoint
          } = JSON.parse(estadoGuardado);

          if (estabaRastreando && hermandadGuardada) {
            setHermandadSeleccionada(hermandadGuardada);
            setEstaRastreando(true);
            if (lastSuccess) setUltimaHoraConexion(lastSuccess);
            if (lastPoint) setUltimoPuntoCompleto(lastPoint);

            // Reactivar el watcher nativo tras un segundo (tiempo para que el plugin esté listo)
            setTimeout(() => {
              console.log('Re-activando watcher nativo tras reinicio...');
              iniciarRastreo(true);
            }, 1000);

            setMensajeEstado('✓ Tracking restaurado');
            setPantalla('tracking');
          }
        } catch (error) {
          console.error('Error restaurando estado:', error);
          localStorage.removeItem('ssm_tracking_state');
        }
      }
    };
    inicializar();

    // v2.13: Escuchar cambios de estado de la app para reforzar el tracking
    const manejadorApp = App.addListener('appStateChange', ({ isActive }) => {
      console.log('Cambio de estado de la App. ¿Activa?', isActive);
      if (isActive) {
        agregarLogSegundoPlano(`📱 Aplicación reactivada (Primer Plano)`);
        setMensajeEstado('⚡ App reactivada - Sincronizando...');
      }
    });

    return () => {
      manejadorApp.then(h => h.remove());
    };
  }, []);

  /**
   * CONTADOR VISUAL: Actualiza cada segundo el tiempo restante para el próximo envío.
   * Sincroniza el contador visual de la interfaz con el intervalo real de envío.
   */
  useEffect(() => {
    let temporizador;
    if (estaRastreando) {
      temporizador = setInterval(() => {
        const ahora = Date.now();
        const transcurrido = ahora - timestampUltimaActualizacionRef.current;
        const restante = Math.max(0, Math.ceil((INTERVALO_ENVIO_MS - transcurrido) / 1000));
        setProximaActualizacionEn(restante);
      }, 1000);
    } else {
      setProximaActualizacionEn(0);
    }
    return () => clearInterval(temporizador);
  }, [estaRastreando]);


  /**
   * GEOCODING INVERSO: Obtiene la dirección legible (Calle, Número) a partir de coordenadas.
   * Utiliza la API de OpenStreetMap Nominatim.
   * IMPORTANTE: Se usa CapacitorHttp para evitar bloqueos del navegador en segundo plano.
   */
  const obtenerDireccionDesdeCoordenadas = async (latitude, longitude) => {
    try {
      agregarLogSegundoPlano(`🌐 Geocoding Nativo: ${latitude.toFixed(4)},${longitude.toFixed(4)}`);

      const respuesta = await CapacitorHttp.get({
        url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        headers: {
          'User-Agent': 'SSM Location App'
        }
      });

      const datos = respuesta.data;
      return datos.display_name || 'Dirección no disponible';
    } catch (error) {
      agregarLogSegundoPlano(`❌ Error Geocoding: ${error.message || 'Fallo desconocido'}`);
      console.error('Error obteniendo dirección:', error);
      return 'Dirección no disponible';
    }
  };

  // ============================================================================
  // LOGS DE SEGUNDO PLANO
  // ============================================================================
  // Sistema de diagnóstico para ver qué ocurre cuando la app está minimizada.
  const [logsSegundoPlano, setLogsSegundoPlano] = useState([]);

  /**
   * Agrega un mensaje al historial de logs y lo persiste en localStorage.
   */
  const agregarLogSegundoPlano = (msg) => {
    const hora = new Date().toLocaleTimeString();
    const mensajeCompleto = `[${hora}] ${msg}`;
    console.log(mensajeCompleto);

    // Actualizamos el estado para mostrarlo en la UI (limitado a 50 líneas)
    setLogsSegundoPlano(prev => [mensajeCompleto, ...prev].slice(0, 50));

    // Persistimos en localStorage para que sobreviva a reinicios
    try {
      const logsGuardados = JSON.parse(localStorage.getItem('ssm_bg_logs') || '[]');
      logsGuardados.unshift(mensajeCompleto);
      localStorage.setItem('ssm_bg_logs', JSON.stringify(logsGuardados.slice(0, 2000)));
    } catch (e) { }
  };

  /**
   * Carga los logs persistidos al iniciar la aplicación.
   */
  useEffect(() => {
    const guardados = localStorage.getItem('ssm_bg_logs');
    if (guardados) setLogsSegundoPlano(JSON.parse(guardados));
  }, []);

  /**
   * Limpia el historial de logs (tanto en UI como en almacenamiento).
   */
  const limpiarLogs = () => {
    localStorage.removeItem('ssm_bg_logs');
    setLogsSegundoPlano([]);
  };

  /**
   * Copia todos los logs acumulados al portapapeles.
   */
  const copiarLogs = () => {
    const texto = logsSegundoPlano.join('\n');
    navigator.clipboard.writeText(texto).then(() => {
      alert('Logs copiados al portapapeles');
    }).catch(err => {
      console.error('Error al copiar logs:', err);
    });
  };

  /**
   * Genera o recupera un ID de dispositivo único para esta instalación.
   */
  const obtenerIdDispositivo = () => {
    let id = localStorage.getItem('ssm_device_id');
    if (!id) {
      id = 'dev_' + Math.random().toString(36).substring(2, 8).toUpperCase();
      localStorage.setItem('ssm_device_id', id);
    }
    return id;
  };

  /**
   * ENVÍO A SERVIDOR: Transmite la ubicación GPS a la API externa.
   * Utiliza la capa nativa Android vía CapacitorHttp para máxima fiabilidad.
   */
  const enviarUbicacionAlServidor = async (latitude, longitude, hermandadCodigo, direccion) => {
    let payloadEnviado = null;
    let resultado = '';

    try {
      const datos = {
        key: import.meta.env.VITE_API_KEY || 'secret',
        device_id: obtenerIdDispositivo(),
        hermandad: hermandadCodigo,
        latitude: latitude,
        longitude: longitude,
        address: direccion
      };

      payloadEnviado = JSON.stringify(datos);
      console.log('Enviando datos (CapacitorHttp):', datos);
      agregarLogSegundoPlano(`📡 Intentando envío a servidor...`);

      const respuesta = await CapacitorHttp.post({
        url: import.meta.env.VITE_API_URL || 'http://gps.semanasantademerida.es/recibir_json.php',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: datos
      });

      if (respuesta.status >= 200 && respuesta.status < 300) {
        resultado = '✓ OK';
        const horaCnx = new Date().toLocaleTimeString();
        const estadoGuardado = JSON.parse(localStorage.getItem('ssm_tracking_state') || '{}');
        const puntoDetallado = {
          lat: latitude,
          lon: longitude,
          addr: direccion,
          time: horaCnx
        };

        setUltimaHoraConexion(horaCnx);
        setUltimoPuntoCompleto(puntoDetallado);

        localStorage.setItem('ssm_tracking_state', JSON.stringify({
          ...estadoGuardado,
          lastSuccess: horaCnx,
          lastPoint: puntoDetallado
        }));

        agregarLogSegundoPlano(`✓ Envío OK: ${respuesta.status}`);
      } else {
        resultado = '⚠ Error ' + respuesta.status;
        const msgErr = typeof respuesta.data === 'string' ? respuesta.data : JSON.stringify(respuesta.data);
        agregarLogSegundoPlano(`⚠ Error Servidor: ${respuesta.status} - ${msgErr}`);
        setMensajeEstado('⚠ Error servidor: ' + msgErr);
      }
    } catch (error) {
      resultado = '❌ Fallo';
      const msgRed = error.message || JSON.stringify(error);
      agregarLogSegundoPlano(`❌ Error Red: ${msgRed}`);
      setMensajeEstado('⚠ Error conexión: ' + msgRed);
    } finally {
      if (payloadEnviado) {
        const ahora = new Date();
        const fechaMsg = ahora.toISOString().slice(0, 19).replace('T', ' ');
        setConsultasEnviadas(prev => {
          const nuevaEntrada = { sql: payloadEnviado, time: fechaMsg, status: resultado };
          return [nuevaEntrada, ...prev].slice(0, 10);
        });
      }
    }
  };

  /**
   * INICIALIZAR MAPA: Configura Leaflet y coloca el marcador inicial.
   */
  const inicializarMapa = (latitude, longitude) => {
    if (!mapaRef.current || !window.L) return null;

    const L = window.L;
    const mapa = L.map(mapaRef.current).setView([latitude, longitude], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(mapa);

    const marcador = L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #DC2626; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(mapa);

    return { mapa, marcador };
  };

  /**
   * ACTUALIZAR MARCADOR: Reposiciona el punto en el mapa.
   */
  const actualizarMarcadorMapa = (mapa, marcador, latitude, longitude) => {
    if (mapa && marcador) {
      marcador.setLatLng([latitude, longitude]);
      mapa.setView([latitude, longitude], 16);
    }
  };

  /**
   * PROCESAR UBICACIÓN: Función central que coordina la recepción de datos GPS.
   */
  const procesarUbicacion = async (ubicacion) => {
    if (!estaRastreandoRef.current) return;
    if (estaProcesandoRef.current) return;
    estaProcesandoRef.current = true;

    try {
      const latitude = ubicacion.latitude || (ubicacion.coords && ubicacion.coords.latitude);
      const longitude = ubicacion.longitude || (ubicacion.coords && ubicacion.coords.longitude);

      if (latitude === undefined || longitude === undefined) return;

      setProximaActualizacionEn(60);

      const hermandadActual = hermandadSeleccionadaRef.current;
      const objH = hermandades.find(h => h.nombre === hermandadActual);
      const codigoH = objH ? objH.codigo : 'otros';

      if (!codigoH) return;

      setMensajeEstado('🌍 Buscando dirección...');
      const direccion = await obtenerDireccionDesdeCoordenadas(latitude, longitude);

      setUltimaUbicacion({ latitude, longitude, address: direccion });

      setMensajeEstado('📡 Enviando ubicación...');
      await enviarUbicacionAlServidor(latitude, longitude, codigoH, direccion);

      if (window.L && mapaRef.current) {
        if (!mapaRef.current._leaflet_id) {
          const res = inicializarMapa(latitude, longitude);
          if (res) {
            mapaRef.current._map = res.map;
            mapaRef.current._marker = res.marcador;
          }
        } else if (mapaRef.current._map && mapaRef.current._marker) {
          actualizarMarcadorMapa(mapaRef.current._map, mapaRef.current._marker, latitude, longitude);
        }
      }
    } catch (e) {
      console.error('Error procesando ubicación:', e);
      setMensajeEstado('⚠ Error procesando ubicación');
    } finally {
      estaProcesandoRef.current = false;
    }
  };

  /**
   * INICIO DEL RASTREO: Configura y arranca el plugin de background geolocation.
   * 
   * @param {boolean} esReconexion - Indica si es un reinicio automático tras cierre de la app.
   */
  const iniciarRastreo = async (esReconexion = false) => {
    // Determinamos qué hermandad usar (estado actual o referencia guardada)
    const hermandadParaUsar = esReconexion ? hermandadSeleccionadaRef.current : hermandadSeleccionada;

    if (!esReconexion) {
      limpiarLogs();
    }

    if (!hermandadParaUsar) {
      if (!esReconexion) setMensajeEstado('⚠ Selecciona una hermandad primero');
      return;
    }

    // v2.18: Asegurar que no hay procesos de rastreo previos activos
    if (idObservador || idObservadorRef.current) {
      await detenerRastreo(true); // Parada técnica silenciosa
    }

    try {
      if (!esReconexion) setMensajeEstado('📍 Solicitando permisos...');

      // --- PERMISOS NATIVOS (Imprescindibles en Android 13+) ---
      try {
        await BackgroundGeolocation.requestPermissions();
        await Geolocation.requestPermissions(); // Para el pull inicial manual
      } catch (e) {
        console.warn('Error solicitando permisos:', e);
      }

      estaProcesandoRef.current = false; // Reset de bloqueo de concurrencia
      setEstaRastreando(true);
      estaRastreandoRef.current = true; // Activar flag de referencia absoluta (v2.23)

      if (!esReconexion) setMensajeEstado('📍 Iniciando modo nativo...');

      // --- CONFIGURACIÓN DEL WATCHER NATIVO (EL MOTOR PRINCIPAL) ---
      // El watcher detecta cambios de ubicación y ejecuta el callback en segundo plano.
      const id = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: "Seguimiento en tiempo real activo (v2.24)",
          backgroundTitle: "SSM Location",
          requestPermissions: true,
          stale: false,
          distanceFilter: 0, // Recibir todas las actualizaciones posibles
        },
        async (ubicacion, error) => {
          if (error) {
            console.error('Error en el watcher nativo:', error);
            return;
          }

          if (ubicacion) {
            // v2.23/2.24 FIX: Si el rastreo se ha detenido, ignoramos el evento inmediatamente
            if (!estaRastreandoRef.current) return;
            if (!idObservadorRef.current) return;

            const ahora = Date.now();
            const transcurrido = ahora - timestampUltimaActualizacionRef.current;

            // Throttling de logs GPS: Solo mostramos información cada 10s o si toca envío
            const tiempoDesdeUltimoLogGps = ahora - timestampUltimoLogGpsRef.current;
            const deberiaLoguearGps = (transcurrido >= INTERVALO_ENVIO_MS || timestampUltimaActualizacionRef.current === 0 || tiempoDesdeUltimoLogGps >= 10000);

            if (deberiaLoguearGps) {
              agregarLogSegundoPlano(`📍 GPS Nativo: ${ubicacion.latitude.toFixed(5)},${ubicacion.longitude.toFixed(5)}`);
              timestampUltimoLogGpsRef.current = ahora;
            }

            // SISTEMA DE ENVÍO PERIÓDICO (Throttling a 60 segundos)
            if (transcurrido >= INTERVALO_ENVIO_MS || timestampUltimaActualizacionRef.current === 0) {
              timestampUltimaActualizacionRef.current = ahora; // Bloqueo de tiempo inmediato
              agregarLogSegundoPlano(`⚡ Disparando envío (Transcurrido: ${Math.round(transcurrido / 1000)}s)`);
              await procesarUbicacion(ubicacion);
            } else {
              // Actualizar solo el contador visual para el usuario
              const restante = Math.max(0, Math.ceil((INTERVALO_ENVIO_MS - transcurrido) / 1000));
              setProximaActualizacionEn(restante);
            }
          }
        }
      );

      setIdObservador(id);
      idObservadorRef.current = id;

      /**
       * PULL INICIAL: No esperamos a que el usuario se mueva. 
       * Solicitamos una ubicación inmediata para que el servidor tenga datos ya mismo.
       */
      setTimeout(async () => {
        try {
          const posicionCualquiera = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
          });
          if (posicionCualquiera && idObservadorRef.current && estaRastreandoRef.current) {
            timestampUltimaActualizacionRef.current = Date.now();
            await procesarUbicacion(posicionCualquiera);
          }
        } catch (e) {
          console.warn('Pull inicial manual falló, se esperará al watcher nativo.');
        }
      }, 1000);

      // Persistir estado elistado para que la app pueda recuperarse de cierres
      localStorage.setItem('ssm_tracking_state', JSON.stringify({
        isTracking: true,
        selectedHermandad: hermandadParaUsar,
        lastSuccess: ultimaHoraConexion,
        lastPoint: ultimoPuntoCompleto
      }));

    } catch (error) {
      console.error('Error iniciando rastreo:', error);
      setMensajeEstado('⚠ Error: ' + error.message);
      setEstaRastreando(false);
    }
  };

  /**
   * DETENER EL RASTREO: Limpia todos los procesos y la interfaz.
   * 
   * @param {boolean} mantenerEstado - Si es true, solo detiene el motor sin limpiar la UI.
   */
  const detenerRastreo = async (mantenerEstado = false) => {
    console.log('🛑 detenerRastreo LLAMADO - mantenerEstado:', mantenerEstado);
    agregarLogSegundoPlano('🛑 Iniciando detención del servicio...');

    // v2.24: BLOQUEO INMEDIATO - Crítico para evitar envíos residuales
    estaRastreandoRef.current = false;
    setEstaRastreando(false);

    try {
      if (idObservador || idObservadorRef.current) {
        const idParaRemover = idObservador || idObservadorRef.current;
        console.log('🔴 Removiendo watcher nativo ID:', idParaRemover);
        agregarLogSegundoPlano(`🔴 Removiendo idObservador ID: ${idParaRemover}`);

        await BackgroundGeolocation.removeWatcher({ id: idParaRemover });

        console.log('✅ Watcher removido correctamente');
        agregarLogSegundoPlano('✅ Watcher nativo removido');

        setIdObservador(null);
        idObservadorRef.current = null;
      }

      if (mantenerEstado) return;

      // Limpieza profunda de UI y almacenamiento
      console.log('🧹 Limpieza completa de estado...');
      agregarLogSegundoPlano('🧹 Limpiando estado completo...');

      localStorage.removeItem('ssm_tracking_state');
      setMensajeEstado('⏹ Tracking detenido');

      if (mapaRef.current && mapaRef.current._map) {
        mapaRef.current._map.remove();
        mapaRef.current._map = null;
        mapaRef.current._marker = null;
      }

      setUltimaUbicacion(null);
      setConsultasEnviadas([]);
      setMensajeEstado('');
      setUltimaHoraConexion(null);
      setUltimoPuntoCompleto(null);
      setProximaActualizacionEn(0);

      console.log('✅ Servicio detenido y limpiado');
      agregarLogSegundoPlano('✅ Servicio detenido completamente');
    } catch (error) {
      console.error('❌ Error deteniendo rastreo:', error);
      agregarLogSegundoPlano(`❌ Fallo al detener: ${error.message}`);
      setMensajeEstado('⚠ Error deteniendo rastreo');
      alert('Error al detener el servicio: ' + (error.message || 'Error desconocido'));
    }
  };

  /**
   * EFECTO: Carga de scripts de Leaflet para el mapa visual.
   */
  useEffect(() => {
    const cssLeaflet = document.createElement('link');
    cssLeaflet.rel = 'stylesheet';
    cssLeaflet.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(cssLeaflet);

    const jsLeaflet = document.createElement('script');
    jsLeaflet.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(jsLeaflet);

    return () => {
      if (idObservador) {
        BackgroundGeolocation.removeWatcher({ id: idObservador });
      }
      if (mapaRef.current && mapaRef.current._map) {
        mapaRef.current._map.remove();
      }
    };
  }, []);

  // --- RENDERIZADO: PANTALLA DE BIENVENIDA ---
  if (pantalla === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-8">
            <img
              src="appLogo.png"
              alt="SSM Location Logo"
              className="w-48 h-48 mx-auto mb-6 drop-shadow-xl animate-in fade-in zoom-in duration-700"
            />
            <h1 className="text-4xl font-bold text-red-600 mb-2">Semana Santa de Mérida</h1>
            <p className="text-2xl text-red-500">SSM Location</p>
          </div>

          <button
            onClick={() => setPantalla('tracking')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO: INTERFAZ PRINCIPAL DE RASTREO ---
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto">

        {/* PANEL DE DIAGNÓSTICO PARA SEGUNDO PLANO */}
        {mostrarDiagnostico && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="bg-red-600 p-6 text-white text-center">
                <img
                  src="appLogo.png"
                  alt="Logo"
                  className="w-16 h-16 mx-auto mb-4 brightness-0 invert opacity-90"
                />
                <div className="flex items-center justify-center gap-3 mb-2">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Guía de Segundo Plano</h3>
                </div>
                <p className="text-red-100 text-xs leading-relaxed">
                  Para evitar que el sistema detenga el rastreo al bloquear el móvil:
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">1</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Permiso de Ubicación</h4>
                    <p className="text-slate-500 text-[11px] leading-normal">
                      Ajustes &gt; Apps &gt; SSM Location &gt; Permisos &gt; Ubicación. Selecciona <b>"Permitir siempre"</b> o "todo el tiempo".
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">2</div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Optimización de Batería</h4>
                    <p className="text-slate-500 text-[11px] leading-normal">
                      Busca esta app en Ajustes de Batería y selecciona <b>"Sin restricciones"</b> o "No optimizar".
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setMostrarDiagnostico(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
                >
                  Entendido, ya lo he revisado
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="premium-card p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8">
          {/* Fondo Decorativo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-1 bg-white rounded-2xl shadow-lg border border-slate-100">
                <img src="appLogo.png" alt="Logo" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">SSM Location</h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">v{VERSION_APP}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  {estaRastreando && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">En Vivo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {estaRastreando && (
              <button
                onClick={() => setMostrarDiagnostico(true)}
                className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                title="Diagnóstico"
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="space-y-6 relative z-10">
            {/* Selector de Hermandad */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Hermandad Activa
              </label>
              <div className="relative group">
                <select
                  value={hermandadSeleccionada}
                  onChange={(e) => setHermandadSeleccionada(e.target.value)}
                  disabled={estaRastreando}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold p-4 pr-12 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                  <option value="">-- Seleccionar Cofradía --</option>
                  {hermandades.map((h, i) => (
                    <option key={i} value={h.nombre}>{h.nombre}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* BOTONES DE CONTROL */}
            <div className="pt-2">
              {!estaRastreando ? (
                <button
                  onClick={() => iniciarRastreo(false)}
                  disabled={!hermandadSeleccionada}
                  className="w-full btn-tracking bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 px-8 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-200"
                >
                  <Play className="w-6 h-6" fill="currentColor" />
                  Iniciar Seguimiento
                </button>
              ) : (
                <button
                  onClick={() => detenerRastreo(false)}
                  className="w-full btn-tracking bg-slate-800 hover:bg-slate-900 text-white font-bold py-5 px-8 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl"
                >
                  <Square className="w-6 h-6" fill="white" />
                  Detener Servicio
                </button>
              )}
            </div>

            {/* CONTADORES Y ESTADÍSTICAS */}
            {estaRastreando && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Próximo Turno</span>
                  <span className="text-xl font-black text-slate-700">{proximaActualizacionEn}<span className="text-xs ml-0.5">s</span></span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Último Envío</span>
                  <span className="text-sm font-black text-emerald-600">{ultimaHoraConexion || "--:--:--"}</span>
                </div>
              </div>
            )}

            {/* Banner de Modo Híbrido */}
            {estaRastreando && (
              <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-center gap-2 border border-emerald-100">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                  Transmisión Híbrida Activa
                </p>
              </div>
            )}

            {/* MENSAJES DE ESTADO */}
            {estaRastreando && mensajeEstado && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm status-badge">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                  <p className="text-xs font-bold text-slate-600 line-clamp-1">{mensajeEstado}</p>
                </div>
              </div>
            )}

            {/* MAPA Y ÚLTIMO PUNTO REPORTADO */}
            {estaRastreando && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100 h-64 border-t-4 border-t-red-600">
                  <div ref={mapaRef} className="w-full h-full"></div>
                </div>

                {ultimaUbicacion && (
                  <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Ubicación Actual</span>
                      <span className="text-[10px] font-bold text-red-500 uppercase">{hermandadSeleccionada}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-3 leading-relaxed">
                      {ultimaUbicacion.address}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* LOGS DE DIAGNÓSTICO */}
            {estaRastreando && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Consola de Diagnóstico</p>
                  <div className="flex gap-4">
                    <button onClick={copiarLogs} className="text-[9px] text-emerald-600 font-bold uppercase transition-colors hover:text-emerald-700">Copiar</button>
                    <button onClick={limpiarLogs} className="text-[9px] text-red-400 font-bold uppercase transition-colors hover:text-red-600">Borrar</button>
                  </div>
                </div>
                <div className="bg-slate-900 text-slate-400 p-4 rounded-2xl font-mono text-[9px] h-48 overflow-y-auto border border-slate-800 shadow-2xl">
                  {logsSegundoPlano.length === 0 && <p className="text-slate-700 italic text-center py-8">Esperando eventos del GPS...</p>}
                  {logsSegundoPlano.map((log, i) => (
                    <div key={i} className="mb-1.5 border-b border-slate-800/50 pb-1 last:border-0">{log}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LOG DE PETICIONES HTTP */}
          {estaRastreando && consultasEnviadas.length > 0 && (
            <div className="mt-8 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Historial de Transmisiones</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {consultasEnviadas.map((q, i) => (
                  <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[9px] font-bold text-slate-400">{q.time}</span>
                      <span className={`text-[9px] font-black uppercase ${q.status.includes('✓') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {q.status}
                      </span>
                    </div>
                    <code className="text-[9px] text-slate-400 break-all block font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {q.sql}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
  
  body {
    background-color: #f1f5f9;
    margin: 0;
    font-family: 'Inter', sans-serif;
  }
  .premium-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 2.5rem;
    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.05), 0 8px 10px -6px rgb(0 0 0 / 0.05);
  }
  .animate-in {
    animation-duration: 0.3s;
    animation-fill-mode: both;
  }
  .fade-in {
    animation-name: fadeIn;
  }
  .zoom-in-95 {
    animation-name: zoomIn;
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes zoomIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  .btn-tracking {
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  .btn-tracking:active {
    transform: scale(0.94);
  }
  .status-badge {
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .leaflet-container {
    filter: saturate(1.2);
    border-radius: 1rem;
  }
`;

if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}