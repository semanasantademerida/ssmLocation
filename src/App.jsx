/**
 * ============================================================================
 * SSM LOCATION APP - ORQUESTADOR PRINCIPAL
 * ============================================================================
 * 
 * Esta aplicación gestiona el seguimiento GPS en segundo plano de las 
 * Hermandades de la Semana Santa de Mérida.
 * 
 * Arquitectura: Modular v2.33
 * Autor: Rubén D. Mancera Morán
 * 
 * Este archivo coordina el estado global, los motores nativos de Capacitor
 * y los componentes visuales extraídos.
 */

import React, { useState, useEffect, useRef } from 'react';
import { registerPlugin } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';

// --- SERVICIOS Y UTILIDADES ---
import { HERMANDADES, VERSION_APP, INTERVALO_ENVIO_MS, INTERVALO_CHEQUEO_GPS_MS, UMBRAL_DISTANCIA_METROS } from './utils/constants';
import { obtenerIdDispositivo } from './utils/deviceUtils';
import { calcularDistanciaMetros } from './utils/distanceUtils';
import { obtenerDireccionDesdeCoordenadas, enviarUbicacionAlServidor } from './services/apiService';
import { inicializarMapa, actualizarMarcadorMapa } from './services/mapService';

// --- COMPONENTES DE INTERFAZ ---
import WelcomeScreen from './components/WelcomeScreen';
import TrackingHeader from './components/TrackingHeader';
import HermandadSelector from './components/HermandadSelector';
import ControlButtons from './components/ControlButtons';
import StatsGrid from './components/StatsGrid';
import StatusBanner from './components/StatusBanner';
import MapDisplay from './components/MapDisplay';
import DiagnosticConsole from './components/DiagnosticConsole';
import DiagnosticModal from './components/DiagnosticModal';

// Plugin de geolocalización en segundo plano (Crítico)
const BackgroundGeolocation = registerPlugin('BackgroundGeolocation');

