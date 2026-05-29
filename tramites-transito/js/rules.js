/*
 * rules.js — Motor de reglas de tránsito (las "palancas" R-XX).
 * Evalúa el caso del usuario y devuelve:
 *   - palancas: tarjetas explicativas en lenguaje claro (tus derechos / argumentos)
 *   - secciones: bloques que arman el documento (impugnación / petición / recurso)
 *   - plazos: ventanas de descuento, fecha límite para impugnar/recurrir, prescripción,
 *             notificación de fotomulta y respuesta del derecho de petición.
 *   - doc: identidad del documento (título, encabezado, peticiones de cierre).
 *
 * Fundamento legal (verificado): Ley 769 de 2002 (Código Nacional de Tránsito,
 * art. 136 modificado por la Ley 1843 de 2017; art. 159 prescripción), Ley 1843
 * de 2017 (fotodetección), Ley 1755 de 2015 (derecho de petición), Ley 1437 de
 * 2011 (CPACA, recursos), Sentencia C-038 de 2020 (responsabilidad personal).
 */

const NORMAS = {
  cnt: 'Ley 769 de 2002 (Código Nacional de Tránsito Terrestre)',
  art136: 'artículo 136 de la Ley 769 de 2002, modificado por la Ley 1843 de 2017',
  art159: 'artículo 159 de la Ley 769 de 2002',
  ley1843: 'Ley 1843 de 2017',
  peticion: 'artículo 23 de la Constitución Política y la Ley 1755 de 2015',
  cpaca: 'Ley 1437 de 2011 (CPACA)',
  c038: 'Sentencia C-038 de 2020 de la Corte Constitucional',
};

// Plazos legales (en días hábiles) por tipo de comparendo.
const PLAZOS = {
  via:         { impugnar: 5,  desc50: 5,  desc25Hasta: 20 },
  electronico: { impugnar: 11, desc50: 11, desc25Hasta: 26 },
  notifFotomulta: 13, // 10 hábiles validación + 3 hábiles envío (Ley 1843/2017, art. 8)
  reposicion: 10,     // días hábiles desde la notificación de la resolución (CPACA)
};

