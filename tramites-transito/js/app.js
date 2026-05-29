/*
 * app.js — Controlador del flujo (wizard). Vanilla JS, sin dependencias.
 * Pasos: objetivo → organismo → detalles/causales → el comparendo → tus datos → resultado.
 * Acceso directo aparte: "Consulta tus derechos en la vía" (renderNormas, modo lookup).
 */

const caso = {
  objetivo: null, organismoId: null, organismoNombre: '', ciudad: '',
  // causales (impugnar / recurso)
  notifTardia: false, noConducia: false, conductorNombre: '', conductorCedula: '',
  vendido: false, fechaVenta: '', senializacion: false, pruebasInsuf: false,
  erroresComparendo: false, erroresDetalle: '', fuerzaMayor: false, fuerzaMayorDetalle: '',
  dobleSancion: false, descripcionHechos: '',
  // el comparendo
  tipoComparendo: 'via', numeroComparendo: '', codigoInfraccion: '',
  fechaInfraccion: '', fechaNotificacion: '',
  numeroResolucion: '', fechaNotifResolucion: '',
  // datos personales
  nombre: '', cedula: '', placa: '', direccion: '', telefono: '', correo: '',
  fechaSolicitud: '',
};

function tramiteActual() { return (window.Tramites && window.Tramites[caso.objetivo]) || null; }
function pideDetalle(d) { const t = tramiteActual(); return !!(t && t.detalle && t.detalle.indexOf(d) !== -1); }

const TOTAL_PASOS = 5;
let paso = 0;
const app = () => document.getElementById('app');

/* ---------- helpers de render ---------- */
function progreso() {
  let dots = '';
  for (let i = 0; i < TOTAL_PASOS; i++) dots += `<div class="dot ${i <= paso ? 'on' : ''}"></div>`;
  return `<div class="progress">${dots}</div>`;
}
function optList(items, current, onpick) {
  return `<div class="options">` + items.map(it => `
    <label class="opt ${current === it.val ? 'sel' : ''}" onclick="${onpick}('${it.val}')">
      ${it.emoji ? `<span class="emoji">${it.emoji}</span>` : ''}
      <span><b>${it.label}</b>${it.desc ? `<span class="desc">${it.desc}</span>` : ''}</span>
    </label>`).join('') + `</div>`;
}
function toggle(field) {
  const v = caso[field];
  return `<div class="toggle-row">
    <label class="opt ${v === true ? 'sel' : ''}" onclick="setBool('${field}', true)"><b>Sí</b></label>
    <label class="opt ${v === false ? 'sel' : ''}" onclick="setBool('${field}', false)"><b>No</b></label>
  </div>`;
}
function setBool(field, val) { caso[field] = val; render(); }
function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---------- navegación ---------- */
function setObj(obj) { caso.objetivo = obj; render(); }
function empezar() { if (caso.objetivo) { paso = 1; render(); } }
function atras() { if (paso > 1) { paso--; render(); } else { paso = 0; render(); } }
function reiniciar() { location.reload(); }

function render() {
  if (paso === 0) return renderInicio();
  if (paso === 1) return renderOrganismo();
  if (paso === 2) return renderDetalles();
  if (paso === 3) return renderComparendo();
  if (paso === 4) return renderDatos();
  if (paso === 5) return renderResultado();
}

/* ---------- paso 0: inicio ---------- */
function renderInicio() {
  const items = Object.keys(window.Tramites).map(k => ({
    val: k, emoji: window.Tramites[k].emoji,
    label: window.Tramites[k].label, desc: window.Tramites[k].desc,
  }));
  app().innerHTML = `
  <div class="card consulta-cta">
    <h2 class="step-title">🛑 ¿Te paró un agente ahora mismo?</h2>
    <p class="step-sub">Consulta en segundos qué SÍ y qué NO puede hacer un agente de tránsito. Si te dicen algo que no es cierto, aquí tienes la norma para responder con argumentos.</p>
    <button class="primary" onclick="abrirNormas()">Consultar mis derechos en la vía</button>
  </div>

  <div class="card">
    <h2 class="step-title">¿Qué necesitas hacer?</h2>
    <p class="step-sub">Cuéntanos tu situación con un comparendo o multa y te decimos tus derechos, los plazos y te armamos el documento listo para radicar.</p>
    ${optList(items, caso.objetivo, 'setObj')}
    <div class="btns">
      <button class="primary" onclick="empezar()" ${caso.objetivo ? '' : 'disabled'}>Empezar</button>
    </div>
  </div>`;
}

