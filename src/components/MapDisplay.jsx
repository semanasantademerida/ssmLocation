/**
 * SSM LOCATION - COMPONENTE: VISUALIZADOR DE MAPA
 * 
 * Este componente renderiza el contenedor donde Leaflet dibuja el mapa
 * y también muestra la dirección física actual de la hermandad.
 * 
 * @param {Object} props
 * @param {React.MutableRefObject} props.mapaRef - Referencia al div del mapa.
 * @param {Object} props.ultimaUbicacion - Datos de lat, lon y dirección.
 * @param {string} props.hermandadNombre - Nombre de la hermandad que se sigue.
 */

import React from 'react';

const MapDisplay = ({ mapaRef, ultimaUbicacion, hermandadNombre }) => {
    return (
        <div className="space-y-4 pt-2">
            {/* Contenedor Nativo para Leaflet */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100 h-64 border-t-4 border-t-red-600">
                <div ref={mapaRef} className="w-full h-full"></div>
            </div>

            {/* Texto de ubicación legible (Dirección) */}
            {ultimaUbicacion && (
                <div className="bg-slate-100/50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Ubicación Actual
                        </span>
                        <span className="text-[10px] font-bold text-red-500 uppercase">
                            {hermandadNombre}
                        </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium mb-1 leading-relaxed">
                        {ultimaUbicacion.address}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                        GPS: {ultimaUbicacion.latitude.toFixed(5)}, {ultimaUbicacion.longitude.toFixed(5)}
                    </p>
                </div>
            )}
        </div>
    );
};

export default MapDisplay;
