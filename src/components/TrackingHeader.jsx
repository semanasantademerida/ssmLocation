/**
 * SSM LOCATION - COMPONENTE: CABECERA DE SEGUIMIENTO
 * 
 * Muestra el logotipo, la versión de la app y el estado actual del servicio 
 * (si está rastreando o no). También incluye el botón de acceso al diagnóstico.
 * 
 * @param {Object} props
 * @param {boolean} props.estaRastreando - Si el motor de GPS está activo ahora mismo.
 * @param {string} props.version - Número de versión de la aplicación.
 * @param {Function} props.alAbrirDiagnostico - Función para mostrar el modal de ayuda.
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

const TrackingHeader = ({ estaRastreando, version, alAbrirDiagnostico }) => {
    return (
        <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
                {/* Miniatura del Logo: Diseño limpio sin sombras elevadas */}
                <div className="p-1 bg-white rounded-2xl border border-slate-100">
                    <img src="appLogo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>

                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-1">
                        SSM Location
                    </h1>
                    <div className="flex items-center gap-2">
                        {/* Indicador de Versión */}
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                            v{version}
                        </span>

                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>

                        {/* Indicador de Estado En Vivo (Animado) */}
                        {estaRastreando && (
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                    En Vivo
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Acceso a Guía de Segundo Plano (solo visible cuando se rastrea) */}
            {estaRastreando && (
                <button
                    onClick={alAbrirDiagnostico}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                    title="Guía de permisos"
                >
                    <ShieldCheck className="w-5 h-5" />
                </button>
            )}
        </div>
    );
};

export default TrackingHeader;