/* ---------- paso 1: organismo ---------- */
function renderOrganismo() {
  const orgs = Object.values(window.Organismos).map(o => ({ val: o.id, label: o.nombre }));
  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">¿Qué organismo de tránsito?</h2>
    <p class="step-sub">Es la Secretaría de Movilidad o autoridad que impuso el comparendo. A ella va dirigido el documento.</p>
    ${optList(orgs, caso.organismoId, 'setOrganismo')}
    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="siguienteOrg()" ${caso.organismoId ? '' : 'disabled'}>Continuar</button>
    </div>
  </div>`;
}
function setOrganismo(id) {
  caso.organismoId = id;
  caso.organismoNombre = window.Organismos[id].nombre;
  render();
}
function siguienteOrg() { if (caso.organismoId) { paso = 2; render(); } }

/* ---------- paso 2: detalles / causales ---------- */
function renderDetalles() {
  let bloques = '';

  if (pideDetalle('causales')) {
    bloques += `<p class="step-sub">Marca todo lo que aplique a tu caso. Cada motivo se convierte en un argumento del documento.</p>`;

    bloques += causal('notifTardia', '📸 La fotomulta me llegó tarde o nunca me notificaron bien',
      'En fotodetección deben notificarte dentro de ~13 días hábiles. Si no, se puede tumbar.');

    bloques += causal('noConducia', '🚗 No era yo quien conducía el vehículo',
      'La responsabilidad es del conductor, no del dueño (Sentencia C-038/2020).');
    if (caso.noConducia) {
      bloques += `<div class="sub-inputs">
        ${campoLibre('conductorNombre', 'Nombre del verdadero conductor (opcional)', 'text', 'Ej.: María López')}
        ${campoLibre('conductorCedula', 'Cédula del conductor (opcional)', 'text', '')}
      </div>`;
    }

    bloques += causal('vendido', '📄 Ya había vendido / traspasado el vehículo',
      'En la fecha del comparendo el carro ya no era tuyo.');
    if (caso.vendido) {
      bloques += `<div class="sub-inputs">
        <label class="field" for="fechaVenta">Fecha de la venta/traspaso (opcional)</label>
        <input type="date" id="fechaVenta" value="${esc(caso.fechaVenta)}">
      </div>`;
    }

    bloques += causal('senializacion', '🚧 No había señal, estaba dañada o no se veía',
      'No te pueden multar por una señal inexistente o no visible.');

    bloques += causal('pruebasInsuf', '🔍 La foto/evidencia no prueba la infracción',
      'Placa ilegible, no se ve la conducta ni el conductor.');

    bloques += causal('erroresComparendo', '✍️ El comparendo tiene datos errados',
      'Placa, fecha, hora, lugar, código de infracción o agente.');
    if (caso.erroresComparendo) {
      bloques += `<div class="sub-inputs">
        ${campoLibre('erroresDetalle', '¿Cuál es el error? (opcional)', 'text', 'Ej.: la placa no es la mía')}
      </div>`;
    }

    bloques += causal('fuerzaMayor', '🚑 Fue una emergencia o fuerza mayor',
      'Urgencia médica, evitar un accidente, orden de la autoridad.');
    if (caso.fuerzaMayor) {
      bloques += `<div class="sub-inputs">
        ${campoLibre('fuerzaMayorDetalle', '¿Qué pasó? (opcional)', 'text', 'Ej.: llevaba a un familiar a urgencias')}
      </div>`;
    }

    bloques += causal('dobleSancion', '➕ Me sancionaron dos veces por el mismo hecho',
      'No te pueden castigar dos veces por lo mismo (non bis in ídem).');
  }

  bloques += `
    <label class="field" for="descripcionHechos">Cuéntalo con tus palabras <span class="hint">Opcional pero recomendado: describe brevemente qué pasó. Se incluye como "Hechos" en el documento.</span></label>
    <textarea id="descripcionHechos" placeholder="Ej.: el ${'12'} de marzo me llegó una fotomulta por exceso de velocidad, pero ese día yo había prestado el carro...">${esc(caso.descripcionHechos)}</textarea>`;

  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">Cuéntanos qué pasó</h2>
    ${bloques}
    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="guardarDetalles()">Continuar</button>
    </div>
  </div>`;
}
function causal(field, label, desc) {
  const v = caso[field] === true;
  return `<label class="opt causal ${v ? 'sel' : ''}" onclick="setBool('${field}', ${!v})">
    <span class="check">${v ? '✓' : ''}</span>
    <span><b>${label}</b><span class="desc">${desc}</span></span>
  </label>`;
}
function campoLibre(id, label, type, ph) {
  return `<label class="field" for="${id}">${label}</label>
    <input type="${type}" id="${id}" value="${esc(caso[id])}" placeholder="${esc(ph)}">`;
}
function guardarDetalles() {
  ['conductorNombre','conductorCedula','erroresDetalle','fuerzaMayorDetalle','descripcionHechos','fechaVenta'].forEach(f => {
    const v = val(f); if (v) caso[f] = v;
  });
  paso = 3; render();
}

