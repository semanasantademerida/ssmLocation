/**
 * SSM LOCATION - COMPONENTE: BOTONES DE CONTROL
 * 
 * Muestra el botón de acción principal (Play para iniciar, Stop para detener).
 * 
 * @param {Object} props
 * @param {boolean} props.estaRastreando - Si el servicio está en marcha.
 * @param {Function} props.alIniciar - Función para arrancar el servicio.
 * @param {Function} props.alDetener - Función para parar el servicio.
 * @param {boolean} props.puedeIniciar - Si el botón de inicio debe estar habilitado.
 */

import React from 'react';
import { Play, Square } from 'lucide-react';

const ControlButtons = ({ estaRastreando, alIniciar, alDetener, puedeIniciar }) => {
    return (
        <div className="pt-2">
            {!estaRastreando ? (
                <button
                    onClick={alIniciar}
                    disabled={!puedeIniciar}
                    className="w-full btn-tracking bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-5 px-8 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-lg shadow-red-200"
                >
                    <Play className="w-6 h-6" fill="currentColor" />
                    Iniciar Seguimiento
                </button>
            ) : (
                <button
                    onClick={alDetener}
                    className="w-full btn-tracking bg-slate-800 hover:bg-slate-900 text-white font-bold py-5 px-8 rounded-2xl text-lg flex items-center justify-center gap-3 shadow-xl"
                >
                    <Square className="w-6 h-6" fill="white" />
                    Detener Servicio
                </button>
            )}
        </div>
    );
};

export default ControlButtons;