function SSMLocationApp() {
  // --- ESTADOS DE LA APLICACIÓN ---
  const [pantalla, setPantalla] = useState('welcome');
  const [hermandadSeleccionada, setHermandadSeleccionada] = useState('');
  const [estaRastreando, setEstaRastreando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('');

  // Datos de telemetría y UI
  const [ultimaUbicacion, setUltimaUbicacion] = useState(null);
  const [proximaActualizacionEn, setProximaActualizacionEn] = useState(60);
  const [ultimaHoraConexion, setUltimaHoraConexion] = useState('');
  const [logsSegundoPlano, setLogsSegundoPlano] = useState([]);
  const [consultasEnviadas, setConsultasEnviadas] = useState([]);
  const [mostrarDiagnostico, setMostrarDiagnostico] = useState(false);

  // --- REFERENCIAS (Para persistencia en callbacks de segundo plano) ---
  const idObservadorRef = useRef(null);
  const estaRastreandoRef = useRef(false);
  const hermandadSeleccionadaRef = useRef('');
  const mapaRef = useRef(null);
  const timestampUltimaActualizacionRef = useRef(0);
  const timestampUltimoChequeoGPSRef = useRef(0); // v2.29: Control de latido cada 20s
  const ultimaPosEnviadaRef = useRef(null); // v2.28: Persistencia de última posición para cálculo de 15m
  const estaProcesandoRef = useRef(false);

  // Sincronizar referencias con estados reactivos
  useEffect(() => { hermandadSeleccionadaRef.current = hermandadSeleccionada; }, [hermandadSeleccionada]);
  useEffect(() => { estaRastreandoRef.current = estaRastreando; }, [estaRastreando]);

  /**
   * EFECTO DE INICIALIZACIÓN: Recupera estados persistidos al abrir la app.
   */
  useEffect(() => {
    // Cargar Leaflet dinámicamente si no está presente
    if (!window.L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      document.head.appendChild(script);
    }

    const recuperado = localStorage.getItem('ssm_tracking_state');
    const logsGuardados = localStorage.getItem('ssm_logs');

    if (logsGuardados) setLogsSegundoPlano(JSON.parse(logsGuardados));

    if (recuperado) {
      const estado = JSON.parse(recuperado);
      setHermandadSeleccionada(estado.hermandad);
      setPantalla('tracking');
      // Si el estado dice que estaba rastreando, intentamos reconectar
      if (estado.activo) iniciarRastreo(true);
    }

    // Listener de estado nativo
    const handler = App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        agregarLog(`📱 Aplicación reactivada (Resumed)`);
      }
    });

    return () => {
      handler.then(h => h.remove());
    };
  }, []);

  /**
   * EFECTO DE CONTADOR FLUIDO: Independiente del sensor GPS.
   */
  useEffect(() => {
    let intervalo;
    if (estaRastreando) {
      intervalo = setInterval(() => {
        setProximaActualizacionEn(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [estaRastreando]);

  // --- FUNCIONES DE LOGS ---
  const agregarLog = (msg) => {
    const nuevoLog = `[${new Date().toLocaleTimeString()}] ${msg}`;
    setLogsSegundoPlano(prev => {
      const actualizados = [nuevoLog, ...prev].slice(0, 100);
      localStorage.setItem('ssm_logs', JSON.stringify(actualizados));
      return actualizados;
    });
  };

  const limpiarLogs = () => {
    setLogsSegundoPlano([]);
    setConsultasEnviadas([]);
    localStorage.removeItem('ssm_logs');
  };

  const copiarLogs = () => {
    const texto = logsSegundoPlano.join('\n');
    navigator.clipboard.writeText(texto);
    setMensajeEstado('📋 Logs copiados');
  };

  /**
   * PROCESAR UBICACIÓN: Lógica central de envío y actualización.
   */
  const procesarUbicacion = async (ubicacion) => {
    if (estaProcesandoRef.current) return;
    estaProcesandoRef.current = true;

    try {
      const latitude = ubicacion.latitude || (ubicacion.coords && ubicacion.coords.latitude);
      const longitude = ubicacion.longitude || (ubicacion.coords && ubicacion.coords.longitude);

      if (latitude === undefined || longitude === undefined) return;

      const codigoH = HERMANDADES.find(h => h.nombre === hermandadSeleccionadaRef.current)?.codigo || 'otros';

      setMensajeEstado('🌍 Buscando dirección...');
      const direccion = await obtenerDireccionDesdeCoordenadas(latitude, longitude);
      setUltimaUbicacion({ latitude, longitude, address: direccion });

      setMensajeEstado('📡 Enviando ubicación...');
      const resultado = await enviarUbicacionAlServidor(latitude, longitude, codigoH, direccion);

      setConsultasEnviadas(prev => [resultado, ...prev].slice(0, 20));
      if (resultado.exito) {
        setUltimaHoraConexion(resultado.time);
        agregarLog(`✓ Envío OK: ${resultado.status}`);
      } else {
        agregarLog(`⚠ Fallo envío: ${resultado.status}`);
      }

      // Actualizar Mapa Visual si existe
      if (mapaRef.current) {
        if (!mapaRef.current._mapInstance) {
          const inst = inicializarMapa(mapaRef.current, latitude, longitude);
          if (inst) mapaRef.current._mapInstance = inst;
        } else {
          actualizarMarcadorMapa(mapaRef.current._mapInstance.map, mapaRef.current._mapInstance.marcador, latitude, longitude);
        }
      }
    } catch (e) {
      agregarLog(`⚠ Error: ${e.message}`);
    } finally {
      estaProcesandoRef.current = false;
    }
  };

  /**
   * MOTOR DE RASTREO: Control de inicio y parada nativos.
   */
  const iniciarRastreo = async (esReconexion = false) => {
    let hNombre = esReconexion ? hermandadSeleccionadaRef.current : hermandadSeleccionada;

    // Fallback para reconexión: Si el ref aún no se ha sincronizado, leemos de storage
    if (esReconexion && !hNombre) {
      const backup = localStorage.getItem('ssm_tracking_state');
      if (backup) {
        hNombre = JSON.parse(backup).hermandad;
      }
    }

    if (!hNombre) return;

    try {
      if (!esReconexion) {
        limpiarLogs();
        setMensajeEstado('📍 Solicitando permisos...');
        await BackgroundGeolocation.requestPermissions();
        await Geolocation.requestPermissions();
      }

      setEstaRastreando(true);
      setMensajeEstado('📍 Iniciando modo nativo...');

      const id = await BackgroundGeolocation.addWatcher(
        {
          backgroundMessage: `Seguimiento en tiempo real activo (v${VERSION_APP})`,
          backgroundTitle: "SSM Location",
          requestPermissions: true,
          stale: false,
          distanceFilter: 0,
        },
        async (ubi, err) => {
          if (err || !ubi || !estaRastreandoRef.current) return;

          const ahora = Date.now();
          const transcurridoEnvio = ahora - timestampUltimaActualizacionRef.current;
          const transcurridoChequeo = ahora - timestampUltimoChequeoGPSRef.current;

          // REGULACIÓN (Throttling) v2.29: Solo procesamos si han pasado 20s o es el primer latido
          if (transcurridoChequeo < INTERVALO_CHEQUEO_GPS_MS && timestampUltimoChequeoGPSRef.current !== 0) {
            return;
          }

          timestampUltimoChequeoGPSRef.current = ahora;

          // Cálculo de distancia recorrida (v2.28)
          let distanciaRecorrida = 0;
          if (ultimaPosEnviadaRef.current) {
            distanciaRecorrida = calcularDistanciaMetros(
              ultimaPosEnviadaRef.current.latitude,
              ultimaPosEnviadaRef.current.longitude,
              ubi.latitude,
              ubi.longitude
            );
          }

          // Log de latido GPS (Ahora será exactamente cada 20s)
          agregarLog(`📍 GPS Nativo: ${ubi.latitude.toFixed(5)},${ubi.longitude.toFixed(5)}${distanciaRecorrida > 0 ? ` (+${distanciaRecorrida}m)` : ''}`);

          // LÓGICA HÍBRIDA: Tiempo (60s) O Distancia (15m)
          const tocaPorTiempo = transcurridoEnvio >= INTERVALO_ENVIO_MS;
          const tocaPorDistancia = distanciaRecorrida >= UMBRAL_DISTANCIA_METROS;

          if (tocaPorTiempo || tocaPorDistancia || timestampUltimaActualizacionRef.current === 0) {
            const motivo = tocaPorDistancia ? `Movimiento (${distanciaRecorrida}m)` : 'Tiempo (60s)';
            timestampUltimaActualizacionRef.current = ahora;
            ultimaPosEnviadaRef.current = ubi;

            agregarLog(`⚡ Disparando envío: ${motivo}`);
            setProximaActualizacionEn(60); // Resetear contador al disparar envío
            await procesarUbicacion(ubi);
          }
        }
      );

      idObservadorRef.current = id;
      localStorage.setItem('ssm_tracking_state', JSON.stringify({ activo: true, hermandad: hNombre }));

      // Pull inicial
      setTimeout(async () => {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        if (pos && estaRastreandoRef.current) await procesarUbicacion(pos);
      }, 1000);

    } catch (e) {
      setMensajeEstado('⚠ Error al iniciar seguimiento');
      agregarLog(`Error: ${e.message}`);
    }
  };

  const detenerRastreo = async () => {
    if (idObservadorRef.current) {
      await BackgroundGeolocation.removeWatcher({ id: idObservadorRef.current });
      idObservadorRef.current = null;
    }
    setEstaRastreando(false);
    setMensajeEstado('Seguimiento detenido');
    localStorage.setItem('ssm_tracking_state', JSON.stringify({ activo: false, hermandad: hermandadSeleccionada }));
  };

  // --- RENDERIZADO ---
  if (pantalla === 'welcome') {
    return <WelcomeScreen alContinuar={() => setPantalla('tracking')} version={VERSION_APP} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-md mx-auto">

        <DiagnosticModal
          visible={mostrarDiagnostico}
          alCerrar={() => setMostrarDiagnostico(false)}
        />

        <div className="premium-card p-6 md:p-8 shadow-2xl relative overflow-hidden mb-8">
          {/* Elementos decorativos de fondo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-600/5 rounded-full blur-3xl"></div>

          <TrackingHeader
            estaRastreando={estaRastreando}
            version={VERSION_APP}
            alAbrirDiagnostico={() => setMostrarDiagnostico(true)}
          />

          <div className="space-y-6 relative z-10">
            <HermandadSelector
              seleccionada={hermandadSeleccionada}
              alCambiar={setHermandadSeleccionada}
              bloqueado={estaRastreando}
              listado={HERMANDADES}
            />

            <ControlButtons
              estaRastreando={estaRastreando}
              alIniciar={() => iniciarRastreo(false)}
              alDetener={detenerRastreo}
              puedeIniciar={hermandadSeleccionada !== ''}
            />

            {estaRastreando && (
              <>
                <StatsGrid
                  proximaActualizacionEn={proximaActualizacionEn}
                  ultimaHoraConexion={ultimaHoraConexion}
                />
                <StatusBanner mensaje={mensajeEstado} />
                <MapDisplay
                  mapaRef={mapaRef}
                  ultimaUbicacion={ultimaUbicacion}
                  hermandadNombre={hermandadSeleccionada}
                />
                <DiagnosticConsole
                  logs={logsSegundoPlano}
                  consultas={consultasEnviadas}
                  alCopiar={copiarLogs}
                  alLimpiar={limpiarLogs}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SSMLocationApp;