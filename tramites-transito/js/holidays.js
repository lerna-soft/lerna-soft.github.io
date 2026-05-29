/*
 * holidays.js — Días hábiles en Colombia (festivos Ley Emiliani).
 * Compartido conceptualmente con tramites-telco. Mantener la lista al día por año.
 * Fuente: calendario oficial de festivos de Colombia. (2025-2027)
 */

const FESTIVOS_CO = {
  2025: [
    '2025-01-01', '2025-01-06', '2025-03-24', '2025-04-17', '2025-04-18',
    '2025-05-01', '2025-06-02', '2025-06-23', '2025-06-30', '2025-07-20',
    '2025-08-07', '2025-08-18', '2025-10-13', '2025-11-03', '2025-11-17',
    '2025-12-08', '2025-12-25',
  ],
  2026: [
    '2026-01-01', '2026-01-12', '2026-03-23', '2026-04-02', '2026-04-03',
    '2026-05-01', '2026-05-18', '2026-06-08', '2026-06-15', '2026-06-29',
    '2026-07-20', '2026-08-07', '2026-08-17', '2026-10-12', '2026-11-02',
    '2026-11-16', '2026-12-08', '2026-12-25',
  ],
  2027: [
    '2027-01-01', '2027-01-11', '2027-03-22', '2027-03-25', '2027-03-26',
    '2027-05-01', '2027-05-10', '2027-05-31', '2027-06-07', '2027-07-05',
    '2027-07-20', '2027-08-07', '2027-08-16', '2027-10-18', '2027-11-01',
    '2027-11-15', '2027-12-08', '2027-12-25',
  ],
};

/** Convierte un Date a 'YYYY-MM-DD' en hora local. */
function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse 'YYYY-MM-DD' a Date local (sin desfase de zona horaria). */
function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function esFestivo(date) {
  const lista = FESTIVOS_CO[date.getFullYear()] || [];
  return lista.includes(toISODate(date));
}

/** True si es día hábil (lun-vie y no festivo). */
function esDiaHabil(date) {
  const dow = date.getDay(); // 0=dom, 6=sab
  return dow !== 0 && dow !== 6 && !esFestivo(date);
}

function sumarDias(date, n) {
  const r = new Date(date);
  r.setDate(r.getDate() + n);
  return r;
}

/** Suma `n` días hábiles a `date` (n>0). Devuelve el n-ésimo día hábil siguiente. */
function sumarDiasHabiles(date, n) {
  let d = new Date(date);
  let contados = 0;
  while (contados < n) {
    d = sumarDias(d, 1);
    if (esDiaHabil(d)) contados++;
  }
  return d;
}

/**
 * Cuenta días hábiles en el intervalo [desde, hasta) — incluye `desde`,
 * excluye `hasta`.
 */
function contarDiasHabiles(desde, hasta) {
  let count = 0;
  let d = new Date(desde);
  while (d < hasta) {
    if (esDiaHabil(d)) count++;
    d = sumarDias(d, 1);
  }
  return count;
}

/** Suma `n` años calendario a `date`. Usado para la prescripción (3 años). */
function sumarAnios(date, n) {
  const r = new Date(date);
  r.setFullYear(r.getFullYear() + n);
  return r;
}

/** Fecha límite de respuesta a un derecho de petición: 15 días hábiles. */
function fechaRespuestaPeticion(fechaRadicado) {
  return sumarDiasHabiles(fechaRadicado, 15);
}

window.Habiles = {
  toISODate, parseISODate, esDiaHabil, sumarDias, sumarDiasHabiles,
  contarDiasHabiles, sumarAnios, fechaRespuestaPeticion,
};
