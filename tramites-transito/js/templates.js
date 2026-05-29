/*
 * templates.js — Generador del documento (impugnación / derecho de petición / recurso)
 * a partir del caso y las secciones que produjo el motor de reglas (rules.js).
 * Produce versión en texto plano y versión HTML formateada para imprimir/PDF.
 */

function generarDoc(caso, evalRes) {
  const org = evalRes.organismo;
  const doc = evalRes.doc;
  const fechaTxt = window.Reglas.fmt(evalRes.fechaSolicitud);
  const L = [];

  L.push(doc.titulo);
  if (doc.subtitulo) L.push(`(${doc.subtitulo})`);
  L.push('');
  L.push(`${caso.ciudad || '[CIUDAD]'}, ${fechaTxt}`);
  L.push('');
  L.push('Señores');
  L.push(org.autoridad.toUpperCase());
  L.push(`${org.nombre}`);
  L.push('E. S. D.');
  L.push('');
  L.push(`Referencia: ${referencia(caso, doc)}`);
  L.push('');
  L.push(saludo(caso, doc));
  L.push('');

  // HECHOS (descripción libre del usuario), si la dio.
  if (caso.descripcionHechos) {
    L.push('HECHOS');
    L.push(caso.descripcionHechos);
    L.push('');
  }

  evalRes.secciones.forEach((s, i) => {
    L.push(`${i + 1}. ${s.n}`);
    L.push(s.cuerpo);
    L.push('');
  });

  L.push('PETICIONES');
  peticiones(caso, evalRes).forEach((p, i) => L.push(`  ${i + 1}. ${p}`));
  L.push('');

  if (doc.tipo === 'impugnacion' || doc.tipo === 'recurso') {
    L.push('PRUEBAS');
    L.push(pruebasTexto(caso, evalRes));
    L.push('');
  }

  L.push('NOTIFICACIONES');
  L.push(`Recibiré respuesta y notificaciones en: Dirección ${caso.direccion || '[DIRECCIÓN]'}` +
    ` · Teléfono ${caso.telefono || '[TELÉFONO]'} · Correo ${caso.correo || '[CORREO]'}.`);
  L.push('');
  L.push('Atentamente,');
  L.push('');
  L.push('_______________________________');
  L.push(`${(caso.nombre || '[NOMBRE COMPLETO]').toUpperCase()}`);
  L.push(`C.C. ${caso.cedula || '[CÉDULA]'}` + (caso.placa ? ` — Vehículo de placas ${caso.placa}` : ''));

  return { texto: L.join('\n') };
}

function referencia(caso, doc) {
  if (doc.tipo === 'recurso') {
    return `Recurso contra la Resolución N° ${caso.numeroResolucion || '[N° RESOLUCIÓN]'}` +
      (caso.numeroComparendo ? `, comparendo N° ${caso.numeroComparendo}` : '') +
      (caso.placa ? `, vehículo de placas ${caso.placa}` : '') + '.';
  }
  return `Comparendo N° ${caso.numeroComparendo || '[N° COMPARENDO]'}` +
    (caso.placa ? `, vehículo de placas ${caso.placa}` : '') +
    (caso.fechaInfraccion ? `, hechos del ${window.Reglas.fmtIso(caso.fechaInfraccion)}` : '') + '.';
}

function saludo(caso, doc) {
  return `Yo, ${(caso.nombre || '[NOMBRE]').toUpperCase()}, mayor de edad, identificado(a) con cédula de ciudadanía N° ${caso.cedula || '[CÉDULA]'}` +
    (caso.placa ? `, en relación con el vehículo de placas ${caso.placa}` : '') +
    `, ${doc.fraseSaludo}`;
}