/* ---------- paso 3: el comparendo ---------- */
function renderComparendo() {
  const t = tramiteActual();
  let bloques = '';

  if (t.pideTipo) {
    bloques += `
    <label class="field">¿Cómo te pusieron el comparendo?</label>
    ${optList([
      { val: 'via', label: 'En vía (un agente me detuvo)', desc: 'Comparendo entregado en el sitio.' },
      { val: 'electronico', label: 'Fotomulta / cámara', desc: 'Comparendo electrónico por fotodetección.' },
    ], caso.tipoComparendo, 'setTipo')}`;
  }

  bloques += campoLibre('numeroComparendo', 'Número del comparendo', 'text', 'Aparece en el comparendo o en el SIMIT');
  bloques += campoLibre('codigoInfraccion', 'Código de la infracción (opcional)', 'text', 'Ej.: C29, D02…');

  if (t.pideFechaInfra) {
    bloques += `
    <label class="field" for="fechaInfraccion">Fecha de la infracción <span class="hint">El día del hecho. Sirve para los descuentos y la prescripción (3 años).</span></label>
    <input type="date" id="fechaInfraccion" value="${esc(caso.fechaInfraccion)}">`;
  }
  if (t.pideFechaNotif && caso.tipoComparendo === 'electronico') {
    bloques += `
    <label class="field" for="fechaNotificacion">Fecha en que te notificaron la fotomulta <span class="hint">El día que te llegó. Si fue muy tarde, es causal para tumbarla.</span></label>
    <input type="date" id="fechaNotificacion" value="${esc(caso.fechaNotificacion)}">`;
  }
  if (t.pideResolucion) {
    bloques += campoLibre('numeroResolucion', 'Número de la resolución que te sancionó', 'text', '');
    bloques += `
    <label class="field" for="fechaNotifResolucion">Fecha en que te notificaron la resolución <span class="hint">Desde ahí corren los 10 días hábiles para recurrir.</span></label>
    <input type="date" id="fechaNotifResolucion" value="${esc(caso.fechaNotifResolucion)}">`;
  }

  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">El comparendo</h2>
    <p class="step-sub">Con esto calculamos tus plazos (descuentos, vencimientos y prescripción).</p>
    ${bloques}
    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="guardarComparendo()">Continuar</button>
    </div>
  </div>`;
}
function setTipo(t) { caso.tipoComparendo = t; render(); }
function guardarComparendo() {
  ['numeroComparendo','codigoInfraccion','fechaInfraccion','fechaNotificacion','numeroResolucion','fechaNotifResolucion'].forEach(f => {
    const v = val(f); if (v) caso[f] = v;
  });
  paso = 4; render();
}

/* ---------- paso 4: tus datos ---------- */
function renderDatos() {
  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">Tus datos</h2>
    <p class="step-sub">Van en el documento. No salen de tu dispositivo.</p>
    ${campoLibre('nombre','Nombre completo','text','Ej.: Juan Pérez')}
    ${campoLibre('cedula','Cédula','text','Ej.: 16.633.136')}
    ${campoLibre('placa','Placa del vehículo','text','Ej.: ABC123')}
    ${campoLibre('ciudad','Ciudad','text','Ej.: Bogotá')}
    ${campoLibre('direccion','Dirección para notificaciones','text','Calle, ciudad')}
    ${campoLibre('telefono','Teléfono de contacto','tel','')}
    ${campoLibre('correo','Correo de contacto','email','')}
    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="guardarDatos()">Ver mi plan y documento</button>
    </div>
  </div>`;
}
function guardarDatos() {
  ['nombre','cedula','placa','ciudad','direccion','telefono','correo'].forEach(f => { caso[f] = val(f) || caso[f]; });
  caso.fechaSolicitud = window.Habiles.toISODate(new Date());
  paso = 5; render();
}

