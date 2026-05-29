/*
 * templates.js — Generador del documento PQR a partir del caso y las secciones
 * que produjo el motor de reglas (rules.js).
 */

function generarPQR(caso, evalRes) {
  const op = evalRes.operador;
  const fechaTxt = window.Reglas.fmt(evalRes.fechaSolicitud);
  const razon = op.razonSocial ? `${op.nombre.toUpperCase()} — ${op.razonSocial}` : (caso.operadorNombre || '[OPERADOR]');
  const nit = op.nit ? `NIT ${op.nit}\n` : '';

  const asunto = 'Petición, Queja y Reclamo (PQR)' +
    (caso.contrato ? ` — Contrato N° ${caso.contrato}` : '') +
    (caso.yaRadicoRetiro && caso.cunRetiro ? ` — Radicado de retiro ${caso.cunRetiro}` : '');

  const doc = evalRes.doc || { titulo: 'PETICIÓN, QUEJA Y RECLAMO (PQR)', esPQR: true };
  const L = [];
  L.push(doc.titulo);
  L.push('');
  L.push(`Asunto: ${seccionesResumen(evalRes.secciones)}.`);
  if (caso.contrato) L.push(`Contrato N° ${caso.contrato}.`);
  L.push('');
  L.push(`Señores ${razon}`);
  if (nit) L.push(nit.trim());
  L.push('Atención al Usuario');
  L.push(`${caso.ciudad || '[CIUDAD]'}, ${fechaTxt}`);
  L.push('');
  L.push(saludo(caso, doc));
  L.push('');

  evalRes.secciones.forEach((s, i) => {
    L.push(`${i + 1}. ${s.n}`);
    L.push(s.cuerpo);
    L.push('');
  });

  L.push('PETICIONES CONCRETAS');
  peticiones(caso, evalRes).forEach((p, i) => L.push(`  ${i + 1}. ${p}`));
  L.push('');

  L.push('NOTIFICACIONES');
  L.push(`Recibiré respuesta y notificaciones en: Teléfono ${caso.telefono || '[TELÉFONO]'} · Correo ${caso.correo || '[CORREO]'}` +
    (caso.direccion ? ` · Dirección ${caso.direccion}` : '') + '.');
  L.push('');
  L.push('Atentamente,');
  L.push('');
  L.push('_______________________________');
  L.push(`${(caso.nombre || '[NOMBRE COMPLETO]').toUpperCase()}`);
  L.push(`C.C. ${caso.cedula || '[CÉDULA]'}` + (caso.contrato ? ` — Contrato N° ${caso.contrato}` : ''));

  return { asunto, texto: L.join('\n') };
}

function saludo(caso, doc) {
  const frase = (doc && doc.fraseSaludo) || 'presento la siguiente Petición, Queja y Reclamo:';
  const serv = ({ internet: 'Internet', tv: 'Televisión', telefonia: 'Telefonía', paquete: 'paquete hogar' })[caso.servicio] || 'servicios de comunicaciones';
  return `Yo, ${(caso.nombre || '[NOMBRE]').toUpperCase()}, mayor de edad, identificado(a) con cédula de ciudadanía N° ${caso.cedula || '[CÉDULA]'}, en mi calidad de titular del contrato N° ${caso.contrato || '[CONTRATO]'}` +
    (caso.referentePago ? ` (referente de pago ${caso.referentePago})` : '') +
    `, correspondiente a ${serv}` +
    (caso.direccion ? ` en la dirección ${caso.direccion}` : '') +
    `, ${frase}`;
}

function seccionesResumen(secciones) {
  const map = {
    'TERMINACIÓN DEL CONTRATO': 'Terminación de contrato',
    'RECLAMACIÓN DE COMPENSACIÓN POR FALLAS': 'Compensación por fallas',
    'VISITA TÉCNICA NO REALIZADA Y REPORTE FALSO': 'Visita técnica no realizada',
    'OBJECIÓN DE COBRO': 'Objeción de cobro',
    'CANCELACIÓN DE SUSCRIPCIÓN Y REVERSIÓN DE COBRO': 'Cancelación de suscripción y reversión',
    'CESE DE CONTACTO Y EXCLUSIÓN DE BASES DE DATOS': 'Cese de contacto y exclusión de bases',
    'HABEAS DATA — NO REPORTE Y/O SUPRESIÓN': 'Habeas data (no reporte / supresión)',
    'PORTABILIDAD NUMÉRICA': 'Portabilidad numérica',
    'RESTITUCIÓN DE SALDO': 'Restitución de saldo',
    'BLOQUEO DE IMEI POR HURTO/PÉRDIDA': 'Bloqueo de equipo (IMEI)',
    'EXCLUSIÓN DE BASE NEGATIVA (DESBLOQUEO DE IMEI)': 'Desbloqueo de equipo (IMEI)',
  };
  return secciones.map(s => map[s.n] || s.n).join(' · ');
}

