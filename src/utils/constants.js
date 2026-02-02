/**
 * SSM LOCATION - CONSTANTES GLOBALES
 * 
 * Este archivo contiene todas las configuraciones estáticas de la aplicación.
 * Centralizar aquí estos datos permite cambiar el comportamiento de la app 
 * sin tener que buscar entre el código lógico.
 */

export const VERSION_APP = '2.25';

// Intervalos de tiempo
export const INTERVALO_ENVIO_MS = 60000; // 60 segundos entre envíos a servidor
export const INTERVALO_CONTEO_MS = 1000;  // 1 segundo para la actualización visual

// Lista oficial de Hermandades de la Semana Santa de Mérida
export const HERMANDADES = [
    { nombre: 'Entrada Triunfal (Pollinita)', codigo: 'pollinita' },
    { nombre: 'Cena', codigo: 'cena' },
    { nombre: 'Pasos', codigo: 'pasos' },
    { nombre: 'Prendimiento', codigo: 'prendimiento' },
    { nombre: 'Medinaceli', codigo: 'medinaceli' },
    { nombre: 'Las Torres', codigo: 'lastorres' },
    { nombre: 'Fervorosa (Tres Caídas)', codigo: 'trescaidas' },
    { nombre: 'Humildad', codigo: 'humildad' },
    { nombre: 'Vera Cruz', codigo: 'veracruz' },
    { nombre: 'Ntro. Padre Jesús Nazareno', codigo: 'nazareno' },
    { nombre: 'Mayor Dolor', codigo: 'mayordolor' },
    { nombre: 'Tres Cálices', codigo: 'trescalices' },
    { nombre: 'Ferroviarios', codigo: 'ferroviarios' },
    { nombre: 'Paz y Caridad', codigo: 'pazycaridad' },
    { nombre: 'Descendimiento', codigo: 'descendimiento' },
    { nombre: 'Angustias', codigo: 'angustias' },
    { nombre: 'Sepulcro', codigo: 'sepulcro' },
    { nombre: 'Soledad', codigo: 'soledad' },
    { nombre: 'Resucitado', codigo: 'resucitado' },
    { nombre: 'Santa Eulalia', codigo: 'santaeulalia' },
    { nombre: 'Cabalgata', codigo: 'cabalgata' },
    { nombre: 'Junta Cofradías', codigo: 'juntacofradias' },
    { nombre: 'Otros', codigo: 'otros' }
];
