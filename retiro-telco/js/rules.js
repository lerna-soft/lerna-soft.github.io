/*
 * rules.js — Motor de reglas (las "palancas" R-XX).
 * Evalúa el caso del usuario y devuelve:
 *   - palancas: tarjetas explicativas en lenguaje claro
 *   - ventana: resultado de la regla de 3 días hábiles
 *   - secciones: bloques que arman el PQR
 * Fundamento legal en docs/01-marco-regulatorio.md y docs/02-reglas-palancas.md.
 */

const NORMAS = {
  regimen: 'Régimen de Protección de los Derechos de los Usuarios (Res. CRC 5111 de 2017 y 7356 de 2024)',
  ley2300: 'Ley 2300 de 2023',
  tresDias: 'Resolución CRC 4625 de 2014',
  sap: 'Ley 1341 de 2009 y Régimen de Protección de Usuarios',
  habeas: 'Ley 1266 de 2008',
};

function nombreServicio(s) {
  return ({ internet: 'Internet', tv: 'Televisión', telefonia: 'Telefonía', paquete: 'paquete hogar' })[s] || 'servicio';
}

function evaluarCaso(caso) {
  const palancas = [];
  const secciones = [];
  const H = window.Habiles;

  const hoy = caso.fechaSolicitud ? H.parseISODate(caso.fechaSolicitud) : new Date();
  const op = window.Operadores[caso.operadorId] || window.Operadores.otro;

  // ---- R-01 Terminación libre ----
  if (caso.objetivo === 'cancelar') {
    palancas.push({
      id: 'R-01', titulo: 'Tienes derecho a cancelar cuando quieras',
      texto: 'No te pueden poner trabas ni pedirte que expliques por qué te vas, ni exigir documentos. Cancelar por la app debe ser tan fácil como subir de plan.',
      tono: 'ok',
    });
    secciones.push({
      n: 'TERMINACIÓN DEL CONTRATO',
      cuerpo:
        `Solicito la terminación del contrato N° ${caso.contrato || '[CONTRATO]'}` +
        (caso.yaRadicoRetiro && caso.cunRetiro ? `, decisión ya manifestada bajo el radicado N° ${caso.cunRetiro}` : '') +
        `. Conforme al ${NORMAS.regimen} y la ${NORMAS.ley2300}, el operador no puede oponerse, exigir justificación ni imponer requisitos innecesarios. Solicito además que se me informe sobre el derecho a conservar y portar mi número.`,
    });
  }

  // ---- R-02 Ventana 3 días hábiles ----
  let ventana = null;
  if (caso.objetivo === 'cancelar' && caso.fechaCorte) {
    ventana = H.evaluarVentana3Dias(H.parseISODate(caso.fechaCorte), hoy);
    if (ventana.alcanza) {
      palancas.push({
        id: 'R-02', titulo: 'Llegas a tiempo para no pagar otro mes',
        texto: `Avisar con 3 días hábiles o más antes de tu corte hace que el servicio termine en el ciclo actual. Tienes ${ventana.diasHabilesAntelacion} días hábiles de antelación: alcanza.`,
        tono: 'ok',
      });
    } else {
      palancas.push({
        id: 'R-02', titulo: 'Cuidado: la ventana de los 3 días no alcanza',
        texto: `Solo tienes ${ventana.diasHabilesAntelacion} días hábiles antes del corte (el límite era el ${fmt(ventana.fechaLimite)}). Para una cancelación voluntaria, el operador puede cobrarte el siguiente ciclo. No pelees por aquí: usa las otras palancas (fallas/incumplimiento).`,
        tono: 'warn',
      });
    }
  }

  // ---- R-21 Reencuadre por incumplimiento + R-10 compensación ----
  if (caso.tieneFallas) {
    const serv = nombreServicio(caso.servicioQueFalla || caso.servicio);
    palancas.push({
      id: 'R-21', titulo: 'Te vas por incumplimiento, no “porque sí”',
      texto: 'Como las fallas son del operador, la terminación es por incumplimiento: eso te quita penalidades y te permite objetar el cobro del mes que no usaste.',
      tono: 'ok',
    });
    palancas.push({
      id: 'R-10', titulo: 'Te deben compensación por las fallas',
      texto: `Si el ${serv.toLowerCase()} estuvo caído más de 2,5 horas en un mes, te deben devolver el DOBLE proporcional — y puedes reclamarlo por los meses anteriores. Suele superar el mes que te quieren cobrar.`,
      tono: 'ok',
    });
    secciones.push({
      n: 'RECLAMACIÓN DE COMPENSACIÓN POR FALLAS',
      cuerpo:
        `El servicio de ${serv} ha presentado fallas reiteradas y no resueltas de forma definitiva ${caso.fallasDesde || 'prácticamente desde el inicio del servicio'}. Solicito: (a) el detalle completo de fallas, reportes y radicados registrados en mi cuenta desde el inicio del servicio; y (b) la aplicación de la COMPENSACIÓN AUTOMÁTICA por la indisponibilidad del servicio (superior a 2,5 horas en cada mes afectado), conforme a la regulación de la CRC, reflejada como descuento a mi favor en las facturas correspondientes.`,
    });
  }

  // ---- R-20 Visita fantasma ----
  if (caso.visitaFantasma) {
    palancas.push({
      id: 'R-20', titulo: 'La visita fantasma es tu prueba más fuerte',
      texto: 'Reportaron una visita que no ocurrió. ⚠️ Guarda YA el video de tus cámaras de ese día y hora antes de que se sobrescriba: es evidencia contundente ante la Superintendencia.',
      tono: 'warn',
    });
    secciones.push({
      n: 'VISITA TÉCNICA NO REALIZADA Y REPORTE FALSO',
      cuerpo:
        `Radiqué una o más solicitudes de visita técnica para revisar las fallas del servicio. Sin embargo, recibí una notificación afirmando que el técnico asistió y que no fue posible el acceso al inmueble o que nadie atendió, lo cual es FALSO: en el inmueble residimos y trabajamos de manera permanente, y cuento con cámaras de videovigilancia que graban las 24 horas. En consecuencia, solicito: (a) el listado completo de los casos y reportes radicados en mi cuenta; y (b) el soporte de la(s) visita(s) técnica(s) reportada(s), incluyendo la fecha, la hora exacta y la identificación del técnico asignado. Una vez me sea informada dicha fecha y hora, aportaré el video correspondiente de mis cámaras, que demuestra que no se presentó ningún técnico ni persona alguna del operador en el momento reportado, evidenciando una visita inexistente. Solicito asimismo que se deje constancia de que la falla nunca fue efectivamente atendida y que el cierre del caso se sustentó en un reporte que no corresponde a la realidad.`,
    });
  }

  // ---- R-04/R-24 Objeción de cobro ----
  if (caso.cobroIndebido || (caso.objetivo === 'cancelar' && caso.tieneFallas)) {
    palancas.push({
      id: 'R-23', titulo: 'No te pueden cobrar para atenderte',
      texto: 'No pueden exigirte pagar la factura en disputa para tramitar tu reclamo, ni cobrarte reconexión o intereses por algo que están incumpliendo.',
      tono: 'ok',
    });
    const detalle = caso.cobroDescripcion
      ? `Objeto el siguiente cobro: ${caso.cobroDescripcion}. `
      : 'Objeto el cobro correspondiente al ciclo de facturación siguiente, por tratarse de un servicio que no he podido usar con normalidad y cuya terminación ya solicité. ';
    secciones.push({
      n: 'OBJECIÓN DE COBRO',
      cuerpo:
        detalle +
        'Solicito que NO se genere dicho cobro, que no se me cobre suma alguna por reconexión ni intereses derivados de esta disputa, y que en ningún caso se condicione la atención del presente PQR al pago de facturas en disputa.',
    });
    palancas.push({
      id: 'R-40', titulo: 'No pueden reportarte a centrales por deuda en disputa',
      texto: `Mientras tu reclamo está en curso, reportarte negativamente está prohibido (${NORMAS.habeas}).`,
      tono: 'ok',
    });
  }

  // ---- R-30 SAP ----
  palancas.push({
    id: 'R-30', titulo: '⭐ Si no responden en 15 días hábiles, ganas',
    texto: 'Opera el Silencio Administrativo Positivo: el reclamo se entiende resuelto a tu favor. Te avisaremos la fecha exacta para reclamarlo.',
    tono: 'star',
  });

  return { palancas, secciones, ventana, operador: op, fechaSolicitud: hoy };
}

function fmt(date) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

window.Reglas = { evaluarCaso, fmt, NORMAS };