function peticiones(caso, evalRes) {
  const ps = [];
  const tiene = (n) => evalRes.secciones.some(s => s.n === n);
  if (tiene('TERMINACIÓN DEL CONTRATO')) ps.push('Confirmar la fecha efectiva de terminación del contrato e informar sobre la portabilidad del número.');
  if (tiene('RECLAMACIÓN DE COMPENSACIÓN POR FALLAS')) ps.push('Entregar el histórico de fallas y radicados, y aplicar la compensación correspondiente en las facturas afectadas.');
  if (tiene('VISITA TÉCNICA NO REALIZADA Y REPORTE FALSO')) ps.push('Entregar el listado de casos reportados y el soporte de la visita técnica (fecha, hora e identificación del técnico).');
  if (tiene('OBJECIÓN DE COBRO')) ps.push('Abstenerse de cobrar el periodo en disputa, así como reconexión o intereses, y no condicionar este PQR al pago.');
  if (tiene('CANCELACIÓN DE SUSCRIPCIÓN Y REVERSIÓN DE COBRO')) ps.push('Cancelar toda suscripción de contenidos, revertir los cobros y devolver el saldo descontado, e inscribir el número en el Registro Nacional de Excluidos.');
  if (tiene('CESE DE CONTACTO Y EXCLUSIÓN DE BASES DE DATOS')) ps.push('Cesar el contacto fuera de horario o reiterado, no contactar referencias y suprimir mi número de las bases de datos de cobranza.');
  if (tiene('HABEAS DATA — NO REPORTE Y/O SUPRESIÓN')) ps.push('Abstenerse de reportar (o retirar el reporte de) la obligación en disputa y suprimir mis datos al terminar la relación.');
  if (tiene('PORTABILIDAD NUMÉRICA')) ps.push('Tramitar la portabilidad sin condicionarla a pagos ni dilatarla, dentro del plazo de máximo tres (3) días hábiles.');
  if (tiene('RESTITUCIÓN DE SALDO')) ps.push('Restituir el saldo no consumido al que tengo derecho conforme a las condiciones de prepago.');
  if (tiene('BLOQUEO DE IMEI POR HURTO/PÉRDIDA')) ps.push('Incluir el IMEI reportado en la base negativa para impedir el uso del equipo.');
  if (tiene('EXCLUSIÓN DE BASE NEGATIVA (DESBLOQUEO DE IMEI)')) ps.push('Excluir el IMEI de la base negativa al acreditar la propiedad del equipo.');
  // Cierre: los PQR tienen el plazo de 15 días hábiles (y disparan el SAP);
  // las solicitudes con plazo propio (portabilidad, IMEI) usan su propio cierre.
  const doc = evalRes.doc || { esPQR: true };
  if (doc.esPQR) {
    ps.push('Dar respuesta de fondo dentro de los quince (15) días hábiles legales.');
  } else if (evalRes.secciones.some(s => s.n === 'PORTABILIDAD NUMÉRICA')) {
    ps.push('Tramitar lo solicitado sin dilación, dentro del plazo regulatorio de máximo tres (3) días hábiles.');
  } else {
    ps.push('Atender la presente solicitud conforme a los plazos regulatorios aplicables y entregar el radicado correspondiente.');
  }
  return ps;
}

