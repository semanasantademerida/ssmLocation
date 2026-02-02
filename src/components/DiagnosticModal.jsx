/**
 * SSM LOCATION - COMPONENTE: MODAL DE DIAGNÓSTICO (GUÍA)
 * 
 * Este modal explica visualmente al usuario cómo configurar su móvil Android 
 * para que el rastreo no se detenga en segundo plano. 
 * Es vital para el correcto funcionamiento del sistema.
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Si el modal debe mostrarse.
 * @param {Function} props.alCerrar - Función para ocultar el modal.
 */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

const DiagnosticModal = ({ visible, alCerrar }) => {
    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Cabecera del Modal con Logo Oficial Integrado */}
                <div className="bg-red-600 p-6 text-white text-center">
                    <img
                        src="appLogo.png"
                        alt="Logo"
                        className="w-16 h-16 mx-auto mb-4 brightness-0 invert"
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
                    {/* Paso 1: Ubicación */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">1</div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-sm mb-1">Permiso de Ubicación</h4>
                            <p className="text-slate-500 text-[11px] leading-normal">
                                Ajustes &gt; Apps &gt; SSM Location &gt; Permisos &gt; Ubicación. Selecciona <b>"Permitir siempre"</b> o "todo el tiempo".
                            </p>
                        </div>
                    </div>

                    {/* Paso 2: Batería */}
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
                        onClick={alCerrar}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors text-sm"
                    >
                        Entendido, ya lo he revisado
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticModal;