function evaluarCaso(caso) {
  const palancas = [];
  const secciones = [];
  const H = window.Habiles;
  const org = window.Organismos[caso.organismoId] || window.Organismos.otro;
  const hoy = caso.fechaSolicitud ? H.parseISODate(caso.fechaSolicitud) : new Date();
  const tipo = caso.tipoComparendo === 'electronico' ? 'electronico' : 'via';
  const objetivo = caso.objetivo;

  const plazos = calcularPlazos(caso, hoy, tipo, H);

  // ---------- Palanca de contexto según el trámite ----------
  if (objetivo === 'impugnar') {
    palancas.push({
      id: 'R-01', titulo: 'Tienes derecho a impugnar en audiencia, gratis',
      texto: `Puedes rechazar el comparendo y pedir audiencia pública para que se decreten pruebas (${NORMAS.art136}). Es un derecho, no cuesta nada y puede ser virtual. No tienes que pagar primero para impugnar.`,
      tono: 'ok',
    });
  }
  if (objetivo === 'recurso') {
    palancas.push({
      id: 'R-02', titulo: 'Contra el fallo proceden recursos',
      texto: `Contra la resolución que te sanciona puedes interponer recurso de reposición y, en subsidio, apelación (${NORMAS.cpaca}). Tienes 10 días hábiles desde que te notificaron la decisión.`,
      tono: 'ok',
    });
  }
  if (objetivo === 'pruebas') {
    palancas.push({
      id: 'R-03', titulo: 'Antes de pelear, pide las pruebas',
      texto: `Mediante derecho de petición (${NORMAS.peticion}) puedes exigir la copia del comparendo, la foto/video, el acta de validación y la prueba de que te notificaron. Si algo de eso falla, ahí está tu defensa. Deben responder en 15 días hábiles.`,
      tono: 'ok',
    });
  }

  // ---------- DESCUENTOS (no aplica a prescripción) ----------
  if (objetivo !== 'prescripcion' && plazos.descuento) {
    const d = plazos.descuento;
    if (d.estado === 'desc50') {
      palancas.push({
        id: 'R-10', titulo: `Aún puedes pagar con 50% de descuento (hasta el ${fmt(d.fin50)})`,
        texto: 'Si decides pagar en vez de impugnar: con el curso pedagógico y el pago dentro del plazo del 50% la multa se reduce a la mitad. Ojo: pagar es aceptar la infracción (renuncias a impugnar).',
        tono: 'star',
      });
    } else if (d.estado === 'desc25') {
      palancas.push({
        id: 'R-10', titulo: `Puedes pagar con 25% de descuento (hasta el ${fmt(d.fin25)})`,
        texto: 'Ya pasó la ventana del 50%, pero aún alcanzas el 25% haciendo el curso pedagógico y pagando dentro del plazo. Pagar es aceptar la infracción (renuncias a impugnar).',
        tono: 'ok',
      });
    }
  }

  // ---------- Plazo para impugnar / vencimiento ----------
  if ((objetivo === 'impugnar') && plazos.impugnar) {
    if (plazos.impugnar.vigente) {
      palancas.push({
        id: 'R-11', titulo: `Estás a tiempo de impugnar (hasta el ${fmt(plazos.impugnar.limite)})`,
        texto: `Tienes ${plazos.impugnar.dias} días hábiles desde la notificación para comparecer y rechazar el comparendo. Radica este escrito antes de esa fecha.`,
        tono: 'ok',
      });
    } else {
      palancas.push({
        id: 'R-11', titulo: 'El plazo ordinario para impugnar pudo vencerse',
        texto: `El término para comparecer (${plazos.impugnar.dias} días hábiles desde la notificación) habría vencido el ${fmt(plazos.impugnar.limite)}. Aún puedes radicar el escrito y, sobre todo, atacar el fondo: indebida notificación, prescripción o pedir nulidad por violación al debido proceso. Si ya hubo fallo, ve a "recurso".`,
        tono: 'warn',
      });
    }
  }

  // ---------- Recurso: plazo de reposición ----------
  if (objetivo === 'recurso' && plazos.reposicion) {
    if (plazos.reposicion.vigente) {
      palancas.push({
        id: 'R-12', titulo: `Estás a tiempo de recurrir (hasta el ${fmt(plazos.reposicion.limite)})`,
        texto: `Cuentas con 10 días hábiles desde la notificación de la resolución. Radica el recurso antes de esa fecha.`,
        tono: 'ok',
      });
    } else {
      palancas.push({
        id: 'R-12', titulo: 'El plazo del recurso pudo vencerse',
        texto: `Los 10 días hábiles desde la notificación habrían vencido el ${fmt(plazos.reposicion.limite)}. Si ya quedó en firme, tu vía es la jurisdicción contencioso-administrativa o atacar la prescripción del cobro. Verifica la fecha exacta de notificación.`,
        tono: 'warn',
      });
    }
  }

  // ====================== CAUSALES (impugnar / recurso) ======================
  if (objetivo === 'impugnar' || objetivo === 'recurso') {

    // Indebida notificación de fotomulta
    if (caso.notifTardia) {
      const detNotif = plazos.notifFotomulta && plazos.notifFotomulta.tardia
        ? ` En este caso, entre la infracción (${fmt(plazos.notifFotomulta.infra)}) y la notificación (${fmt(plazos.notifFotomulta.notif)}) transcurrieron ${plazos.notifFotomulta.diasHabiles} días hábiles, superando el término legal de 13 días hábiles (10 de validación + 3 de envío).`
        : '';
      palancas.push({
        id: 'R-20', titulo: 'La notificación tardía tumba la fotomulta',
        texto: `En fotodetección, la autoridad debe validar el comparendo dentro de 10 días hábiles y enviarlo dentro de los 3 días hábiles siguientes (${NORMAS.ley1843}). Si te notificaron fuera de ese término, se vulneró el debido proceso y procede la nulidad.`,
        tono: 'ok',
      });
      secciones.push({
        n: 'INDEBIDA NOTIFICACIÓN DEL COMPARENDO ELECTRÓNICO',
        cuerpo:
          `El comparendo fue impuesto por medios electrónicos (fotodetección). Conforme al artículo 8 de la ${NORMAS.ley1843}, la autoridad debía validar la contravención dentro de los diez (10) días hábiles siguientes a su detección y remitir la copia al presunto infractor dentro de los tres (3) días hábiles siguientes a la validación.` +
          detNotif +
          ` Al no haberse surtido la notificación dentro del término legal, se configuró una INDEBIDA NOTIFICACIÓN con violación del debido proceso (art. 29 C.P.), por lo que solicito que se declare la NULIDAD del comparendo y se archive la actuación.`,
      });
    }

    // No conducía el vehículo (responsabilidad personal, C-038/2020)
    if (caso.noConducia) {
      palancas.push({
        id: 'R-21', titulo: 'La responsabilidad es personal, no del dueño',
        texto: `La Corte (${NORMAS.c038}) declaró inconstitucional la responsabilidad solidaria automática del propietario. Si no eras tú quien conducía, no se te puede sancionar por la conducta; corresponde vincular al verdadero conductor.`,
        tono: 'ok',
      });
      const idConductor = caso.conductorNombre
        ? ` El vehículo era conducido por ${caso.conductorNombre}${caso.conductorCedula ? `, identificado(a) con C.C. ${caso.conductorCedula}` : ''}, persona a quien debe vincularse a la actuación.`
        : ' Manifiesto bajo gravedad de juramento que no era yo quien conducía el vehículo al momento de los hechos.';
      secciones.push({
        n: 'EL SUSCRITO NO CONDUCÍA EL VEHÍCULO',
        cuerpo:
          `No fui yo quien conducía el vehículo de placas ${caso.placa || '[PLACA]'} en el momento de la presunta infracción.` +
          idConductor +
          ` La responsabilidad contravencional en tránsito es personal y subjetiva; conforme a la ${NORMAS.c038}, no procede sancionar al propietario por una conducta de conducción que no realizó. Solicito que se me EXONERE de responsabilidad y, en su caso, se vincule al verdadero conductor.`,
      });
    }

    // Vehículo enajenado / traspasado
    if (caso.vendido) {
      secciones.push({
        n: 'EL VEHÍCULO HABÍA SIDO ENAJENADO',
        cuerpo:
          `Para la fecha de la presunta infracción yo NO era el propietario del vehículo de placas ${caso.placa || '[PLACA]'}, por haberlo enajenado con anterioridad` +
          (caso.fechaVenta ? ` (la enajenación se realizó el ${fmtIso(caso.fechaVenta)})` : '') +
          `. Adjunto el soporte de la venta/traspaso. En consecuencia, no me corresponde responder por hechos posteriores a la enajenación y solicito que se me desvincule de la actuación.`,
      });
      palancas.push({
        id: 'R-22', titulo: 'Si ya lo habías vendido, no respondes',
        texto: 'Con el contrato de compraventa o el traspaso pruebas que en la fecha del comparendo el carro no era tuyo. Adjúntalo: es prueba directa para desvincularte.',
        tono: 'ok',
      });
    }

    // Señalización ausente o deficiente
    if (caso.senializacion) {
      palancas.push({
        id: 'R-23', titulo: 'No te pueden multar por una señal que no existía',
        texto: 'Si no había señal, estaba dañada, tapada o no era visible, no se te puede exigir cumplir lo que no podías conocer. Fotos del lugar son tu mejor prueba.',
        tono: 'ok',
      });
      secciones.push({
        n: 'AUSENCIA O DEFICIENCIA DE SEÑALIZACIÓN',
        cuerpo:
          `En el lugar de los hechos la señalización era inexistente, insuficiente, no visible o se encontraba en mal estado, por lo que no era posible conocer ni cumplir la regla cuya infracción se imputa. La sanción exige que la señalización sea clara y reglamentaria. Solicito que se valore esta circunstancia y, de oficio, se inspeccione el sitio. Aportaré registro fotográfico del lugar.`,
      });
    }

    // Insuficiencia probatoria
    if (caso.pruebasInsuf) {
      palancas.push({
        id: 'R-24', titulo: 'Si la prueba no muestra la infracción, no hay sanción',
        texto: 'La carga de la prueba es de la autoridad. Si la foto/video no se ve, la placa es ilegible o no se observa la conducta ni el conductor, la duda obra a tu favor.',
        tono: 'ok',
      });
      secciones.push({
        n: 'INSUFICIENCIA PROBATORIA',
        cuerpo:
          `Las pruebas en que se sustenta el comparendo no acreditan la comisión de la infracción: la evidencia no permite observar con claridad la conducta imputada, la placa o la identidad del conductor. La carga de la prueba corresponde a la autoridad y, en caso de duda, debe resolverse a favor del presunto infractor. Solicito que se EXHIBAN y se decreten como prueba la fotografía/video originales, el acta de validación y la hoja de vida y certificado de calibración del equipo de fotodetección.`,
      });
    }

    // Errores en el comparendo
    if (caso.erroresComparendo) {
      secciones.push({
        n: 'ERRORES EN EL COMPARENDO',
        cuerpo:
          `El comparendo contiene errores o inconsistencias que vician el acto` +
          (caso.erroresDetalle ? `: ${caso.erroresDetalle}.` : ' (en datos como la placa, la fecha, la hora, el lugar, el código de la infracción o la identificación del agente).') +
          ` Tales defectos afectan la validez de la actuación y mi derecho de defensa. Solicito que se declare su nulidad o, subsidiariamente, su corrección y la consecuente revisión del fondo.`,
      });
      palancas.push({
        id: 'R-25', titulo: 'Un comparendo con datos errados es atacable',
        texto: 'Placa equivocada, fecha u hora imposibles, código de infracción que no corresponde, o agente no identificado: son vicios que puedes alegar para anular o corregir el comparendo.',
        tono: 'ok',
      });
    }

    // Fuerza mayor / causal de justificación
    if (caso.fuerzaMayor) {
      palancas.push({
        id: 'R-26', titulo: 'Una emergencia puede justificar la conducta',
        texto: 'Si actuaste por una urgencia médica, para evitar un accidente o por orden de la autoridad, hay una causal de justificación. Soporta con pruebas (historia clínica, etc.).',
        tono: 'ok',
      });
      secciones.push({
        n: 'CAUSAL DE JUSTIFICACIÓN / FUERZA MAYOR',
        cuerpo:
          `La conducta imputada estuvo amparada por una causal de justificación o fuerza mayor` +
          (caso.fuerzaMayorDetalle ? `: ${caso.fuerzaMayorDetalle}.` : ' (situación de emergencia o necesidad ajena a mi voluntad).') +
          ` En consecuencia, la conducta no es reprochable a título de culpa y solicito que se me EXONERE de responsabilidad. Aportaré las pruebas que acreditan dicha circunstancia.`,
      });
    }

    // Doble sanción (non bis in ídem)
    if (caso.dobleSancion) {
      secciones.push({
        n: 'VIOLACIÓN AL PRINCIPIO NON BIS IN ÍDEM',
        cuerpo:
          `Se pretende sancionarme dos veces por el mismo hecho, lo que vulnera el principio non bis in ídem (art. 29 C.P.). Solicito que se deje sin efecto la sanción duplicada y se archive la actuación posterior.`,
      });
      palancas.push({
        id: 'R-27', titulo: 'No te pueden sancionar dos veces por lo mismo',
        texto: 'Si hay dos comparendos por el mismo hecho, fecha y lugar, uno debe anularse. Identifica ambos números de comparendo.',
        tono: 'ok',
      });
    }
  }

  // ====================== PRESCRIPCIÓN ======================
  if (objetivo === 'prescripcion') {
    const p = plazos.prescripcion;
    if (p && p.prescrito) {
      palancas.push({
        id: 'R-30', titulo: `Tu comparendo pudo prescribir el ${fmt(p.fecha)}`,
        texto: `La sanción prescribe a los 3 años contados desde la ocurrencia del hecho (${NORMAS.art159}), salvo que te hayan notificado el mandamiento de pago antes de esa fecha. Como ya pasaron los 3 años, puedes pedir que se declare la prescripción. La autoridad debe declararla incluso de oficio.`,
        tono: 'star',
      });
    } else if (p) {
      palancas.push({
        id: 'R-30', titulo: `Aún no prescribe (prescribiría el ${fmt(p.fecha)})`,
        texto: `Faltan ${p.diasFaltan} días para los 3 años desde el hecho. La prescripción se cuenta desde la ocurrencia de la infracción y se interrumpe si te notifican el mandamiento de pago (${NORMAS.art159}). Puedes dejar el derecho de petición listo para cuando se cumpla el término.`,
        tono: 'warn',
      });
    }
    secciones.push({
      n: 'SOLICITUD DE DECLARATORIA DE PRESCRIPCIÓN',
      cuerpo:
        `Solicito que se declare la PRESCRIPCIÓN de la sanción asociada al comparendo N° ${caso.numeroComparendo || '[N° COMPARENDO]'}` +
        (caso.fechaInfraccion ? `, correspondiente a hechos ocurridos el ${fmtIso(caso.fechaInfraccion)}` : '') +
        `. Conforme al ${NORMAS.art159}, las sanciones por infracciones de tránsito prescriben en tres (3) años contados a partir de la ocurrencia del hecho, término que solo se interrumpe con la notificación del mandamiento de pago. A la fecha ha transcurrido dicho término sin que se me haya notificado válidamente el mandamiento de pago, por lo que solicito que se DECLARE la prescripción —incluso de oficio— y se ordene retirar la anotación del SIMIT y de cualquier base de datos.`,
    });
  }

  // ====================== PEDIR PRUEBAS (derecho de petición) ======================
  if (objetivo === 'pruebas') {
    secciones.push({
      n: 'SOLICITUD DE COPIAS Y PRUEBAS DEL COMPARENDO',
      cuerpo:
        `Respecto del comparendo N° ${caso.numeroComparendo || '[N° COMPARENDO]'}` +
        (caso.fechaInfraccion ? ` (hechos del ${fmtIso(caso.fechaInfraccion)})` : '') +
        ` solicito, en ejercicio del derecho de petición (${NORMAS.peticion}), que se me expida COPIA de: (1) el comparendo y todos sus soportes; (2) la fotografía y/o el video que sustentan la infracción, en su versión original y legible; (3) el acta de validación del comparendo electrónico y la identificación del agente que la realizó; (4) la constancia de la fecha y el medio de notificación; y (5) la hoja de vida y el certificado de calibración vigente del equipo de fotodetección. Lo anterior, para ejercer mi derecho de defensa.`,
    });
  }

  // ---------- Derecho de petición: plazo de respuesta (15 hábiles) ----------
  if (objetivo === 'pruebas' || objetivo === 'prescripcion') {
    palancas.push({
      id: 'R-40', titulo: `Deben responderte a más tardar el ${fmt(plazos.respuestaPeticion)}`,
      texto: 'El derecho de petición se responde en 15 días hábiles. Si no responden, NO “ganas” automáticamente: el silencio se entiende negativo, pero la omisión es una falta sancionable y puedes exigir la respuesta mediante acción de tutela.',
      tono: 'ok',
    });
  }

  const doc = documentoMeta(caso);
  return { palancas, secciones, plazos, organismo: org, fechaSolicitud: hoy, doc };
}

