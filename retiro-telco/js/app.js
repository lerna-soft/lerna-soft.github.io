/*
 * app.js — Controlador del flujo (wizard). Vanilla JS, sin dependencias.
 * Pasos: objetivo → operador/servicio → detalles → fechas → datos → resultado.
 */

const caso = {
  objetivo: null, operadorId: null, operadorNombre: '', servicio: null,
  tieneFallas: false, servicioQueFalla: null, fallasDesde: '',
  visitaFantasma: false, cobroIndebido: false, cobroDescripcion: '',
  fechaCorte: '', fechaSolicitud: '', yaRadicoRetiro: false, cunRetiro: '',
  nombre: '', cedula: '', contrato: '', referentePago: '', direccion: '',
  ciudad: '', telefono: '', correo: '', valorFactura: '',
};

const TOTAL_PASOS = 5;
let paso = 0;
const app = () => document.getElementById('app');

function setObj(obj) { caso.objetivo = obj; render(); }

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
function toggle(field, label) {
  const v = caso[field];
  return `<div class="toggle-row">
    <label class="opt ${v === true ? 'sel' : ''}" onclick="setBool('${field}', true)"><b>Sí</b></label>
    <label class="opt ${v === false ? 'sel' : ''}" onclick="setBool('${field}', false)"><b>No</b></label>
  </div>`;
}
function setBool(field, val) { caso[field] = val; render(); }
function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }

/* ---------- navegación ---------- */
function siguiente() { saveStep(); if (paso < TOTAL_PASOS) { paso++; render(); } }
function atras() { if (paso > 1) { paso--; render(); } else { paso = 0; render(); } }

function saveStep() {
  if (paso === 1) {
    caso.servicio = caso.servicio || 'paquete';
  }
  if (paso === 2) {
    caso.fallasDesde = val('fallasDesde') || caso.fallasDesde;
    caso.cobroDescripcion = val('cobroDescripcion') || caso.cobroDescripcion;
  }
  if (paso === 3) {
    caso.fechaCorte = val('fechaCorte') || caso.fechaCorte;
    caso.cunRetiro = val('cunRetiro') || caso.cunRetiro;
  }
  if (paso === 4) {
    ['nombre','cedula','contrato','referentePago','direccion','ciudad','telefono','correo'].forEach(f => {
      const v = val(f); if (v) caso[f] = v;
    });
  }
}

/* ---------- pasos ---------- */
function render() {
  if (paso === 0) return renderInicio();
  if (paso === 1) return renderOperador();
  if (paso === 2) return renderDetalles();
  if (paso === 3) return renderFechas();
  if (paso === 4) return renderDatos();
  if (paso === 5) return renderResultado();
}

function renderInicio() {
  app().innerHTML = `
  <div class="card">
    <h2 class="step-title">¿Qué necesitas hacer?</h2>
    <p class="step-sub">Cuéntanos tu situación y nosotros nos encargamos de decirte tus derechos y armarte el documento.</p>
    ${optList([
      { val: 'cancelar', emoji: '🚪', label: 'Cancelar / retirarme', desc: 'Quiero terminar el contrato con mi operador.' },
      { val: 'falla', emoji: '📡', label: 'Mi servicio falla', desc: 'Internet/TV/teléfono no sirve bien y quiero reclamar.' },
      { val: 'cobro', emoji: '💸', label: 'Me cobran de más', desc: 'Hay cobros que no reconozco o no me corresponden.' },
    ], caso.objetivo, 'setObj')}
    <div class="btns">
      <button class="primary" onclick="empezar()" ${caso.objetivo ? '' : 'disabled'}>Empezar</button>
    </div>
  </div>`;
}
function empezar() { if (caso.objetivo) { paso = 1; render(); } }

