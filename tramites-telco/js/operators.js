/*
 * operators.js — Perfiles de operadores: nombre legal, canales de PQR.
 * Mantener al día. Los datos legales (NIT, razón social) ayudan a dirigir el PQR.
 */

const OPERADORES = {
  tigo: {
    id: 'tigo',
    nombre: 'Tigo',
    razonSocial: 'UNE EPM TELECOMUNICACIONES S.A. E.S.P.',
    nit: '900.092.385-9',
    canales: {
      web: 'https://express.tigo.com.co/pqr-convergent-co',
      app: 'App Mi Tigo',
      linea: 'WhatsApp 300 333 0000',
    },
  },
  claro: {
    id: 'claro',
    nombre: 'Claro',
    razonSocial: 'COMUNICACIÓN CELULAR S.A. — COMCEL S.A.',
    nit: '800.153.993-7',
    canales: {
      web: 'https://www.claro.com.co/personas/legal-y-regulatorio/pqr/',
      app: 'App Mi Claro',
      linea: '*611',
    },
  },
  movistar: {
    id: 'movistar',
    nombre: 'Movistar',
    razonSocial: 'COLOMBIA TELECOMUNICACIONES S.A. E.S.P. BIC',
    nit: '830.122.566-1',
    canales: {
      web: 'https://atencionalcliente.movistar.co/',
      app: 'App Mi Movistar',
      linea: '*611',
    },
  },
  wom: {
    id: 'wom',
    nombre: 'WOM',
    razonSocial: 'PARTNERS TELECOM COLOMBIA S.A.S.',
    nit: '901.282.119-2',
    canales: {
      web: 'https://www.wom.co/',
      app: 'App WOM',
      linea: '*789',
    },
  },
  otro: {
    id: 'otro',
    nombre: 'Otro operador',
    razonSocial: '',
    nit: '',
    canales: { web: '', app: '', linea: '' },
  },
};

window.Operadores = OPERADORES;