/* ---------- cálculo de plazos ---------- */
function calcularPlazos(caso, hoy, tipo, H) {
  const out = {};
  const infra = caso.fechaInfraccion ? H.parseISODate(caso.fechaInfraccion) : null;
  const notif = caso.fechaNotificacion ? H.parseISODate(caso.fechaNotificacion) : null;
  // base para descuentos/impugnación: la notificación; si no hay (comparendo en vía
  // entregado en sitio), se usa la fecha de la infracción.
  const base = notif || infra;
  const P = PLAZOS[tipo];

  if (base && P) {
    // Descuentos
    const transcurridos = H.contarDiasHabiles(base, hoy);
    const fin50 = H.sumarDiasHabiles(base, P.desc50);
    const fin25 = H.sumarDiasHabiles(base, P.desc25Hasta);
    let estado = 'vencido';
    if (transcurridos <= P.desc50) estado = 'desc50';
    else if (transcurridos <= P.desc25Hasta) estado = 'desc25';
    out.descuento = { estado, fin50, fin25, transcurridos };

    // Plazo para impugnar (comparecer)
    const limite = H.sumarDiasHabiles(base, P.impugnar);
    out.impugnar = { dias: P.impugnar, limite, vigente: hoy <= limite };
  }

  // Notificación de fotomulta (indebida si > 13 hábiles entre infracción y notificación)
  if (tipo === 'electronico' && infra && notif) {
    const diasHabiles = H.contarDiasHabiles(infra, notif);
    out.notifFotomulta = {
      infra, notif, diasHabiles,
      tardia: diasHabiles > PLAZOS.notifFotomulta,
    };
  }

  // Prescripción (3 años desde el hecho)
  if (caso.objetivo === 'prescripcion' && infra) {
    const fecha = H.sumarAnios(infra, 3);
    const prescrito = hoy >= fecha;
    const msDia = 1000 * 60 * 60 * 24;
    const diasFaltan = Math.max(0, Math.ceil((fecha - hoy) / msDia));
    out.prescripcion = { fecha, prescrito, diasFaltan };
  }

  // Recurso de reposición (10 hábiles desde notificación de la resolución)
  if (caso.objetivo === 'recurso' && caso.fechaNotifResolucion) {
    const baseRes = H.parseISODate(caso.fechaNotifResolucion);
    const limite = H.sumarDiasHabiles(baseRes, PLAZOS.reposicion);
    out.reposicion = { limite, vigente: hoy <= limite };
  }

  // Respuesta a derecho de petición
  out.respuestaPeticion = H.fechaRespuestaPeticion(hoy);
  return out;
}

