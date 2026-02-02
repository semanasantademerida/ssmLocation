/**
 * SSM LOCATION - COMPONENTE: REJILLA DE ESTADÍSTICAS
 * 
 * Muestra información cuantitativa sobre el rastreo en tiempo real:
 * - Tiempo restante para la próxima transmisión.
 * - Hora del último envío exitoso.
 * 
 * @param {Object} props
 * @param {number} props.proximaActualizacionEn - Segundos restantes.
 * @param {string} props.ultimaHoraConexion - Timestamp legible del último envío.
 */

import React from 'react';

const StatsGrid = ({ proximaActualizacionEn, ultimaHoraConexion }) => {
    return (
        <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Próximo Turno
                </span>
                <span className="text-xl font-black text-slate-700">
                    {proximaActualizacionEn}<span className="text-xs ml-0.5">s</span>
                </span>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Último Envío
                </span>
                <span className="text-sm font-black text-emerald-600">
                    {ultimaHoraConexion || "--:--:--"}
                </span>
            </div>
        </div>
    );
};

export default StatsGrid;
