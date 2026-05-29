/*
 * normas.js — Consultor de derechos en la vía ("cuando te para un agente").
 * Base de conocimiento buscable: qué SÍ y qué NO puede hacer un agente de tránsito,
 * con la norma para responder con argumentos en el momento.
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
  },
  {
    id: 'identificacion',
    cat: 'Tus derechos',
    titulo: 'El agente debe identificarse',
    dicen: 'Un agente sin identificación clara pretende imponer un comparendo.',
    realidad: 'El agente debe estar uniformado e identificado, y el comparendo debe indicar quién lo impone, la fecha, el lugar, la norma presuntamente infringida y el código de la infracción. Tienes derecho a saber con quién hablas y por qué.',
    norma: 'Ley 769 de 2002 (procedimiento del comparendo).',
    tip: 'Pide nombre, placa institucional y el motivo concreto. Anótalo. Un comparendo sin estos datos es atacable.',
  },
  {
    id: 'retener-licencia',
    cat: 'Documentos',
    titulo: 'No te pueden retener la licencia (salvo embriaguez)',
    dicen: 'Le dicen que le retienen la licencia "hasta que pague" o como garantía.',
    realidad: 'Ninguna autoridad puede retener tu licencia de conducción como garantía de pago. La excepción es la retención preventiva en casos de embriaguez, que se registra de inmediato en el RUNT.',
    norma: 'Corte Constitucional, Sentencia C-521 de 1999; Ley 1696 de 2013 (caso embriaguez).',
    tip: 'Si no es por embriaguez, di: "La Corte (C-521/1999) prohíbe retener la licencia. Impóngame el comparendo si corresponde, pero no puede quedarse con mi documento".',
  },
  {
    id: 'soat-tecno-quieto',
    cat: 'Documentos',
    titulo: 'SOAT o tecnomecánica vencidos: solo si circulas',
    dicen: 'Le dicen que le inmovilizan el carro estacionado por tener el SOAT o la tecnomecánica vencidos.',
    realidad: 'La infracción por SOAT o revisión tecnomecánica vencidos se configura solo si el vehículo está CIRCULANDO. Si está estacionado o guardado y no transita, no procede comparendo ni inmovilización por ese motivo.',
    norma: 'Ley 769 de 2002; criterio reiterado (la conducta sancionable es transitar).',
    tip: 'Si el carro estaba quieto, déjalo por escrito en el comparendo ("EL VEHÍCULO NO SE ENCONTRABA EN CIRCULACIÓN") y luego impúgnalo.',
  },
  {
    id: 'soat-tecno-circula',
    cat: 'Documentos',
    titulo: 'Circular sin SOAT o sin tecnomecánica sí se sanciona',
    dicen: '¿Es verdad que multan e inmovilizan por circular sin SOAT?',
    realidad: 'Sí. Conducir sin SOAT vigente se sanciona (alrededor de 30 SMDLV) y puede llevar a inmovilización; sin revisión tecnomecánica vigente, multa adicional (alrededor de 15 SMDLV). Aquí la ley sí está del lado de la autoridad.',
    norma: 'Ley 769 de 2002, arts. 131 y siguientes.',
    tip: 'No es un caso para "tumbar": lo mejor es regularizar los documentos. Verifica que el comparendo no tenga errores de datos.',
  },
  {
    id: 'licencia-digital',
    cat: 'Documentos',
    titulo: 'La licencia y el SOAT pueden verificarse digitalmente',
    dicen: 'Le dicen que es comparendo por no llevar los documentos físicos encima.',
    realidad: 'El SOAT es digital y se verifica en el RUNT; la licencia y la tarjeta de propiedad también se consultan en el sistema. Si tus documentos están vigentes y registrados, el agente puede verificarlos electrónicamente.',
    norma: 'SOAT digital (normativa vigente); RUNT.',
    tip: 'Pide que verifique en el RUNT antes de imponer comparendo por "no portar". Si igual lo impone, impúgnalo probando que estaban vigentes.',
  },
  {
    id: 'inmovilizacion',
    cat: 'Inmovilización',
    titulo: 'La inmovilización tiene causales tasadas',
    dicen: 'Le dicen que le llevan el carro a patios "por cualquier" infracción.',
    realidad: 'La inmovilización solo procede en las causales que señala la ley (p. ej., embriaguez, sin licencia válida, sin SOAT circulando, entre otras). No toda infracción permite llevarse el vehículo. La inmovilización cesa al subsanar la causa.',
    norma: 'Art. 125 de la Ley 769 de 2002 (modificado por la Ley 1843 de 2017).',
    tip: 'Pregunta cuál es la causal EXACTA de inmovilización. Si la infracción no está en la lista del art. 125, no procede llevarse el carro.',
  },
  {
    id: 'tercero-conductor',
    cat: 'Inmovilización',
    titulo: 'A veces un tercero con licencia puede evitar la grúa',
    dicen: 'Le inmovilizan el carro porque usted no tiene licencia, pero su acompañante sí.',
    realidad: 'Cuando la causa de inmovilización es del conductor (no del vehículo) y hay otra persona con licencia vigente y apta para conducir, en varios casos puede evitarse la inmovilización dejándola conducir. Depende de la causal concreta.',
    norma: 'Ley 769 de 2002 y reglas de la Ley 1843 de 2017.',
    tip: 'Pregunta: "¿Puede conducir mi acompañante que sí tiene licencia, para evitar la inmovilización?". Pídelo por escrito en el comparendo.',
  },
  {
    id: 'embriaguez',
    cat: 'Casos graves',
    titulo: 'Negarte a la prueba de alcoholemia NO es una salida',
    dicen: 'Alguien le dice que es mejor negarse a soplar/al examen.',
    realidad: 'Negarse a la prueba, con garantías, acarrea la CANCELACIÓN de la licencia, multa de 1.440 SMDLV e inmovilización del vehículo por 20 días hábiles. Negarse es tratado como el grado más alto de embriaguez.',
    norma: 'Ley 1696 de 2013; art. 152 de la Ley 769 de 2002.',
    tip: 'No te niegues pensando que te salva: es peor. Exige que la prueba se haga con todas las garantías y que quede registrada.',
  },
  {
    id: 'soborno',
    cat: 'Casos graves',
    titulo: 'Ningún "arreglo" en la vía: es delito',
    dicen: 'Le insinúan un "arreglo" para no hacer el comparendo, o le piden plata.',
    realidad: 'Ofrecer o aceptar dinero para evitar un comparendo es cohecho (delito) para ambas partes. No existe pago en efectivo al agente en la vía: las multas se pagan a la entidad por los canales oficiales (SIMIT).',
    norma: 'Código Penal (cohecho); Ley 769 de 2002.',
    tip: 'No ofrezcas ni aceptes "arreglos". Si te lo piden, graba, anota datos del agente y denúncialo.',
  },
  {
    id: 'pago-sitio',
    cat: 'Casos graves',
    titulo: 'No pagas la multa en el sitio',
    dicen: 'Le dicen que pague la multa ahí mismo o con datáfono del agente.',
    realidad: 'Las multas de tránsito no se pagan en la vía. Se consultan y pagan en el SIMIT o en los puntos oficiales del organismo, donde además aplican los descuentos de ley.',
    norma: 'Ley 769 de 2002 (recaudo a través del organismo / SIMIT).',
    tip: 'Recibe el comparendo, pídelo legible y con número, y paga (o impugna) por los canales oficiales.',
  },
  {
    id: 'firmar-comparendo',
    cat: 'El comparendo',
    titulo: 'Firmar el comparendo NO es aceptar la culpa',
    dicen: 'No quiere firmar porque cree que firmar es aceptar la infracción.',
    realidad: 'Firmar el comparendo solo acredita que lo recibiste; no es aceptación de responsabilidad. Si no firmas, igual queda impuesto. Puedes escribir tu desacuerdo en el campo de observaciones.',
    norma: 'Ley 769 de 2002 (procedimiento del comparendo).',
    tip: 'Firma como "recibido" y escribe en observaciones tu versión (p. ej., "no estoy de acuerdo, el carro no circulaba"). Eso ayuda a la impugnación.',
  },
  {
    id: 'plazo-descuento',
    cat: 'El comparendo',
    titulo: 'Tienes descuentos y plazo para impugnar',
    dicen: 'Cree que solo le queda pagar el valor completo.',
    realidad: 'Puedes pagar con 50% de descuento haciendo el curso pedagógico dentro de 5 días hábiles (11 si es fotomulta), o 25% más adelante. O puedes impugnar en audiencia, gratis, dentro del mismo plazo.',
    norma: 'Art. 136 de la Ley 769 de 2002, modificado por la Ley 1843 de 2017.',
    tip: 'Decide rápido: pagar con descuento (aceptas la infracción) o impugnar (vuelve al inicio y arma tu documento).',
  },
  {
    id: 'propietario-fotomulta',
    cat: 'Fotomultas',
    titulo: 'El dueño no responde automáticamente por la fotomulta',
    dicen: 'Le dicen que como es el dueño, paga sí o sí la fotomulta aunque no manejara.',
    realidad: 'La Corte tumbó la responsabilidad solidaria automática del propietario. Si no eras el conductor, puedes impugnar e identificar a quién manejaba. La sanción es por la conducta de conducir, que es personal.',
    norma: 'Corte Constitucional, Sentencia C-038 de 2020.',
    tip: 'Si no manejabas, no pagues sin más: impugna (vuelve al inicio y elige "No era yo quien conducía").',
  },
];

window.NormasVia = NORMAS_VIA;

/* ---------- vista del consultor (modo lookup, fuera del wizard) ---------- */
let _filtroNormas = '';