// "Identidad" del documento según el trámite: título, encabezado y frase de saludo.
function documentoMeta(caso) {
  switch (caso.objetivo) {
    case 'impugnar':
      return {
        tipo: 'impugnacion',
        titulo: 'ESCRITO DE IMPUGNACIÓN Y SOLICITUD DE PRÁCTICA DE PRUEBAS',
        subtitulo: 'Audiencia pública — art. 136 de la Ley 769 de 2002',
        fraseSaludo: 'de manera respetuosa IMPUGNO el comparendo de la referencia y expongo:',
      };
    case 'recurso':
      return {
        tipo: 'recurso',
        titulo: 'RECURSO DE REPOSICIÓN Y EN SUBSIDIO APELACIÓN',
        subtitulo: 'Arts. 74 y 76 de la Ley 1437 de 2011 (CPACA)',
        fraseSaludo: 'interpongo RECURSO DE REPOSICIÓN y, en subsidio, de APELACIÓN contra la resolución de la referencia, con base en lo siguiente:',
      };
    case 'prescripcion':
      return {
        tipo: 'peticion',
        titulo: 'DERECHO DE PETICIÓN — DECLARATORIA DE PRESCRIPCIÓN',
        subtitulo: 'Art. 23 C.P., Ley 1755 de 2015 y art. 159 de la Ley 769 de 2002',
        fraseSaludo: 'en ejercicio del derecho de petición presento la siguiente solicitud:',
      };
    case 'pruebas':
    default:
      return {
        tipo: 'peticion',
        titulo: 'DERECHO DE PETICIÓN — SOLICITUD DE COPIAS Y PRUEBAS',
        subtitulo: 'Art. 23 C.P. y Ley 1755 de 2015',
        fraseSaludo: 'en ejercicio del derecho de petición presento la siguiente solicitud:',
      };
  }
}

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
function fmt(date) {
  return `${date.getDate()} de ${MESES[date.getMonth()]} de ${date.getFullYear()}`;
}
function fmtIso(iso) {
  try { return fmt(window.Habiles.parseISODate(iso)); } catch (e) { return iso; }
}

window.Reglas = { evaluarCaso, fmt, fmtIso, NORMAS, PLAZOS };
