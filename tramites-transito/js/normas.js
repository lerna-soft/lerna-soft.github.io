/*
 * normas.js — Consultor de derechos en la vía ("cuando te para un agente").
 * Base de conocimiento buscable: qué SÍ y qué NO puede hacer un agente de tránsito,
 * con la norma para responder con argumentos en el momento.
 *
 * Búsqueda: por palabra clave, sinónimos coloquiales (claves) y número de artículo/ley
 * (que viaja en `norma` y en `claves`). El match ignora tildes y mayúsculas.
 *
 * IMPORTANTE: información de apoyo, no asesoría jurídica. Las normas y tarifas cambian;
 * verifica el caso concreto. Datos con fundamento en la Ley 769 de 2002, la Ley 1843
 * de 2017, la Ley 1696 de 2013, el Código Nacional de Seguridad y Convivencia Ciudadana
 * (Ley 1801 de 2016) y jurisprudencia (C-521/1999, C-038/2020).
 */

const NORMAS_VIA = [
  {
    id: 'grabar',
    cat: 'Tus derechos',
    titulo: 'Puedes grabar el procedimiento',
    dicen: 'Le dicen que no puede grabar, o le quieren quitar el celular.',
    realidad: 'Tienes derecho a grabar cualquier procedimiento de la autoridad en la vía. El agente NO puede impedírtelo ni quitarte el teléfono. Grabar protege a ambas partes.',
    norma: 'Art. 21, Código Nacional de Seguridad y Convivencia Ciudadana (Ley 1801 de 2016).',
    tip: 'Graba con respeto, sin obstruir. Di: "Estoy ejerciendo mi derecho a grabar el procedimiento (art. 21, Ley 1801 de 2016)".',
    claves: 'grabar video filmar celular telefono camara del celular me quita el celular ley 1801 articulo 21 codigo de policia derecho a grabar',
  },
  {
    id: 'identificacion',
    cat: 'Tus derechos',
    titulo: 'El agente debe identificarse',
    dicen: 'Un agente sin identificación clara pretende imponer un comparendo.',
    realidad: 'El agente debe estar uniformado e identificado, y el comparendo debe indicar quién lo impone, la fecha, el lugar, la norma presuntamente infringida y el código de la infracción. Tienes derecho a saber con quién hablas y por qué.',
    norma: 'Ley 769 de 2002 (procedimiento del comparendo).',
    claves: 'identificacion agente policia placa institucional uniforme quien es nombre del agente sin identificar ley 769',
    tip: 'Pide nombre, placa institucional y el motivo concreto. Anótalo. Un comparendo sin estos datos es atacable.',
  },
  {
    id: 'retener-licencia',
    cat: 'Documentos',
    titulo: 'No te pueden retener la licencia (salvo embriaguez)',
    dicen: 'Le dicen que le retienen la licencia "hasta que pague" o como garantía.',
    realidad: 'Ninguna autoridad puede retener tu licencia de conducción como garantía de pago. La excepción es la retención preventiva en casos de embriaguez, que se registra de inmediato en el RUNT.',
    norma: 'Corte Constitucional, Sentencia C-521 de 1999; Ley 1696 de 2013 (caso embriaguez).',
    claves: 'retener licencia quitar licencia me quitan el pase pase licencia de conduccion garantia c-521 c521 sentencia 1999 runt no me devuelven la licencia',
    tip: 'Si no es por embriaguez, di: "La Corte (C-521/1999) prohíbe retener la licencia. Impóngame el comparendo si corresponde, pero no puede quedarse con mi documento".',
  },
  {
    id: 'soat-tecno-quieto',
    cat: 'Documentos',
    titulo: 'SOAT o tecnomecánica vencidos: solo si circulas',
    dicen: 'Le dicen que le inmovilizan el carro estacionado por tener el SOAT o la tecnomecánica vencidos.',
    realidad: 'La infracción por SOAT o revisión tecnomecánica vencidos se configura solo si el vehículo está CIRCULANDO. Si está estacionado o guardado y no transita, no procede comparendo ni inmovilización por ese motivo.',
    norma: 'Ley 769 de 2002; criterio reiterado (la conducta sancionable es transitar).',
    claves: 'soat tecnomecanica tecno tecnico mecanica revision vencido vencida estacionado parqueado quieto guardado garaje no circula sin movimiento seguro del carro ley 769',
    tip: 'Si el carro estaba quieto, déjalo por escrito en el comparendo ("EL VEHÍCULO NO SE ENCONTRABA EN CIRCULACIÓN") y luego impúgnalo.',
  },
  {
    id: 'soat-tecno-circula',
    cat: 'Documentos',
    titulo: 'Circular sin SOAT o sin tecnomecánica sí se sanciona',
    dicen: '¿Es verdad que multan e inmovilizan por circular sin SOAT?',
    realidad: 'Sí. Conducir sin SOAT vigente se sanciona (alrededor de 30 SMDLV) y puede llevar a inmovilización; sin revisión tecnomecánica vigente, multa adicional (alrededor de 15 SMDLV). Aquí la ley sí está del lado de la autoridad.',
    norma: 'Ley 769 de 2002, arts. 131 y siguientes.',
    claves: 'soat tecnomecanica tecno revision vencido circular conduciendo multa valor cuanto cuesta smdlv articulo 131 ley 769 inmovilizan por soat',
    tip: 'No es un caso para "tumbar": lo mejor es regularizar los documentos. Verifica que el comparendo no tenga errores de datos.',
  },
  {
    id: 'licencia-digital',
    cat: 'Documentos',
    titulo: 'La licencia y el SOAT pueden verificarse digitalmente',
    dicen: 'Le dicen que es comparendo por no llevar los documentos físicos encima.',
    realidad: 'El SOAT es digital y se verifica en el RUNT; la licencia y la tarjeta de propiedad también se consultan en el sistema. Si tus documentos están vigentes y registrados, el agente puede verificarlos electrónicamente.',
    norma: 'SOAT digital (normativa vigente); RUNT.',
    claves: 'no portar documentos fisicos licencia digital soat digital tarjeta de propiedad licencia de transito runt verificar en el sistema no llevo los papeles olvide los documentos',
    tip: 'Pide que verifique en el RUNT antes de imponer comparendo por "no portar". Si igual lo impone, impúgnalo probando que estaban vigentes.',
  },
  {
    id: 'inmovilizacion',
    cat: 'Inmovilización',
    titulo: 'La inmovilización tiene causales tasadas',
    dicen: 'Le dicen que le llevan el carro a patios "por cualquier" infracción.',
    realidad: 'La inmovilización solo procede en las causales que señala la ley (p. ej., embriaguez, sin licencia válida, sin SOAT circulando, entre otras). No toda infracción permite llevarse el vehículo. La inmovilización cesa al subsanar la causa.',
    norma: 'Art. 125 de la Ley 769 de 2002 (modificado por la Ley 1843 de 2017).',
    claves: 'inmovilizacion inmovilizar grua gruas patios se llevan el carro se lo llevan llevarse el vehiculo a patios articulo 125 art 125 ley 769 ley 1843 causales',
    tip: 'Pregunta cuál es la causal EXACTA de inmovilización. Si la infracción no está en la lista del art. 125, no procede llevarse el carro.',
  },
  {
    id: 'tercero-conductor',
    cat: 'Inmovilización',
    titulo: 'A veces un tercero con licencia puede evitar la grúa',
    dicen: 'Le inmovilizan el carro porque usted no tiene licencia, pero su acompañante sí.',
    realidad: 'Cuando la causa de inmovilización es del conductor (no del vehículo) y hay otra persona con licencia vigente y apta para conducir, en varios casos puede evitarse la inmovilización dejándola conducir. Depende de la causal concreta.',
    norma: 'Ley 769 de 2002 y reglas de la Ley 1843 de 2017.',
    claves: 'acompañante copiloto otra persona con licencia evitar la grua evitar patios que conduzca otro tercero conductor ley 1843 ley 769',
    tip: 'Pregunta: "¿Puede conducir mi acompañante que sí tiene licencia, para evitar la inmovilización?". Pídelo por escrito en el comparendo.',
  },
  {
    id: 'embriaguez',
    cat: 'Casos graves',
    titulo: 'Negarte a la prueba de alcoholemia NO es una salida',
    dicen: 'Alguien le dice que es mejor negarse a soplar/al examen.',
    realidad: 'Negarse a la prueba, con garantías, acarrea la CANCELACIÓN de la licencia, multa de 1.440 SMDLV e inmovilización del vehículo por 20 días hábiles. Negarse es tratado como el grado más alto de embriaguez.',
    norma: 'Ley 1696 de 2013; art. 152 de la Ley 769 de 2002.',
    claves: 'embriaguez alcoholemia alcohol borracho trago tragos soplar soplo prueba de alcohol negarse a la prueba alcoholimetro ley 1696 articulo 152 art 152 cancelacion de licencia',
    tip: 'No te niegues pensando que te salva: es peor. Exige que la prueba se haga con todas las garantías y que quede registrada.',
  },
  {
    id: 'soborno',
    cat: 'Casos graves',
    titulo: 'Ningún "arreglo" en la vía: es delito',
    dicen: 'Le insinúan un "arreglo" para no hacer el comparendo, o le piden plata.',
    realidad: 'Ofrecer o aceptar dinero para evitar un comparendo es cohecho (delito) para ambas partes. No existe pago en efectivo al agente en la vía: las multas se pagan a la entidad por los canales oficiales (SIMIT).',
    norma: 'Código Penal (cohecho); Ley 769 de 2002.',
    claves: 'soborno coima mordida arreglo arreglemos plata por debajo me pide plata cohecho corrupcion delito pagar al agente',
    tip: 'No ofrezcas ni aceptes "arreglos". Si te lo piden, graba, anota datos del agente y denúncialo.',
  },
  {
    id: 'pago-sitio',
    cat: 'Casos graves',
    titulo: 'No pagas la multa en el sitio',
    dicen: 'Le dicen que pague la multa ahí mismo o con datáfono del agente.',
    realidad: 'Las multas de tránsito no se pagan en la vía. Se consultan y pagan en el SIMIT o en los puntos oficiales del organismo, donde además aplican los descuentos de ley.',
    norma: 'Ley 769 de 2002 (recaudo a través del organismo / SIMIT).',
    claves: 'pagar en el sitio pago en la via datafono efectivo aqui mismo simit donde se paga la multa canales oficiales ley 769',
    tip: 'Recibe el comparendo, pídelo legible y con número, y paga (o impugna) por los canales oficiales.',
  },
  {
    id: 'firmar-comparendo',
    cat: 'El comparendo',
    titulo: 'Firmar el comparendo NO es aceptar la culpa',
    dicen: 'No quiere firmar porque cree que firmar es aceptar la infracción.',
    realidad: 'Firmar el comparendo solo acredita que lo recibiste; no es aceptación de responsabilidad. Si no firmas, igual queda impuesto. Puedes escribir tu desacuerdo en el campo de observaciones.',
    norma: 'Ley 769 de 2002 (procedimiento del comparendo).',
    claves: 'firmar firma no quiero firmar firmar es aceptar observaciones del comparendo recibido aceptar la culpa ley 769',
    tip: 'Firma como "recibido" y escribe en observaciones tu versión (p. ej., "no estoy de acuerdo, el carro no circulaba"). Eso ayuda a la impugnación.',
  },
  {
    id: 'plazo-descuento',
    cat: 'El comparendo',
    titulo: 'Tienes descuentos y plazo para impugnar',
    dicen: 'Cree que solo le queda pagar el valor completo.',
    realidad: 'Puedes pagar con 50% de descuento haciendo el curso pedagógico dentro de 5 días hábiles (11 si es fotomulta), o 25% más adelante. O puedes impugnar en audiencia, gratis, dentro del mismo plazo.',
    norma: 'Art. 136 de la Ley 769 de 2002, modificado por la Ley 1843 de 2017.',
    claves: 'descuento 50 25 por ciento curso pedagogico plazo para pagar plazo para impugnar dias habiles audiencia articulo 136 art 136 ley 1843 reduccion de la multa',
    tip: 'Decide rápido: pagar con descuento (aceptas la infracción) o impugnar (vuelve al inicio y arma tu documento).',
  },
  {
    id: 'propietario-fotomulta',
    cat: 'Fotomultas',
    titulo: 'El dueño no responde automáticamente por la fotomulta',
    dicen: 'Le dicen que como es el dueño, paga sí o sí la fotomulta aunque no manejara.',
    realidad: 'La Corte tumbó la responsabilidad solidaria automática del propietario. Si no eras el conductor, puedes impugnar e identificar a quién manejaba. La sanción es por la conducta de conducir, que es personal.',
    norma: 'Corte Constitucional, Sentencia C-038 de 2020.',
    claves: 'fotomulta foto multa camara propietario dueño responsabilidad solidaria no manejaba no era yo el conductor presté el carro c-038 c038 sentencia 2020',
    tip: 'Si no manejabas, no pagues sin más: impugna (vuelve al inicio y elige "No era yo quien conducía").',
  },
  {
    id: 'llantas-lisas',
    cat: 'Estado del vehículo',
    titulo: 'Llantas lisas: no te pueden multar "a ojo"',
    dicen: 'El agente dice que tus llantas están lisas y te pone comparendo solo mirándolas.',
    realidad: 'La infracción por llantas lisas (código C35) requiere medición OBJETIVA con un profundímetro. El Ministerio de Transporte fue claro: no se puede sancionar "a ojo". El labrado mínimo es 1,6 mm en autos (menos de 3,5 t) y 1 mm en motos. La multa ronda los 15 SMDLV y puede haber inmovilización.',
    norma: 'Art. 28 de la Ley 769 de 2002 (condiciones técnicas); código C35; criterios del Ministerio de Transporte.',
    claves: 'llantas lisas llanta desgastada labrado profundidad profundimetro 1.6 mm sin medir a ojo c35 codigo c35 articulo 28 art 28 estado de las llantas neumaticos',
    tip: 'Pregunta: "¿Con qué profundímetro midió y cuál fue el resultado?". Si te multó solo mirando, déjalo por escrito e impugna por falta de prueba técnica.',
  },
  {
    id: 'polarizados',
    cat: 'Estado del vehículo',
    titulo: 'Vidrios polarizados: necesitan medición con fotómetro',
    dicen: 'Te multan por los vidrios polarizados con solo verlos oscuros.',
    realidad: 'Conducir con polarizado, entintado u oscurecido sin permiso es la infracción B10 (unos 8 SMDLV). Pero el comparendo debe sustentarse en una medición técnica con fotómetro/luxómetro homologado y calibrado: no basta "se ven oscuros". Con el permiso de polarizado vigente, no hay infracción.',
    norma: 'Art. 131 de la Ley 769 de 2002; código B10.',
    claves: 'vidrios polarizados polarizado entintado oscurecido tinte permiso de polarizado b10 codigo b10 fotometro luxometro medicion articulo 131 ventanas oscuras',
    tip: 'Si tienes permiso, muéstralo. Si no midieron con instrumento, exige que conste cómo determinaron el nivel; eso es atacable en la impugnación.',
  },
  {
    id: 'ninos-adelante',
    cat: 'Pasajeros y seguridad',
    titulo: 'Menores de 10 años NO van adelante',
    dicen: 'No sabías que llevar al niño en el asiento delantero (o en las piernas) es comparendo.',
    realidad: 'Los menores de 10 años no pueden viajar en el asiento delantero. Los menores de 2 años deben ir atrás en silla de retención infantil. Llevar a un niño en las piernas también es infracción (sobrecupo / sin sistema de retención).',
    norma: 'Art. 48 de la Ley 769 de 2002; sistemas de retención infantil.',
    claves: 'niños niño menor de 10 años adelante asiento delantero copiloto silla infantil sistema de retencion bebe menores de 2 años en las piernas sobrecupo articulo 48 art 48',
    tip: 'Lleva siempre a los menores atrás y, si son pequeños, en silla. Es de las multas más fáciles de evitar y de las que más protegen.',
  },
  {
    id: 'cinturon',
    cat: 'Pasajeros y seguridad',
    titulo: 'El cinturón es obligatorio para TODOS los ocupantes',
    dicen: 'Crees que el cinturón solo aplica para el conductor o los de adelante.',
    realidad: 'El uso del cinturón de seguridad es obligatorio para el conductor y todos los pasajeros que ocupen asientos con cinturón instalado, adelante y atrás. No usarlo es comparendo.',
    norma: 'Art. 82 de la Ley 769 de 2002.',
    claves: 'cinturon de seguridad obligatorio pasajeros atras adelante todos los ocupantes articulo 82 art 82 sin cinturon',
    tip: 'Que todos se abrochen antes de arrancar, incluidos los de atrás. Simple y evita la multa.',
  },
  {
    id: 'celular',
    cat: 'Pasajeros y seguridad',
    titulo: 'Usar el celular en la mano mientras conduces es infracción',
    dicen: 'Crees que "solo era un momentico" mirando el celular.',
    realidad: 'Manipular el teléfono mientras conduces (sostenerlo, escribir, mirar el mapa en la mano) es infracción. Lo permitido es usarlo en manos libres / soporte sin manipularlo.',
    norma: 'Ley 769 de 2002 (conducción segura).',
    claves: 'celular telefono en la mano manipular el celular manos libres soporte conducir usando el celular texteando whatsapp manejando',
    tip: 'Usa soporte y manos libres. Si te paran, no discutas el hecho si lo tenías en la mano; revisa que el comparendo no tenga errores.',
  },
  {
    id: 'casco-moto',
    cat: 'Motos',
    titulo: 'Casco certificado y bien puesto (el visor oscuro no está prohibido en sí)',
    dicen: 'Te dicen que el visor oscuro de tu casco es comparendo automático.',
    realidad: 'El casco es obligatorio, certificado y bien abrochado, para conductor y parrillero. Sobre el visor oscuro: no hay prohibición expresa; solo pueden sancionar si reduce tu visibilidad y por ello incumples las condiciones de seguridad. La obligación del chaleco/casco con la placa fue eliminada (verifica reglas locales).',
    norma: 'Ley 769 de 2002; Resolución 23385 de 2020 del Ministerio de Transporte (visor).',
    claves: 'casco moto motocicleta parrillero visor oscuro tipo espejo certificado chaleco con placa resolucion 23385 condiciones de seguridad casco bien puesto',
    tip: 'Usa casco certificado y bien abrochado. Si te multan por el visor, pide que indiquen en qué afecta tu visibilidad: sin eso, es atacable.',
  },
  {
    id: 'documentos-portar',
    cat: 'Documentos',
    titulo: 'Qué documentos te pueden pedir (lista)',
    dicen: 'No tienes claro qué te pueden exigir en un retén.',
    realidad: 'Te pueden pedir: licencia de conducción vigente, SOAT vigente (es digital, se verifica en el RUNT), revisión tecnomecánica vigente cuando aplique, y licencia de tránsito (tarjeta de propiedad). Los carros nuevos no requieren tecnomecánica los primeros años.',
    norma: 'Ley 769 de 2002 (documentos del conductor y del vehículo).',
    claves: 'documentos reten que me pueden pedir licencia soat tecnomecanica tarjeta de propiedad licencia de transito carros nuevos primeros años runt papeles del carro',
    tip: 'Ten todo al día y verificable en el RUNT. Lleva una foto/PDF de tus documentos por si acaso.',
  },
];