/* ---------- paso 5: resultado ---------- */
function renderResultado() {
  const r = window.Reglas.evaluarCaso(caso);
  const doc = window.Plantillas.generarDoc(caso, r);
  window.__doc = doc.texto;
  window.__docHtml = window.Plantillas.generarDocHtml(caso, r);

  const palancasHtml = r.palancas.map(p => `
    <div class="palanca ${p.tono}">
      <div class="pid">${p.id}</div>
      <b>${p.titulo}</b>
      <p>${p.texto}</p>
    </div>`).join('');

  app().innerHTML = `
  <div class="card">
    <h2 class="step-title">Tu plan</h2>
    <p class="step-sub">Esto es lo que la ley te permite en tu caso:</p>
    ${palancasHtml || '<p>Selecciona al menos un motivo para ver tus argumentos.</p>'}
  </div>

  <div class="card">
    <h2 class="step-title">${r.doc.titulo}</h2>
    <p class="step-sub">Listo para radicar. Revísalo, complétalo si quedó algo entre corchetes y cópialo o descárgalo.</p>
    <div class="doc" id="docBox">${esc(window.__doc)}</div>
    <div class="doc-actions">
      <button class="primary" onclick="copiarDoc()">Copiar texto</button>
      <button class="ghost" onclick="descargarDoc()">Descargar (.txt)</button>
      <button class="ghost" onclick="imprimirDoc()">Imprimir / Guardar PDF</button>
    </div>
  </div>

  <div class="card">
    <h2 class="step-title">¿Y ahora qué hago?</h2>
    <ol class="pasos">${pasosFinales(r)}</ol>
    <div class="btns">
      <button class="ghost" onclick="reiniciar()">Empezar otro caso</button>
    </div>
  </div>`;
}

function pasosFinales(r) {
  const org = r.organismo;
  const canal = org.canales && org.canales.radica ? org.canales.radica : 'Radica en la ventanilla o canal de PQRS del organismo de tránsito. Consulta y paga en el SIMIT.';
  const web = org.canales && org.canales.web ? ` (${org.canales.web})` : '';
  if (r.doc.tipo === 'peticion') {
    return `
      <li><b>Radica el derecho de petición por escrito</b> ante el organismo${web}. ${canal}</li>
      <li><b>Exige el número de radicado.</b> Es tu prueba y desde ahí corren los 15 días hábiles.</li>
      <li><b>Si no responden a tiempo:</b> el silencio se entiende negativo, pero puedes presentar acción de tutela por la omisión de respuesta.</li>
      <li><b>Con la respuesta en mano</b> decides el siguiente paso (impugnar, recurso o pagar con descuento si aún alcanza).</li>`;
  }
  if (r.doc.tipo === 'recurso') {
    return `
      <li><b>Radica el recurso por escrito</b> ante el organismo que profirió la resolución${web}, dentro de los 10 días hábiles desde la notificación.</li>
      <li><b>Exige el número de radicado.</b> Es tu prueba.</li>
      <li><b>Adjunta tus pruebas</b> (contrato de venta, fotos, historia clínica, etc., según tu caso).</li>
      <li><b>Si confirman la sanción:</b> queda la vía contencioso-administrativa (nulidad y restablecimiento) y vigilar la prescripción del cobro.</li>`;
  }
  // impugnación
  return `
      <li><b>Radica este escrito</b> ante el organismo de tránsito${web} y pide que se programe la AUDIENCIA pública. ${canal}</li>
      <li><b>Exige el número de radicado.</b> Es tu prueba de que impugnaste a tiempo.</li>
      <li><b>Prepara y lleva tus pruebas</b> a la audiencia (fotos del lugar, contrato de venta, soportes médicos, etc.).</li>
      <li><b>No pagues si vas a impugnar:</b> pagar el comparendo equivale a aceptar la infracción.</li>
      <li><b>Si te fallan en contra:</b> presenta recurso de reposición y apelación (vuelve aquí y elige "recurso").</li>`;
}

/* ---------- documento: copiar / descargar / imprimir ---------- */
function copiarDoc() {
  navigator.clipboard.writeText(window.__doc).then(
    () => toast('Texto copiado ✔'),
    () => toast('No se pudo copiar; selecciona y copia manualmente')
  );
}
function descargarDoc() {
  const blob = new Blob([window.__doc], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'documento-transito.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}
function imprimirDoc() {
  const w = window.open('', '_blank');
  if (!w) { toast('Permite las ventanas emergentes para generar el PDF'); return; }
  w.document.write(window.__docHtml);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 350);
}

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t);
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1f2933;color:#fff;padding:12px 20px;border-radius:10px;z-index:9;font-size:15px;'; }
  t.textContent = msg; t.style.opacity = '1';
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; }, 1800);
}

document.addEventListener('DOMContentLoaded', render);
