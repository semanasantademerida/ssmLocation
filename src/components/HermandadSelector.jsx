/**
 * SSM LOCATION - COMPONENTE: SELECTOR DE HERMANDAD
 * 
 * Permite al usuario elegir qué cofradía o evento se va a rastrear.
 * Se bloquea cuando el seguimiento está activo para evitar cambios accidentales.
 * 
 * @param {Object} props
 * @param {string} props.seleccionada - El nombre de la hermandad actualmente elegida.
 * @param {Function} props.alCambiar - Función que se dispara al elegir una opción.
 * @param {boolean} props.bloqueado - Si el selector debe estar desactivado (ej: durante el rastreo).
 * @param {Array} props.listado - Lista de objetos de hermandades disponibles.
 */

import React from 'react';
import { ChevronDown } from 'lucide-react';

const HermandadSelector = ({ seleccionada, alCambiar, bloqueado, listado }) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                Hermandad Activa
            </label>
            <div className="relative group">
                <select
                    value={seleccionada}
                    onChange={(e) => alCambiar(e.target.value)}
                    disabled={bloqueado}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-700 font-semibold p-4 pr-12 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >
                    <option value="">-- Seleccionar Cofradía --</option>
                    {listado.map((h, i) => (
                        <option key={i} value={h.nombre}>
                            {h.nombre}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
        </div>
    );
};

export default HermandadSelector;