window.NormasVia = NORMAS_VIA;

/* ---------- vista del consultor (modo lookup, fuera del wizard) ---------- */
let _filtroNormas = '';

// Quita tildes y pasa a minúsculas para un match tolerante.
function normalizar(s) {
  return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function abrirNormas() { _filtroNormas = ''; renderNormas(); }

function pesos(n) { return '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }

// Devuelve el número de artículo de la Ley 769 citado en la ficha (para enlazar al
// Código), o null si la norma no es de la Ley 769 (p. ej. jurisprudencia u otra ley).
function articuloDe(n) {
  if (n.art) return n.art;
  if (!/Ley\s*769/i.test(n.norma || '')) return null;
  const m = (n.norma || '').match(/Art(?:[íi]culo)?\.?\s*(\d+)/i);
  return m ? m[1] : null;
}

// Abre el Código Nacional de Tránsito en un modal con iframe apuntando al artículo.
function verCodigo(art) {
  let m = document.getElementById('codigoModal');
  if (!m) {
    m = document.createElement('div');
    m.id = 'codigoModal';
    m.innerHTML = `
      <div class="cm-backdrop" onclick="cerrarCodigo()"></div>
      <div class="cm-panel" role="dialog" aria-label="Código Nacional de Tránsito">
        <div class="cm-bar">
          <span id="cmTitulo">Código Nacional de Tránsito</span>
          <button class="cm-close" onclick="cerrarCodigo()" aria-label="Cerrar">✕</button>
        </div>
        <iframe id="cmFrame" title="Código Nacional de Tránsito" referrerpolicy="no-referrer"></iframe>
      </div>`;
    document.body.appendChild(m);
  }
  const frame = document.getElementById('cmFrame');
  const dest = art ? ('codigo/ley-769.html#art' + art) : 'codigo/ley-769.html';
  // reasignar src fuerza el scroll al ancla aunque sea el mismo documento
  frame.src = 'about:blank';
  setTimeout(() => { frame.src = dest; }, 0);
  document.getElementById('cmTitulo').textContent = art ? ('Código de Tránsito — Artículo ' + art) : 'Código Nacional de Tránsito';
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function cerrarCodigo() {
  const m = document.getElementById('codigoModal');
  if (m) m.classList.remove('open');
  document.body.style.overflow = '';
}

function renderNormas() {
  const app = document.getElementById('app');
  const q = normalizar(_filtroNormas).trim();
  // Cada palabra del query debe aparecer (búsqueda AND, tolerante a tildes).
  const terminos = q ? q.split(/\s+/) : [];

  // Fichas de derechos en la vía.
  const lista = NORMAS_VIA.filter(n => {
    if (!terminos.length) return true;
    const heno = normalizar(n.titulo + ' ' + n.dicen + ' ' + n.realidad + ' ' + n.cat + ' ' + n.tip + ' ' + n.norma + ' ' + (n.claves || ''));
    return terminos.every(t => heno.includes(t));
  });

  // Códigos de infracción (solo se muestran al buscar algo).
  const C = (window.Codigos && window.Codigos.CODIGOS) || [];
  const T = (window.Codigos && window.Codigos.TIPOS) || {};
  const codigos = !terminos.length ? [] : C.filter(c => {
    const heno = normalizar(c.codigo + ' ' + c.desc + ' ' + (T[c.tipo] ? T[c.tipo].label : ''));
    return terminos.every(t => heno.includes(t));
  });

  const cards = lista.map(n => {
    const art = articuloDe(n);
    return `
    <div class="norma">
      <span class="norma-cat">${escN(n.cat)}</span>
      <b>${escN(n.titulo)}</b>
      <p class="norma-dicen">🗣️ <i>${escN(n.dicen)}</i></p>
      <p class="norma-real"><b>La realidad:</b> ${escN(n.realidad)}</p>
      <p class="norma-tip">✅ ${escN(n.tip)}</p>
      <p class="norma-ley">📚 ${escN(n.norma)}</p>
      ${art ? `<button class="ver-codigo" onclick="verCodigo('${art}')">📖 Ver el artículo ${escN(art)} en el Código</button>` : ''}
    </div>`;
  }).join('');

  const codigosBloque = codigos.length ? `
  <div class="card cod-card">
    <h3 class="cod-h">📋 Códigos de infracción (${codigos.length})</h3>
    ${codigos.slice(0, 40).map(c => {
      const ti = T[c.tipo] || {};
      return `<div class="cod">
        <div class="cod-top"><span class="cod-id">${escN(c.codigo)}</span>${c.inmov ? '<span class="cod-inmov">🚓 puede inmovilizar</span>' : ''}</div>
        <p class="cod-desc">${escN(c.desc)}</p>
        <p class="cod-val">${escN(ti.label || ('Tipo ' + c.tipo))} · ${ti.smldv ? ti.smldv + ' SMLDV · ' : ''}multa plena aprox. ${ti.v2025 ? pesos(ti.v2025) : 's/d'} (2025)</p>
        <button class="ver-codigo" onclick="verCodigo('131')">📖 Ver en el Código (art. 131 · Multas)</button>
      </div>`;
    }).join('')}
    ${codigos.length > 40 ? `<p class="cod-mas">…y ${codigos.length - 40} más. Afina la búsqueda.</p>` : ''}
    <p class="cod-nota">Valores referenciales 2025 (se calculan en UVB y cambian cada año). Con el curso pedagógico aplican descuentos del 50%/25%.</p>
  </div>` : '';

  const totalRes = lista.length + codigos.length;

  app.innerHTML = `
  <div class="card">
    <button class="ghost volver" onclick="render()">← Volver al inicio</button>
    <h2 class="step-title">🛑 Tus derechos en la vía</h2>
    <p class="step-sub">Busca por palabra o sinónimo ("grúa", "trago", "se llevan el carro"), por número de norma ("125", "1843", "C-038") o por <b>código de infracción</b> ("C29", "D02", "B10"). Si un agente te dice algo que no es cierto, aquí tienes con qué responder.</p>
    <input type="text" id="buscarNorma" placeholder="Busca: SOAT, grúa, C29, art 125, embriaguez…" value="${escN(_filtroNormas)}" oninput="filtrarNormas(this.value)" autocomplete="off">
    ${terminos.length ? `<p class="norma-count">${totalRes} resultado${totalRes === 1 ? '' : 's'} para "${escN(_filtroNormas.trim())}"</p>` : ''}
  </div>
  ${codigosBloque}
  ${cards}
  ${totalRes === 0 ? '<div class="card"><p>No encontramos nada con esa búsqueda. Prueba otra palabra ("SOAT", "grúa", "125") o un código ("C29", "D02").</p></div>' : ''}
  <div class="card">
    <p class="step-sub" style="margin:0">⚠️ Información de apoyo, no asesoría jurídica. Las normas y tarifas cambian; mantén la calma, sé respetuoso y verifica el caso concreto.</p>
  </div>`;

  const inp = document.getElementById('buscarNorma');
  if (inp && _filtroNormas) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
}

function filtrarNormas(v) { _filtroNormas = v; renderNormas(); }

function escN(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.abrirNormas = abrirNormas;
window.renderNormas = renderNormas;
window.filtrarNormas = filtrarNormas;
window.verCodigo = verCodigo;
window.cerrarCodigo = cerrarCodigo;
