/**
 * SSM LOCATION - COMPONENTE: PANTALLA DE BIENVENIDA
 * 
 * Esta es la primera pantalla que ve el usuario al abrir la aplicación. 
 * Su objetivo es presentar la marca y ofrecer el botón de entrada.
 * 
 * @param {Object} props
 * @param {Function} props.alContinuar - Función que se ejecuta al pulsar el botón para entrar a la app.
 */

import React from 'react';

const WelcomeScreen = ({ alContinuar }) => {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
            <div className="max-w-xs w-full">
                <div className="mb-8">
                    {/* Logotipo oficial: Bien integrado en blanco, sin sombras redundantes */}
                    <img
                        src="appLogo.png"
                        alt="SSM Location Logo"
                        className="w-48 h-48 mx-auto mb-6 animate-in fade-in zoom-in duration-700"
                    />

                    {/* Título principal de la organización */}
                    <h1 className="text-3xl font-bold text-red-600 leading-tight">
                        Semana Santa de Mérida
                    </h1>
                </div>

                {/* Botón de acceso con estilo redondeado y minimalista */}
                <button
                    onClick={alContinuar}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all transform active:scale-95 shadow-lg shadow-red-100"
                >
                    Continuar
                </button>

                <p className="mt-8 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
                    v2.25 - Sistema de Seguimiento en Tiempo Real
                </p>
            </div>
        </div>
    );
};

export default WelcomeScreen;
