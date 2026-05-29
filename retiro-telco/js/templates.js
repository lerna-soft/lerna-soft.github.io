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

  const L = [];
  L.push('PETICIÓN, QUEJA Y RECLAMO (PQR)');
  L.push('');
  L.push(`Asunto: ${seccionesResumen(evalRes.secciones)}.`);
  if (caso.contrato) L.push(`Contrato N° ${caso.contrato}.`);
  L.push('');
  L.push(`Señores ${razon}`);
  if (nit) L.push(nit.trim());
  L.push('Atención al Usuario');
  L.push(`${caso.ciudad || '[CIUDAD]'}, ${fechaTxt}`);
  L.push('');
  L.push(saludo(caso));
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

function saludo(caso) {
  const serv = ({ internet: 'Internet', tv: 'Televisión', telefonia: 'Telefonía', paquete: 'paquete hogar' })[caso.servicio] || 'servicios de comunicaciones';
  return `Yo, ${(caso.nombre || '[NOMBRE]').toUpperCase()}, mayor de edad, identificado(a) con cédula de ciudadanía N° ${caso.cedula || '[CÉDULA]'}, en mi calidad de titular del contrato N° ${caso.contrato || '[CONTRATO]'}` +
    (caso.referentePago ? ` (referente de pago ${caso.referentePago})` : '') +
    `, correspondiente a ${serv}` +
    (caso.direccion ? ` en la dirección ${caso.direccion}` : '') +
    `, presento la siguiente Petición, Queja y Reclamo:`;
}

function seccionesResumen(secciones) {
  const map = {
    'TERMINACIÓN DEL CONTRATO': 'Terminación de contrato',
    'RECLAMACIÓN DE COMPENSACIÓN POR FALLAS': 'Compensación por fallas',
    'VISITA TÉCNICA NO REALIZADA Y REPORTE FALSO': 'Visita técnica no realizada',
    'OBJECIÓN DE COBRO': 'Objeción de cobro',
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
  ps.push('Dar respuesta de fondo dentro de los quince (15) días hábiles legales.');
  return ps;
}

window.Plantillas = { generarPQR };