/* ---------- versión HTML formateada (para imprimir / guardar PDF) ---------- */

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// "VISITA TÉCNICA NO REALIZADA" -> "Visita técnica no realizada"
function tituloSeccion(n) {
  const s = String(n).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generarPQRHtml(caso, evalRes) {
  const op = evalRes.operador;
  const doc = evalRes.doc || { titulo: 'PETICIÓN, QUEJA Y RECLAMO (PQR)', esPQR: true };
  const fechaTxt = window.Reglas.fmt(evalRes.fechaSolicitud);
  const razon = op.razonSocial ? `${op.nombre.toUpperCase()} — ${op.razonSocial}` : (caso.operadorNombre || op.nombre || '[OPERADOR]');

  const ref = [];
  ref.push(`<span class="et">Referencia:</span> ${escHtml(doc.titulo)} — ${escHtml(seccionesResumen(evalRes.secciones))}.`);
  const refLinea2 = [];
  if (caso.contrato) refLinea2.push(`<span class="et">Contrato N°:</span> ${escHtml(caso.contrato)}`);
  if (caso.referentePago) refLinea2.push(`<span class="et">Referente de pago:</span> ${escHtml(caso.referentePago)}`);
  if (caso.yaRadicoRetiro && caso.cunRetiro) refLinea2.push(`<span class="et">Radicado de retiro:</span> ${escHtml(caso.cunRetiro)}`);
  if (refLinea2.length) ref.push(refLinea2.join(' &nbsp;·&nbsp; '));

  const secHtml = evalRes.secciones.map((s, i) =>
    `<h2>${i + 1}. ${escHtml(tituloSeccion(s.n))}</h2>\n  <p>${escHtml(s.cuerpo)}</p>`
  ).join('\n\n  ');

  const petHtml = peticiones(caso, evalRes).map(p => `<li>${escHtml(p)}</li>`).join('\n      ');

  const notif = `Recibiré respuesta y notificaciones en: teléfono ${escHtml(caso.telefono || '[TELÉFONO]')}; ` +
    `correo electrónico ${escHtml(caso.correo || '[CORREO]')}` +
    (caso.direccion ? `; dirección ${escHtml(caso.direccion)}` : '') + '.';

  const nombre = escHtml((caso.nombre || '[NOMBRE COMPLETO]').toUpperCase());

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>${escHtml(doc.titulo)}${caso.contrato ? ' — Contrato ' + escHtml(caso.contrato) : ''}</title>
<style>
  @page { size: Letter; margin: 2.5cm 2.5cm 2cm 2.8cm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Serif', 'Times New Roman', Georgia, serif; font-size: 11.5pt; color: #000; line-height: 1.32; margin: 0; }
  @media screen { body { max-width: 21.6cm; margin: 24px auto; padding: 2.5cm 2.8cm; background: #fff; box-shadow: 0 1px 8px rgba(0,0,0,.15); } }
  .ciudad-fecha { text-align: right; margin-bottom: 16px; }
  .dest { margin-bottom: 14px; }
  .ref { margin: 14px 0; }
  .ref .et { font-weight: bold; }
  p { margin: 0 0 8px; text-align: justify; }
  h2 { font-size: 11.5pt; margin: 12px 0 5px; page-break-after: avoid; }
  ol { margin: 5px 0 8px; padding-left: 26px; }
  ol li { margin-bottom: 3px; text-align: justify; }
  .saludo { margin-bottom: 10px; }
  .firma { margin-top: 28px; page-break-inside: avoid; }
  .firma .cierre { margin-bottom: 30px; }
  .firma .linea { border-top: 1px solid #000; width: 7cm; padding-top: 4px; }
</style></head>
<body>

  <div class="ciudad-fecha">${escHtml(caso.ciudad || '[CIUDAD]')}, ${fechaTxt}</div>

  <div class="dest">
    Señores<br>
    <strong>${escHtml(razon)}</strong><br>
    ${op.nit ? 'NIT ' + escHtml(op.nit) + '<br>' : ''}Área de Atención al Usuario<br>
    E.&nbsp;S.&nbsp;D.
  </div>

  <div class="ref">${ref.join('<br>\n    ')}</div>

  <p class="saludo">Cordial saludo:</p>

  <p>${escHtml(saludo(caso, doc))}</p>

  ${secHtml}

  <h2>Peticiones concretas</h2>
  <ol>
      ${petHtml}
  </ol>

  <h2>Notificaciones</h2>
  <p>${notif}</p>

  <div class="firma">
    <p class="cierre">Atentamente,</p>
    <div class="linea">
      <strong>${nombre}</strong><br>
      C.C. ${escHtml(caso.cedula || '[CÉDULA]')}${caso.contrato ? '<br>Contrato N° ' + escHtml(caso.contrato) : ''}
    </div>
  </div>

</body></html>`;
}

window.Plantillas = { generarPQR, generarPQRHtml };
