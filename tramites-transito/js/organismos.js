/*
 * organismos.js — Autoridades / organismos de tránsito (el destinatario del escrito).
 * Análogo a operators.js del telco. Mantener al día los canales de radicación.
 * El documento va dirigido al organismo de tránsito que impuso el comparendo
 * (Secretaría de Movilidad del municipio o el organismo de la vía).
 */

const ORGANISMOS = {
  bogota: {
    id: 'bogota',
    nombre: 'Secretaría Distrital de Movilidad de Bogotá',
    autoridad: 'Despacho del Inspector de Tránsito — Secretaría Distrital de Movilidad de Bogotá D.C.',
    canales: {
      web: 'https://www.movilidadbogota.gov.co',
      radica: 'Radicación virtual SDM / SIMUR, o ventanilla; consulta y paga en el SIMIT.',
    },
  },
  medellin: {
    id: 'medellin',
    nombre: 'Secretaría de Movilidad de Medellín',
    autoridad: 'Despacho del Inspector de Tránsito — Secretaría de Movilidad de Medellín',
    canales: {
      web: 'https://www.medellin.gov.co/movilidad/',
      radica: 'Radicación en la Secretaría de Movilidad de Medellín; consulta y paga en el SIMIT.',
    },
  },
  cali: {
    id: 'cali',
    nombre: 'Secretaría de Movilidad de Santiago de Cali',
    autoridad: 'Despacho del Inspector de Tránsito — Secretaría de Movilidad de Santiago de Cali',
    canales: {
      web: 'https://www.cali.gov.co/movilidad/',
      radica: 'Radicación en la Secretaría de Movilidad de Cali; consulta y paga en el SIMIT.',
    },
  },
  barranquilla: {
    id: 'barranquilla',
    nombre: 'Secretaría Distrital de Tránsito y Seguridad Vial de Barranquilla',
    autoridad: 'Despacho del Inspector de Tránsito — Secretaría de Tránsito y Seguridad Vial de Barranquilla',
    canales: {
      web: 'https://www.barranquilla.gov.co',
      radica: 'Radicación en la Secretaría de Tránsito de Barranquilla; consulta y paga en el SIMIT.',
    },
  },
  bucaramanga: {
    id: 'bucaramanga',
    nombre: 'Dirección de Tránsito de Bucaramanga',
    autoridad: 'Despacho del Inspector de Tránsito — Dirección de Tránsito de Bucaramanga',
    canales: {
      web: 'https://www.transitobucaramanga.gov.co',
      radica: 'Radicación en la Dirección de Tránsito de Bucaramanga; consulta y paga en el SIMIT.',
    },
  },
  cartagena: {
    id: 'cartagena',
    nombre: 'Departamento Administrativo de Tránsito y Transporte de Cartagena (DATT)',
    autoridad: 'Despacho del Inspector de Tránsito — DATT Cartagena',
    canales: {
      web: 'https://www.cartagena.gov.co',
      radica: 'Radicación en el DATT de Cartagena; consulta y paga en el SIMIT.',
    },
  },
  otro: {
    id: 'otro',
    nombre: 'Otro organismo de tránsito (mi municipio)',
    autoridad: 'Despacho del Inspector de Tránsito — Organismo de Tránsito competente',
    canales: {
      web: '',
      radica: 'Radica en la ventanilla o el canal de PQRS del organismo de tránsito que impuso el comparendo. Consulta y paga en el SIMIT (www.fcm.org.co/simit).',
    },
  },
};

window.Organismos = ORGANISMOS;
