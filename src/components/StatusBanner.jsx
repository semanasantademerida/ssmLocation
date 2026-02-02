/**
 * SSM LOCATION - COMPONENTE: BANNER DE ESTADO
 * 
 * Muestra información cualitativa sobre el estado del sistema:
 * - Indicador de "Transmisión Híbrida" (animado).
 * - Mensajes de progreso o error de la API.
 * 
 * @param {Object} props
 * @param {string} props.mensaje - Texto descriptivo de la acción actual.
 */

import React from 'react';

const StatusBanner = ({ mensaje }) => {
    return (
        <div className="space-y-3">
            {/* Indicador visual de modo híbrido activo */}
            <div className="bg-emerald-50 rounded-xl p-3 flex items-center justify-center gap-2 border border-emerald-100">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                    Transmisión Híbrida Activa
                </p>
            </div>

            {/* Mensaje de estado dinámico (ej: 'Enviando ubicación...') */}
            {mensaje && (
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm status-badge">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                        <p className="text-xs font-bold text-slate-600 line-clamp-1">
                            {mensaje}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusBanner;