function renderOperador() {
  const ops = Object.values(window.Operadores).map(o => ({ val: o.id, label: o.nombre }));
  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">Tu operador y servicio</h2>
    <p class="step-sub">Esto nos dice por dónde radicar y qué reglas aplican.</p>
    <label class="field">¿Con qué operador?</label>
    ${optList(ops, caso.operadorId, 'setOperador')}
    <label class="field">¿Qué servicio es?</label>
    ${optList([
      { val: 'paquete', label: 'Paquete hogar (varios servicios)' },
      { val: 'internet', label: 'Internet' },
      { val: 'tv', label: 'Televisión' },
      { val: 'telefonia', label: 'Telefonía' },
    ], caso.servicio, 'setServicio')}
    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="siguiente()" ${caso.operadorId && caso.servicio ? '' : 'disabled'}>Continuar</button>
    </div>
  </div>`;
}
function setOperador(id) { caso.operadorId = id; render(); }
function setServicio(s) { caso.servicio = s; render(); }

function renderDetalles() {
  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">Cuéntanos qué pasó</h2>
    <p class="step-sub">Marca lo que aplique. Con esto elegimos tus palancas legales.</p>

    <label class="field">¿El servicio ha tenido fallas? <span class="hint">Cortes, lentitud, o que no funcione.</span></label>
    ${toggle('tieneFallas')}
    ${caso.tieneFallas ? `
      <label class="field" for="fallasDesde">¿Desde cuándo? <span class="hint">Ej.: “desde enero de 2025” o “desde el inicio del servicio”.</span></label>
      <input type="text" id="fallasDesde" value="${esc(caso.fallasDesde)}" placeholder="desde inicios de 2025">` : ''}

    <label class="field">¿Reportaron una visita técnica que en realidad no ocurrió? <span class="hint">Dijeron que fueron y “nadie abrió”, pero no fueron.</span></label>
    ${toggle('visitaFantasma')}

    <label class="field">¿Hay cobros que no reconoces o no te corresponden?</label>
    ${toggle('cobroIndebido')}
    ${caso.cobroIndebido ? `
      <label class="field" for="cobroDescripcion">¿Cuál cobro? <span class="hint">Descríbelo en pocas palabras.</span></label>
      <textarea id="cobroDescripcion" placeholder="Ej.: me cobran un mes adicional / un servicio que no pedí">${esc(caso.cobroDescripcion)}</textarea>` : ''}

    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="guardarDetalles()">Continuar</button>
    </div>
  </div>`;
}
function guardarDetalles() {
  caso.fallasDesde = val('fallasDesde') || caso.fallasDesde;
  caso.cobroDescripcion = val('cobroDescripcion') || caso.cobroDescripcion;
  if (caso.tieneFallas && !caso.servicioQueFalla) caso.servicioQueFalla = caso.servicio === 'paquete' ? 'internet' : caso.servicio;
  paso = 3; render();
}

