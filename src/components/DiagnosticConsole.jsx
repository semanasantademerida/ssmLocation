/**
 * SSM LOCATION - COMPONENTE: CONSOLA DE DIAGNÓSTICO
 * 
 * Muestra el historial técnico de la aplicación:
 * - Logs del sistema de GPS en segundo plano.
 * - Historial de transmisiones HTTP al servidor PHP.
 * 
 * Es fundamental para que el usuario pueda verificar que la app "está viva" 
 * aunque no se mueva el marcador del mapa.
 * 
 * @param {Object} props
 * @param {Array} props.logs - Lista de cadenas de texto con eventos de sistema.
 * @param {Array} props.consultas - Lista de objetos con el historial de envíos API.
 * @param {Function} props.alCopiar - Función para copiar al portapapeles.
 * @param {Function} props.alLimpiar - Función para resetear logs.
 */

import React from 'react';

const DiagnosticConsole = ({ logs, consultas, alCopiar, alLimpiar }) => {
    return (
        <div className="space-y-8 mt-4">
            {/* TERMINAL DE LOGS DE SISTEMA */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Consola de Diagnóstico
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={alCopiar}
                            className="text-[9px] text-emerald-600 font-bold uppercase transition-colors hover:text-emerald-700"
                        >
                            Copiar
                        </button>
                        <button
                            onClick={alLimpiar}
                            className="text-[9px] text-red-400 font-bold uppercase transition-colors hover:text-red-600"
                        >
                            Borrar
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900 text-slate-400 p-4 rounded-2xl font-mono text-[9px] h-48 overflow-y-auto border border-slate-800 shadow-2xl">
                    {logs.length === 0 && (
                        <p className="text-slate-700 italic text-center py-8">
                            Esperando eventos del GPS...
                        </p>
                    )}
                    {logs.map((log, i) => (
                        <div key={i} className="mb-1.5 border-b border-slate-800/50 pb-1 last:border-0">
                            {log}
                        </div>
                    ))}
                </div>
            </div>

            {/* HISTORIAL DE TRANSMISIONES HTTP AL SERVIDOR */}
            {consultas.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                        Historial de Transmisiones
                    </p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {consultas.map((q, i) => (
                            <div key={i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-[9px] font-bold text-slate-400">
                                        {q.time}
                                    </span>
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
    );
};

export default DiagnosticConsole;
