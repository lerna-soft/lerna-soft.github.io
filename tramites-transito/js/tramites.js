/*
 * tramites.js — Catálogo de trámites de tránsito (el menú del diagnóstico).
 * Cada entrada declara qué preguntas de detalle pide. La lógica de palancas y
 * secciones del documento vive en rules.js, keyed por el id de objetivo (la clave).
 *
 *  detalle:      qué bloques de causales/datos pide el paso "Cuéntanos qué pasó".
 *  pideTipo:     si el paso de fechas pregunta tipo de comparendo (vía / electrónico).
 *  pideFechaInfra:  si pide la fecha de la infracción.
 *  pideFechaNotif:  si pide la fecha de notificación del comparendo.
 *  pideResolucion:  si pide número/fecha de la resolución (para recursos).
 *  doc:          tipo de documento que genera ('impugnacion' | 'peticion' | 'recurso').
 */

const TRAMITES = {
  impugnar: {
    id: 'T-01', emoji: '⚖️', label: 'Impugnar un comparendo injusto o mal puesto',
    desc: 'Me pusieron un comparendo que no es justo o tiene errores y lo quiero tumbar en la audiencia.',
    detalle: ['causales'],
    pideTipo: true, pideFechaInfra: true, pideFechaNotif: true, pideResolucion: false,
    doc: 'impugnacion',
  },
  pruebas: {
    id: 'T-02', emoji: '🔍', label: 'Pedir las pruebas y el soporte del comparendo',
    desc: 'Quiero que me entreguen la foto/video, el comparendo y la prueba de que me notificaron, para revisar si está bien.',
    detalle: ['comparendoInfo'],
    pideTipo: true, pideFechaInfra: true, pideFechaNotif: true, pideResolucion: false,
    doc: 'peticion',
  },
  prescripcion: {
    id: 'T-03', emoji: '⏳', label: 'Un comparendo viejo (¿ya prescribió?)',
    desc: 'Tengo un comparendo de hace tiempo. Si pasaron 3 años sin que me notificaran el cobro, puede estar prescrito.',
    detalle: ['comparendoInfo'],
    pideTipo: false, pideFechaInfra: true, pideFechaNotif: false, pideResolucion: false,
    doc: 'prescripcion',
  },
  recurso: {
    id: 'T-04', emoji: '📑', label: 'Ya me fallaron en contra y quiero recurrir',
    desc: 'Hubo audiencia o resolución y me sancionaron. Quiero presentar recurso de reposición (y apelación).',
    detalle: ['causales'],
    pideTipo: true, pideFechaInfra: true, pideFechaNotif: false, pideResolucion: true,
    doc: 'recurso',
  },
};

window.Tramites = TRAMITES;
