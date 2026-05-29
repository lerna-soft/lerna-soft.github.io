/*
 * tramites.js — Catálogo de trámites (el menú del diagnóstico).
 * Cada entrada mapea a un trámite del catálogo documental (docs/06-catalogo-tramites.md)
 * y declara qué preguntas de detalle pide. La lógica de palancas/secciones vive
 * en rules.js, keyed por el id de objetivo (la clave de este objeto).
 *
 *  detalle: qué campos extra pide el paso "Cuéntanos qué pasó".
 *  necesitaCorte: si el paso de fechas pide la fecha de corte (solo terminación).
 *  generaPQR: si el documento que produce es un PQR con reloj de 15 días/SAP.
 */

const TRAMITES = {
  cancelar: {
    id: 'T-01', emoji: '🚪', label: 'Cancelar / retirarme',
    desc: 'Quiero terminar el contrato con mi operador.',
    detalle: ['fallas', 'visita', 'cobro'], necesitaCorte: true, generaPQR: true,
  },
  falla: {
    id: 'T-02', emoji: '📡', label: 'Mi servicio falla',
    desc: 'Internet/TV/teléfono no sirve bien y quiero reclamar (o que me compensen).',
    detalle: ['fallas', 'visita', 'cobro'], necesitaCorte: false, generaPQR: true,
  },
  cobro: {
    id: 'T-03', emoji: '💸', label: 'Me cobran de más',
    desc: 'Hay cobros que no reconozco o no me corresponden.',
    detalle: ['cobro', 'fallas'], necesitaCorte: false, generaPQR: true,
  },
  premium: {
    id: 'T-04', emoji: '📩', label: 'Me cobran mensajes o contenidos que no pedí',
    desc: 'Suscripciones, trivias o SMS premium que descuentan saldo o llegan a la factura.',
    detalle: ['premium'], necesitaCorte: false, generaPQR: true,
  },
  portabilidad: {
    id: 'T-05', emoji: '🔁', label: 'Cambiarme de operador con mi número',
    desc: 'Quiero portar mi número y que no me lo impidan ni lo demoren.',
    detalle: ['portabilidad'], necesitaCorte: false, generaPQR: true,
  },
  saldo: {
    id: 'T-06', emoji: '🪙', label: 'Perdí saldo o recarga',
    desc: 'Se "venció" mi saldo o lo perdí al cambiar de plan.',
    detalle: ['saldo'], necesitaCorte: false, generaPQR: true,
  },
  imei: {
    id: 'T-07', emoji: '📵', label: 'Me robaron o bloquearon el celular',
    desc: 'Necesito bloquear un equipo robado/perdido, o me bloquearon el mío por error.',
    detalle: ['imei'], necesitaCorte: false, generaPQR: false,
  },
  acoso: {
    id: 'T-08', emoji: '📞', label: 'No dejan de llamarme o escribirme',
    desc: 'Cobranza o publicidad fuera de horario o a toda hora.',
    detalle: ['acoso'], necesitaCorte: false, generaPQR: true,
  },
  reporte: {
    id: 'T-09', emoji: '⚠️', label: 'Me reportaron (o van a reportar) a centrales',
    desc: 'Datacrédito/centrales por una deuda que estoy disputando, o quiero borrar mis datos.',
    detalle: ['reporte'], necesitaCorte: false, generaPQR: true,
  },
};

window.Tramites = TRAMITES;