function renderFechas() {
  const necesitaCorte = caso.objetivo === 'cancelar';
  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">Fechas y radicados</h2>
    <p class="step-sub">Con esto calculamos tus plazos (incluido el día en que “ganas” si no responden).</p>

    ${necesitaCorte ? `
    <label class="field" for="fechaCorte">Fecha de corte de tu factura <span class="hint">Aparece en la factura. Sirve para no pagar un mes de más.</span></label>
    <input type="date" id="fechaCorte" value="${esc(caso.fechaCorte)}">` : ''}

    <label class="field">¿Ya radicaste la solicitud (o piensas radicar hoy)?</label>
    ${toggle('yaRadicoRetiro')}
    ${caso.yaRadicoRetiro ? `
      <label class="field" for="cunRetiro">Número de radicado (CUN) <span class="hint">Si lo tienes. Es tu prueba.</span></label>
      <input type="text" id="cunRetiro" value="${esc(caso.cunRetiro)}" placeholder="Ej.: 99997784280">` : ''}

    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="guardarFechas()">Continuar</button>
    </div>
  </div>`;
}
function guardarFechas() {
  caso.fechaCorte = val('fechaCorte') || caso.fechaCorte;
  caso.cunRetiro = val('cunRetiro') || caso.cunRetiro;
  caso.fechaSolicitud = window.Habiles.toISODate(new Date());
  paso = 4; render();
}

function renderDatos() {
  app().innerHTML = `
  <div class="card">
    ${progreso()}
    <h2 class="step-title">Tus datos</h2>
    <p class="step-sub">Van en el documento. No salen de tu dispositivo.</p>
    ${campo('nombre','Nombre completo del titular','text','Ej.: Juan Pérez')}
    ${campo('cedula','Cédula','text','Ej.: 16.633.136')}
    ${campo('contrato','Número de contrato','text','Aparece en la factura')}
    ${campo('referentePago','Referente de pago (opcional)','text','')}
    ${campo('direccion','Dirección de instalación','text','Calle, ciudad')}
    ${campo('ciudad','Ciudad','text','Ej.: Cali')}
    ${campo('telefono','Teléfono de contacto','tel','')}
    ${campo('correo','Correo de contacto','email','')}
    <div class="btns">
      <button class="ghost" onclick="atras()">Atrás</button>
      <button class="primary" onclick="guardarDatos()">Ver mi plan y documento</button>
    </div>
  </div>`;
}
function guardarDatos() {
  ['nombre','cedula','contrato','referentePago','direccion','ciudad','telefono','correo'].forEach(f => { caso[f] = val(f) || caso[f]; });
  paso = 5; render();
}
function campo(id, label, type, ph) {
  return `<label class="field" for="${id}">${label}</label>
    <input type="${type}" id="${id}" value="${esc(caso[id])}" placeholder="${esc(ph)}">`;
}

/* ---------- resultado ---------- */
function renderResultado() {
  const r = window.Reglas.evaluarCaso(caso);
  const doc = window.Plantillas.generarPQR(caso, r);
  window.__doc = doc.texto;

  // plazos
  let plazosHtml = '';
  if (r.ventana) {
    plazosHtml += r.ventana.alcanza
      ? `<div class="aviso exito"><b>Llegas a tiempo ✔</b>Avisaste con ${r.ventana.diasHabilesAntelacion} días hábiles de antelación: no deberían cobrarte el mes siguiente.</div>`
      : `<div class="aviso urgente"><b>Ojo con el plazo</b>Solo hay ${r.ventana.diasHabilesAntelacion} días hábiles antes del corte (el límite era el ${window.Reglas.fmt(r.ventana.fechaLimite)}). Para cancelación voluntaria podrían cobrar el siguiente ciclo — por eso usamos las palancas de fallas/incumplimiento.</div>`;
  }
  if (caso.yaRadicoRetiro || caso.objetivo) {
    const base = caso.fechaSolicitud ? window.Habiles.parseISODate(caso.fechaSolicitud) : new Date();
    const sap = window.Habiles.fechaSAP(base);
    plazosHtml += `<div class="aviso exito"><b>⭐ Tu fecha clave: ${window.Reglas.fmt(sap)}</b>Si para esa fecha no te han respondido (15 días hábiles), opera el Silencio Administrativo Positivo: ganas automáticamente.</div>`;
  }

  const palancasHtml = r.palancas.map(p => `
    <div class="palanca ${p.tono}">
      <div class="pid">${p.id}</div>
      <b>${p.titulo}</b>
      <p>${p.texto}</p>
    </div>`).join('');

  const op = r.operador;
  const canalWeb = op.canales && op.canales.web ? `<a href="${op.canales.web}" target="_blank" rel="noopener">${op.canales.web}</a>` : 'el formulario de PQR en la web de tu operador';
  const canalApp = op.canales && op.canales.app ? op.canales.app : 'la app de tu operador';

  app().innerHTML = `
  <div class="card">
    <h2 class="step-title">Tu plan</h2>
    <p class="step-sub">Esto es lo que la ley te permite en tu caso:</p>
    ${palancasHtml}
    ${plazosHtml}
  </div>

  <div class="card">
    <h2 class="step-title">Tu documento (PQR)</h2>
    <p class="step-sub">Listo para radicar. Revísalo y cópialo o descárgalo.</p>
    <div class="doc" id="docBox">${esc(window.__doc)}</div>
    <div class="doc-actions">
      <button class="primary" onclick="copiarDoc()">Copiar texto</button>
      <button class="ghost" onclick="descargarDoc()">Descargar (.txt)</button>
      <button class="ghost" onclick="imprimirDoc()">Imprimir / Guardar PDF</button>
    </div>
  </div>

  <div class="card">
    <h2 class="step-title">¿Y ahora qué hago?</h2>
    <ol class="pasos">
      ${caso.visitaFantasma ? `<li><b>Guarda el video de tus cámaras.</b> Cuando el operador te informe la fecha y hora de la “visita”, extrae ese segmento para probar que no fueron.</li>` : ''}
      <li><b>Radica el PQR por escrito</b> (no solo por teléfono): en ${canalWeb} o desde ${canalApp}. Pega el texto o súbelo como soporte.</li>
      <li><b>Exige el número de radicado (CUN).</b> Es tu prueba y desde ahí corre el reloj de 15 días hábiles.</li>
      <li><b>Espera la respuesta.</b> No pueden exigirte pagar la factura en disputa para atenderte.</li>
      <li><b>Si no responden a tiempo o responden en contra:</b> usa <a href="https://sicfacilita.sic.gov.co" target="_blank" rel="noopener">SIC Facilita</a> (mediación gratis) y, si hace falta, queja formal ante la SIC.</li>
    </ol>
    <div class="btns">
      <button class="ghost" onclick="reiniciar()">Empezar otro caso</button>
    </div>
  </div>`;
}

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
  a.download = 'PQR.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}
function imprimirDoc() {
  const w = window.open('', '_blank');
  w.document.write(`<pre style="font-family:Georgia,serif;white-space:pre-wrap;font-size:13px;line-height:1.5;padding:24px">${esc(window.__doc)}</pre>`);
  w.document.close(); w.focus(); w.print();
}
function reiniciar() { location.reload(); }

function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t);
    t.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:#1f2933;color:#fff;padding:12px 20px;border-radius:10px;z-index:9;font-size:15px;'; }
  t.textContent = msg; t.style.opacity = '1';
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; }, 1800);
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', render);
