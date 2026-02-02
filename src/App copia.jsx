import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Play, Square, ChevronDown } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';

const hermandades = [
  { nombre: 'Las Lágrimas', codigo: 'lagrimas' },
  { nombre: 'Sagrada Cena', codigo: 'cena' },
  { nombre: 'Tres Caídas', codigo: 'trescaidas' },
  { nombre: 'Veracruz', codigo: 'veracruz' },
  { nombre: 'La Paz', codigo: 'lapaz' },
  { nombre: 'Infantil', codigo: 'infantil' },
  { nombre: 'Nazareno', codigo: 'castillos' },
  { nombre: 'Calvario', codigo: 'calvario' },
  { nombre: 'Santa Eulalia', codigo: 'santaeulalia' },
  { nombre: 'Otros', codigo: 'otros' }
];

export default function SSMLocationApp() {
  const [screen, setScreen] = useState('welcome');
  const [selectedHermandad, setSelectedHermandad] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [watchId, setWatchId] = useState(null);
  const [sentQueries, setSentQueries] = useState([]);
  const mapRef = useRef(null);

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SSM Location App'
          }
        }
      );
      const data = await response.json();
      return data.display_name || 'Dirección no disponible';
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      return 'Dirección no disponible';
    }
  };

  const sendLocationToServer = async (latitude, longitude, hermandadCodigo, address) => {
    let sqlQuery = '';
    let status = '';
    try {
      const now = new Date();
      const fecha = now.toISOString().slice(0, 19).replace('T', ' ');
      
      //Ejemplo Query que funciona: INSERT INTO location VALUES("test001", "2025-12-26 13:15:00", 38.9170, -6.3430, "Plaza de España, Mérida", "Trescaidas")
      sqlQuery = `INSERT INTO location VALUES("123456", "${fecha}", ${latitude}, ${longitude}, "${address.replace(/"/g, '\\"').replace(/'/g, "\\'")}","${hermandadCodigo}")`;
      
      console.log('SQL ENVIADO:', sqlQuery);
      console.log('URL:', 'https://gps.semanasantademerida.es/recibir.php');
      console.log('POST data:', `query=${encodeURIComponent(sqlQuery)}&key=secret`);

      const response = await fetch('https://gps.semanasantademerida.es/recibir.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json, text/plain, */*',
        },
        body: `key=${encodeURIComponent('secret')}&query=${encodeURIComponent(sqlQuery)}`
      });

      const responseText = await response.text();
      console.log('Respuesta del servidor:', responseText);

      if (response.ok) {
        status = '✓ OK';
        setStatusMessage('✓ Ubicación enviada correctamente');
      } else {
        status = '⚠ Error ' + response.status;
        setStatusMessage('⚠ Error al enviar ubicación (código: ' + response.status + ')');
      }
    } catch (error) {
      status = '❌ Sin conexión';
      setStatusMessage('⚠ Error de conexión: ' + error.message);
      console.error('Error:', error);
      console.error('SQL QUE FALLÓ:', sqlQuery);
    } finally {
      // SIEMPRE añadir al historial, haya o no error
      if (sqlQuery) {
        const now = new Date();
        const fecha = now.toISOString().slice(0, 19).replace('T', ' ');
        setSentQueries(prev => {
          const newQueries = [{ sql: sqlQuery, time: fecha, status }, ...prev];
          return newQueries.slice(0, 10); // Mantener últimos 10
        });
      }
    }
  };

  const initMap = (latitude, longitude) => {
    if (!mapRef.current || !window.L) return null;

    const L = window.L;
    const map = L.map(mapRef.current).setView([latitude, longitude], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([latitude, longitude], {
      icon: L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #DC2626; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(map);

    return { map, marker };
  };

  const updateMapMarker = (map, marker, latitude, longitude) => {
    if (map && marker) {
      marker.setLatLng([latitude, longitude]);
      map.setView([latitude, longitude], 16);
    }
  };

  const processLocation = async (position, hermandadCodigo) => {
    try {
      const { latitude, longitude } = position.coords;
      
      const address = await getAddressFromCoords(latitude, longitude);
      setLastLocation({ latitude, longitude, address });
      
      await sendLocationToServer(latitude, longitude, hermandadCodigo, address);

      if (window.L && mapRef.current) {
        if (!mapRef.current._leaflet_id) {
          const result = initMap(latitude, longitude);
          if (result) {
            mapRef.current._map = result.map;
            mapRef.current._marker = result.marker;
          }
        } else if (mapRef.current._map && mapRef.current._marker) {
          updateMapMarker(mapRef.current._map, mapRef.current._marker, latitude, longitude);
        }
      }
    } catch (error) {
      console.error('Error procesando ubicación:', error);
      setStatusMessage('⚠ Error procesando ubicación');
    }
  };

  const startTracking = async () => {
    if (!selectedHermandad) {
      setStatusMessage('⚠ Selecciona una hermandad primero');
      return;
    }

    try {
      setStatusMessage('📍 Solicitando permisos...');
      
      const permission = await Geolocation.checkPermissions();
      console.log('Permisos actuales:', permission);
      
      if (permission.location !== 'granted') {
        const request = await Geolocation.requestPermissions();
        if (request.location !== 'granted') {
          setStatusMessage('⚠ Permisos de ubicación denegados');
          return;
        }
      }

      setIsTracking(true);
      setStatusMessage('📍 Iniciando tracking...');

      const hermandadObj = hermandades.find(h => h.nombre === selectedHermandad);
      const hermandadCodigo = hermandadObj ? hermandadObj.codigo : 'otros';

      // Obtener ubicación inicial inmediatamente
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        
        await processLocation(position, hermandadCodigo);
        setStatusMessage('✓ Tracking iniciado correctamente');
      } catch (error) {
        console.error('Error obteniendo ubicación inicial:', error);
        setStatusMessage('⚠ Error obteniendo ubicación: ' + error.message);
      }

      // Configurar watchPosition para actualizaciones continuas
      const id = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        },
        (position, err) => {
          if (err) {
            console.error('Error en watchPosition:', err);
            setStatusMessage('⚠ Error: ' + err.message);
            return;
          }
          if (position) {
            processLocation(position, hermandadCodigo);
          }
        }
      );
      
      setWatchId(id);
      
    } catch (error) {
      console.error('Error iniciando tracking:', error);
      setStatusMessage('⚠ Error: ' + error.message);
      setIsTracking(false);
    }
  };

  const stopTracking = async () => {
    try {
      if (watchId) {
        await Geolocation.clearWatch({ id: watchId });
        setWatchId(null);
      }
      
      setIsTracking(false);
      setStatusMessage('⏹ Tracking detenido');

      if (mapRef.current && mapRef.current._map) {
        mapRef.current._map.remove();
        mapRef.current._map = null;
        mapRef.current._marker = null;
      }

      setLastLocation(null);
      setSentQueries([]); // Limpiar queries al detener
    } catch (error) {
      console.error('Error deteniendo tracking:', error);
      setStatusMessage('⚠ Error deteniendo tracking');
    }
  };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(script);

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
      if (mapRef.current && mapRef.current._map) {
        mapRef.current._map.remove();
      }
    };
  }, []);

  if (screen === 'welcome') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="mb-8">
            <MapPin className="w-24 h-24 text-red-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-red-600 mb-2">Semana Santa de Mérida</h1>
            <p className="text-2xl text-red-500">SSM Location</p>
          </div>
          
          <button
            onClick={() => setScreen('tracking')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Continuar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border-2 border-red-200 shadow-lg">
          <h2 className="text-3xl font-bold text-red-600 mb-2 text-center">Geolocalización Activa</h2>
          <p className="text-red-400 text-center mb-8">Semana Santa de Mérida</p>

          <div className="mb-6">
            <label className="block text-red-600 font-bold mb-2">
              Selecciona Hermandad:
            </label>
            <div className="relative">
              <select
                value={selectedHermandad}
                onChange={(e) => setSelectedHermandad(e.target.value)}
                disabled={isTracking}
                className="w-full bg-white border-2 border-red-300 text-red-600 font-medium p-4 rounded-lg appearance-none cursor-pointer focus:outline-none focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Selecciona una hermandad --</option>
                {hermandades.map((hermandad, index) => (
                  <option key={index} value={hermandad.nombre}>
                    {hermandad.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-600 pointer-events-none" />
            </div>
            {isTracking && (
              <p className="text-red-400 text-sm mt-2">
                ℹ️ Detén el tracking para cambiar de hermandad
              </p>
            )}
          </div>

          <div className="flex justify-center mb-6">
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={!selectedHermandad}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-6 px-12 rounded-lg text-xl flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Play className="w-8 h-8" fill="white" />
                Iniciar Tracking
              </button>
            ) : (
              <button
                onClick={stopTracking}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-12 rounded-lg text-xl flex items-center gap-3 transition-all transform hover:scale-105 shadow-lg"
              >
                <Square className="w-8 h-8" fill="white" />
                Detener Tracking
              </button>
            )}
          </div>

          {statusMessage && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-600 text-center font-medium">{statusMessage}</p>
            </div>
          )}

          {isTracking && (
            <div className="mb-4">
              {/* Historial de queries enviadas */}
              {sentQueries.length > 0 && (
                <div className="mb-4 bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Queries enviadas (últimas 10):</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {sentQueries.map((query, index) => (
                      <div key={index} className="text-xs bg-white p-2 rounded border border-gray-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-500">{query.time}</span>
                          <span className={`font-bold ${query.status.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                            {query.status}
                          </span>
                        </div>
                        <code className="text-gray-700 break-all block">{query.sql}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Mapa */}
              <div 
                ref={mapRef}
                className="w-full h-64 rounded-lg border-2 border-red-300 overflow-hidden"
              ></div>
            </div>
          )}

          {lastLocation && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 space-y-2">
              <h3 className="text-red-600 font-bold mb-2">Última ubicación enviada:</h3>
              <p className="text-red-500 text-sm">
                <strong>Hermandad:</strong> {selectedHermandad}
              </p>
              <p className="text-red-500 text-sm">
                <strong>Dirección:</strong> {lastLocation.address}
              </p>
              <p className="text-red-500 text-sm">
                <strong>Latitud:</strong> {lastLocation.latitude.toFixed(6)}
              </p>
              <p className="text-red-500 text-sm">
                <strong>Longitud:</strong> {lastLocation.longitude.toFixed(6)}
              </p>
            </div>
          )}

          {isTracking && (
            <div className="mt-6 text-center">
              <div className="inline-block">
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Tracking en progreso</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-red-400 text-sm">
          <p>⚠️ Mantén la app abierta para garantizar el envío continuo</p>
        </div>
      </div>
    </div>
  );
}