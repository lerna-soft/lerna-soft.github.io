/*
 * rules.js — Motor de reglas (las "palancas" R-XX).
 * Evalúa el caso del usuario y devuelve:
 *   - palancas: tarjetas explicativas en lenguaje claro
 *   - ventana: resultado de la regla de 3 días hábiles
 *   - secciones: bloques que arman el PQR
 * Fundamento legal en docs/01-marco-regulatorio.md y docs/02-reglas-palancas.md.
 */

const NORMAS = {
  regimen: 'Régimen de Protección de los Derechos de los Usuarios (compilado en la Res. CRC 5050 de 2016, modificada por las Res. CRC 5111 de 2017 y 7356 de 2024)',
  ley2300: 'Ley 2300 de 2023',
  tresDias: 'Resolución CRC 4625 de 2014',
  sap: 'Ley 1341 de 2009 y Régimen de Protección de Usuarios',
  habeas: 'Ley 1266 de 2008',
  portabilidad: 'Resolución CRC 7151 de 2023',
  imei: 'Capítulo 7, Título II de la Res. CRC 5050 de 2016 (Ley 1453 de 2011, art. 106)',
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

  // ---- T-04 Suscripciones premium ----
  if (caso.objetivo === 'premium') {
    palancas.push({
      id: 'R-50', titulo: 'Te deben devolver lo que te cobraron sin permiso',
      texto: 'Una suscripción a contenidos requiere que tú confirmes con "ACEPTO". Si no lo hiciste, puedes cancelarla y exigir la reversión del cobro y la devolución del saldo descontado.',
      tono: 'ok',
    });
    palancas.push({
      id: 'R-51', titulo: 'Puedes bloquear la publicidad por SMS',
      texto: 'Responde CANCELAR o SALIR al mensaje, e inscríbete gratis en el Registro Nacional de Excluidos (RNE) para no recibir más SMS comerciales.',
      tono: 'ok',
    });
    secciones.push({
      n: 'CANCELACIÓN DE SUSCRIPCIÓN Y REVERSIÓN DE COBRO',
      cuerpo:
        `Manifiesto que ${caso.premiumDescripcion ? `se me está cobrando/descontando lo siguiente: ${caso.premiumDescripcion}. ` : 'se me cobran contenidos o suscripciones premium que no solicité ni acepté expresamente. '}` +
        `Conforme al ${NORMAS.regimen}, la suscripción a contenidos exige consentimiento previo y expreso del usuario. Por lo anterior solicito: (a) la CANCELACIÓN inmediata de toda suscripción a contenidos o servicios de valor agregado asociada a mi línea; (b) la REVERSIÓN de los cobros y la DEVOLUCIÓN del saldo descontado por este concepto; y (c) la inscripción de mi número en el Registro Nacional de Excluidos para no recibir mensajes comerciales.`,
    });
  }

  // ---- T-08 Acoso de cobranza / contacto no deseado ----
  if (caso.objetivo === 'acoso') {
    palancas.push({
      id: 'R-27', titulo: 'No te pueden llamar a cualquier hora',
      texto: 'La cobranza solo puede contactarte de lunes a viernes de 7am a 7pm y sábados de 8am a 3pm; nunca domingos ni festivos, ni a tus referencias. Puedes exigir que paren y que te saquen de sus listas.',
      tono: 'ok',
    });
    secciones.push({
      n: 'CESE DE CONTACTO Y EXCLUSIÓN DE BASES DE DATOS',
      cuerpo:
        `${caso.acosoDetalle ? `${caso.acosoDetalle} ` : ''}` +
        `He sido contactado(a) de forma reiterada y/o fuera de los horarios permitidos. Conforme a la ${NORMAS.ley2300}, solicito: (a) el CESE inmediato de las comunicaciones que no respeten los horarios legales (L–V 7:00 a 19:00 y sábados 8:00 a 15:00, nunca domingos ni festivos); (b) que se abstengan de contactar a mis referencias; y (c) la SUPRESIÓN de mi número y mis datos de las bases de datos de la empresa y de sus gestores de cobranza.`,
    });
  }

  // ---- T-09 Habeas data (standalone) ----
  if (caso.objetivo === 'reporte') {
    palancas.push({
      id: 'R-40', titulo: 'No pueden reportarte por una deuda en disputa',
      texto: `Mientras tu reclamo está en curso, reportarte negativamente a centrales está prohibido (${NORMAS.habeas}).`,
      tono: 'ok',
    });
    secciones.push({
      n: 'HABEAS DATA — NO REPORTE Y/O SUPRESIÓN',
      cuerpo:
        (caso.reporteEnDisputa
          ? 'La obligación que se pretende reportar (o que ya fue reportada) se encuentra EN DISPUTA mediante reclamo en curso. '
          : '') +
        `Conforme a la ${NORMAS.habeas}, solicito: (a) ABSTENERSE de reportar a centrales de riesgo cualquier obligación en disputa, y/o RETIRAR el reporte negativo existente; y (b) la SUPRESIÓN de mis datos personales una vez terminada la relación contractual.`,
    });
  }

  // ---- T-05 Portabilidad ----
  if (caso.objetivo === 'portabilidad') {
    palancas.push({
      id: 'R-60', titulo: 'Te puedes llevar tu número, aunque debas plata',
      texto: 'La portabilidad es gratis, máximo 3 días hábiles y 100% digital. No te pueden exigir estar al día en pagos ni negarse o demorarla.',
      tono: 'ok',
    });
    secciones.push({
      n: 'PORTABILIDAD NUMÉRICA',
      cuerpo:
        `Solicito ejercer mi derecho a la PORTABILIDAD NUMÉRICA, conservando mi número` +
        (caso.portOperadorDestino ? ` al portarme hacia ${caso.portOperadorDestino}` : '') +
        `. Conforme a la ${NORMAS.portabilidad}, el proceso es gratuito, se surte en máximo tres (3) días hábiles y NO puede condicionarse a estar al día en pagos. ` +
        (caso.portLeDilatan
          ? 'Manifiesto que el proceso me ha sido OBSTRUIDO o DILATADO indebidamente, por lo que solicito se subsane de inmediato y se deje constancia de la obstrucción.'
          : 'Solicito que no se impongan trabas ni dilaciones a este trámite.'),
    });
  }

  // ---- T-06 Saldo prepago ----
  if (caso.objetivo === 'saldo') {
    palancas.push({
      id: 'R-61', titulo: 'Tu saldo no se pierde tan fácil',
      texto: 'Las recargas tienen vigencia mínima de 60 días y el saldo se recupera recargando dentro de los 30 días siguientes. Al pasar de prepago a pospago, el saldo se traslada.',
      tono: 'ok',
    });
    secciones.push({
      n: 'RESTITUCIÓN DE SALDO',
      cuerpo:
        `${caso.saldoDescripcion ? `${caso.saldoDescripcion}. ` : ''}` +
        `Conforme al ${NORMAS.regimen} y las condiciones de prepago, solicito la RESTITUCIÓN del saldo no consumido al que tengo derecho (vigencia mínima de la recarga y recuperación de saldo, o traslado del saldo en caso de migración de plan).`,
    });
  }

  // ---- T-07 IMEI (equipo robado/perdido o bloqueo erróneo) ----
  if (caso.objetivo === 'imei') {
    if (caso.imeiTipo === 'bloqueo') {
      palancas.push({
        id: 'R-71', titulo: 'Si es tu equipo, pueden desbloquearlo',
        texto: 'Bloquearon tu equipo por un reporte ajeno. Probando que eres el dueño puedes pedir la exclusión de la base negativa.',
        tono: 'ok',
      });
      secciones.push({
        n: 'EXCLUSIÓN DE BASE NEGATIVA (DESBLOQUEO DE IMEI)',
        cuerpo:
          `Mi equipo con IMEI ${caso.imei || '[IMEI]'} fue incluido en la base negativa por un reporte que no me corresponde, siendo yo el legítimo propietario. Conforme al ${NORMAS.imei}, solicito la EXCLUSIÓN del equipo de la base negativa, aportando la prueba de propiedad correspondiente` +
          (caso.numeroDenuncia ? ` y la denuncia N° ${caso.numeroDenuncia}` : '') + '.',
      });
    } else {
      palancas.push({
        id: 'R-70', titulo: 'Bloquea el equipo para que no lo usen',
        texto: 'Reporta el IMEI para que entre a la base negativa. Solo tú, que hiciste el reporte, podrás pedir el desbloqueo si lo recuperas.',
        tono: 'ok',
      });
      secciones.push({
        n: 'BLOQUEO DE IMEI POR HURTO/PÉRDIDA',
        cuerpo:
          `Reporto el HURTO/PÉRDIDA de mi equipo con IMEI ${caso.imei || '[IMEI]'} y solicito su inclusión en la BASE NEGATIVA para impedir su uso. Conforme al ${NORMAS.imei}` +
          (caso.numeroDenuncia ? `, adjunto la denuncia N° ${caso.numeroDenuncia} ante la Fiscalía con el IMEI del equipo.` : ', aportaré la denuncia ante la Fiscalía con el IMEI del equipo.'),
      });
    }
  }

  // ---- R-30 SAP (solo trámites que se resuelven por PQR) ----
  const tramite = (window.Tramites && window.Tramites[caso.objetivo]) || null;
  if (!tramite || tramite.generaPQR) {
    palancas.push({
      id: 'R-30', titulo: '⭐ Si no responden en 15 días hábiles, ganas',
      texto: 'Opera el Silencio Administrativo Positivo: el reclamo se entiende resuelto a tu favor. Te avisaremos la fecha exacta para reclamarlo.',
      tono: 'star',
    });
  }

  return { palancas, secciones, ventana, operador: op, fechaSolicitud: hoy };
}

function fmt(date) {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
}

window.Reglas = { evaluarCaso, fmt, NORMAS };