function peticiones(caso, evalRes) {
  const ps = [];
  const tipo = evalRes.doc.tipo;
  const tiene = (n) => evalRes.secciones.some(s => s.n === n);

  if (tipo === 'impugnacion') {
    ps.push('REVOCAR y dejar sin efecto el comparendo de la referencia, ARCHIVANDO la actuación.');
    ps.push('Citar a AUDIENCIA PÚBLICA y DECRETAR las pruebas solicitadas, así como las de oficio que resulten conducentes.');
  } else if (tipo === 'recurso') {
    ps.push('REPONER y, en subsidio, conceder la APELACIÓN, REVOCANDO la resolución sancionatoria de la referencia.');
    ps.push('En consecuencia, ARCHIVAR la actuación y dejar sin efecto la sanción y sus anotaciones en el SIMIT.');
  }

  if (tiene('INDEBIDA NOTIFICACIÓN DEL COMPARENDO ELECTRÓNICO')) ps.push('DECLARAR la nulidad del comparendo por indebida notificación y violación del debido proceso.');
  if (tiene('EL SUSCRITO NO CONDUCÍA EL VEHÍCULO')) ps.push('EXONERARME de responsabilidad por no haber sido el conductor y, en su caso, vincular al verdadero conductor.');
  if (tiene('EL VEHÍCULO HABÍA SIDO ENAJENADO')) ps.push('DESVINCULARME de la actuación por no ser propietario del vehículo en la fecha de los hechos.');
  if (tiene('AUSENCIA O DEFICIENCIA DE SEÑALIZACIÓN')) ps.push('VALORAR la ausencia o deficiencia de señalización y disponer la inspección del sitio.');
  if (tiene('INSUFICIENCIA PROBATORIA')) ps.push('EXHIBIR la fotografía/video originales, el acta de validación y el certificado de calibración del equipo, y resolver la duda a mi favor.');
  if (tiene('ERRORES EN EL COMPARENDO')) ps.push('DECLARAR la nulidad o corregir los errores del comparendo y revisar el fondo.');
  if (tiene('CAUSAL DE JUSTIFICACIÓN / FUERZA MAYOR')) ps.push('RECONOCER la causal de justificación / fuerza mayor y EXONERARME de responsabilidad.');
  if (tiene('VIOLACIÓN AL PRINCIPIO NON BIS IN ÍDEM')) ps.push('DEJAR SIN EFECTO la sanción duplicada por el mismo hecho.');
  if (tiene('SOLICITUD DE DECLARATORIA DE PRESCRIPCIÓN')) {
    ps.push('DECLARAR la prescripción de la sanción conforme al artículo 159 de la Ley 769 de 2002, incluso de oficio.');
    ps.push('RETIRAR la anotación del comparendo en el SIMIT y demás bases de datos.');
  }
  if (tiene('SOLICITUD DE COPIAS Y PRUEBAS DEL COMPARENDO')) {
    ps.push('EXPEDIR copia del comparendo, la fotografía/video, el acta de validación, la constancia de notificación y el certificado de calibración del equipo.');
  }

  // Cierre con plazo según el tipo de documento.
  if (tipo === 'peticion') {
    ps.push('Dar respuesta de fondo dentro de los quince (15) días hábiles legales (Ley 1755 de 2015).');
  } else {
    ps.push('Tener en cuenta la dirección y los datos de notificación señalados al final.');
  }
  return ps;
}

function pruebasTexto(caso, evalRes) {
  const items = [];
  if (caso.notifTardia) items.push('la constancia de la fecha y el medio de notificación del comparendo electrónico');
  if (caso.noConducia) items.push('la prueba de que no era el conductor (declaración y, en su caso, identificación del verdadero conductor)');
  if (caso.vendido) items.push('el contrato de compraventa o documento de traspaso del vehículo');
  if (caso.senializacion) items.push('registro fotográfico del lugar que evidencia la ausencia o deficiencia de señalización');
  if (caso.pruebasInsuf) items.push('la fotografía/video originales, el acta de validación y el certificado de calibración del equipo de fotodetección');
  if (caso.erroresComparendo) items.push('copia del comparendo donde constan los errores alegados');
  if (caso.fuerzaMayor) items.push('los documentos que acreditan la causal de justificación o fuerza mayor');
  if (!items.length) return 'Solicito que se decreten y practiquen las pruebas conducentes, y aportaré los soportes correspondientes.';
  return 'Solicito tener como pruebas y/o decretar: ' + items.join('; ') + '.';
}