function abrirNormas() { _filtroNormas = ''; renderNormas(); }

function renderNormas() {
  const app = document.getElementById('app');
  const q = _filtroNormas.trim().toLowerCase();
  const lista = NORMAS_VIA.filter(n => {
    if (!q) return true;
    return (n.titulo + ' ' + n.dicen + ' ' + n.realidad + ' ' + n.cat + ' ' + n.tip).toLowerCase().includes(q);
  });

  const cards = lista.map(n => `
    <div class="norma">
      <span class="norma-cat">${escN(n.cat)}</span>
      <b>${escN(n.titulo)}</b>
      <p class="norma-dicen">🗣️ <i>${escN(n.dicen)}</i></p>
      <p class="norma-real"><b>La realidad:</b> ${escN(n.realidad)}</p>
      <p class="norma-tip">✅ ${escN(n.tip)}</p>
      <p class="norma-ley">📚 ${escN(n.norma)}</p>
    </div>`).join('');

  app.innerHTML = `
  <div class="card">
    <button class="ghost volver" onclick="render()">← Volver al inicio</button>
    <h2 class="step-title">🛑 Tus derechos en la vía</h2>
    <p class="step-sub">Busca tu situación. Si un agente te dice algo que no es cierto, aquí tienes la norma para responder con argumentos y, muchas veces, evitar el comparendo o la inmovilización.</p>
    <input type="text" id="buscarNorma" placeholder="Busca: SOAT, grabar, licencia, grúa, embriaguez…" value="${escN(_filtroNormas)}" oninput="filtrarNormas(this.value)" autocomplete="off">
  </div>
  ${cards || '<div class="card"><p>No encontramos nada con esa palabra. Prueba con otra (ej.: "SOAT", "licencia", "grúa").</p></div>'}
  <div class="card">
    <p class="step-sub" style="margin:0">⚠️ Información de apoyo, no asesoría jurídica. Las normas y tarifas cambian; mantén la calma, sé respetuoso y verifica el caso concreto.</p>
  </div>`;

  const inp = document.getElementById('buscarNorma');
  if (inp && q) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
}

function filtrarNormas(v) { _filtroNormas = v; renderNormas(); }

function escN(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

window.abrirNormas = abrirNormas;
window.renderNormas = renderNormas;
window.filtrarNormas = filtrarNormas;