/* ---------- versión HTML formateada (para imprimir / guardar PDF) ---------- */

function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tituloSeccion(n) {
  const s = String(n).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generarDocHtml(caso, evalRes) {
  const org = evalRes.organismo;
  const doc = evalRes.doc;
  const fechaTxt = window.Reglas.fmt(evalRes.fechaSolicitud);

  const hechos = caso.descripcionHechos
    ? `<h2>Hechos</h2>\n  <p>${escHtml(caso.descripcionHechos)}</p>\n\n  ` : '';

  const secHtml = evalRes.secciones.map((s, i) =>
    `<h2>${i + 1}. ${escHtml(tituloSeccion(s.n))}</h2>\n  <p>${escHtml(s.cuerpo)}</p>`
  ).join('\n\n  ');

  const petHtml = peticiones(caso, evalRes).map(p => `<li>${escHtml(p)}</li>`).join('\n      ');

  const pruebasHtml = (doc.tipo === 'impugnacion' || doc.tipo === 'recurso')
    ? `<h2>Pruebas</h2>\n  <p>${escHtml(pruebasTexto(caso, evalRes))}</p>\n\n  ` : '';

  const notif = `Recibiré respuesta y notificaciones en: dirección ${escHtml(caso.direccion || '[DIRECCIÓN]')}; ` +
    `teléfono ${escHtml(caso.telefono || '[TELÉFONO]')}; correo electrónico ${escHtml(caso.correo || '[CORREO]')}.`;

  const nombre = escHtml((caso.nombre || '[NOMBRE COMPLETO]').toUpperCase());

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>${escHtml(doc.titulo)}${caso.numeroComparendo ? ' — Comparendo ' + escHtml(caso.numeroComparendo) : ''}</title>
<style>
  @page { size: Letter; margin: 2.5cm 2.5cm 2cm 2.8cm; }
  * { box-sizing: border-box; }
  body { font-family: 'Liberation Serif', 'Times New Roman', Georgia, serif; font-size: 11.5pt; color: #000; line-height: 1.32; margin: 0; }
  @media screen { body { max-width: 21.6cm; margin: 24px auto; padding: 2.5cm 2.8cm; background: #fff; box-shadow: 0 1px 8px rgba(0,0,0,.15); } }
  h1 { font-size: 13pt; text-align: center; margin: 0 0 2px; }
  .sub { text-align: center; font-size: 10pt; font-style: italic; margin: 0 0 18px; }
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

  <h1>${escHtml(doc.titulo)}</h1>
  ${doc.subtitulo ? `<p class="sub">${escHtml(doc.subtitulo)}</p>` : ''}

  <div class="ciudad-fecha">${escHtml(caso.ciudad || '[CIUDAD]')}, ${fechaTxt}</div>

  <div class="dest">
    Señores<br>
    <strong>${escHtml(org.autoridad)}</strong><br>
    ${escHtml(org.nombre)}<br>
    E.&nbsp;S.&nbsp;D.
  </div>

  <div class="ref"><span class="et">Referencia:</span> ${escHtml(referencia(caso, doc))}</div>

  <p>${escHtml(saludo(caso, doc))}</p>

  ${hechos}${secHtml}

  <h2>Peticiones</h2>
  <ol>
      ${petHtml}
  </ol>

  ${pruebasHtml}<h2>Notificaciones</h2>
  <p>${notif}</p>

  <div class="firma">
    <p class="cierre">Atentamente,</p>
    <div class="linea">
      <strong>${nombre}</strong><br>
      C.C. ${escHtml(caso.cedula || '[CÉDULA]')}${caso.placa ? '<br>Vehículo de placas ' + escHtml(caso.placa) : ''}
    </div>
  </div>

</body></html>`;
}

window.Plantillas = { generarDoc, generarDocHtml };
