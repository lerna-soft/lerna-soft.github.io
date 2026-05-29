/*
 * codigos.js — Catálogo de códigos de infracción del Código Nacional de Tránsito.
 * Permite buscar por código (C29, D02, B10…) o por la descripción de la conducta.
 *
 * Fuente: Resolución 003027 de 2010 (codificación de infracciones) y tabla de
 * autoliquidación 2025 de la Secretaría Distrital de Movilidad de Bogotá
 * (Ley 769 de 2002, mod. Ley 1383 de 2010 y Ley 1696 de 2013).
 *
 * tipo: letra del grupo. smldv: equivalencia histórica en salarios mínimos diarios.
 * v2025: valor pleno aproximado 2025 (referencial; cambia cada año, calculado en UVB).
 * inmov: la conducta puede implicar inmovilización del vehículo.
 */

const TIPOS = {
  A: { label: 'Tipo A · vehículo no automotor', smldv: 4,  v2025: 161150 },
  B: { label: 'Tipo B',  smldv: 8,   v2025: 321839 },
  C: { label: 'Tipo C',  smldv: 15,  v2025: 604054 },
  D: { label: 'Tipo D',  smldv: 30,  v2025: 1207762 },
  E: { label: 'Tipo E',  smldv: 45,  v2025: 1811816 },
  F: { label: 'Tipo F · peatón', smldv: 1, v2025: 40432 },
};

const CODIGOS = [
  // ---- A: vehículo no automotor / tracción animal ----
  ['A01','A','No transitar por la derecha de la vía.'],
  ['A02','A','Agarrarse de otro vehículo en circulación.'],
  ['A03','A','Transportar personas o cosas que disminuyan la visibilidad e incomoden la conducción.'],
  ['A04','A','Transitar por andenes y lugares destinados a peatones.'],
  ['A05','A','No respetar las señales de tránsito.'],
  ['A06','A','Transitar sin los dispositivos luminosos requeridos.'],
  ['A07','A','Transitar sin dispositivos de parada inmediata o con ellos en estado defectuoso.'],
  ['A08','A','Transitar por zonas prohibidas.'],
  ['A09','A','Adelantar entre dos vehículos automotores que estén en sus carriles.'],
  ['A10','A','Conducir por la vía férrea o por zonas de protección y seguridad.'],
  ['A11','A','Transitar por zonas restringidas o vías de alta velocidad (autopistas/arterias).', true],
  ['A12','A','Prestar servicio público con vehículo no automotor.', true],

  // ---- B: conductor de automotor (infracciones menores, 8 SMLDV) ----
  ['B01','B','Conducir sin llevar consigo la licencia de conducción.'],
  ['B02','B','Conducir con la licencia de conducción vencida.'],
  ['B03','B','Conducir sin placas, o sin el permiso vigente de la autoridad de tránsito.', true],
  ['B04','B','Conducir con placas adulteradas.', true],
  ['B05','B','Conducir con una sola placa, o sin el permiso vigente.', true],
  ['B06','B','Conducir con placas falsas.', true],
  ['B07','B','No informar el cambio de motor o color del vehículo.', true],
  ['B08','B','No pagar el peaje en los sitios establecidos.'],
  ['B09','B','Usar equipos de sonido a volúmenes que incomoden a los pasajeros de un vehículo público.'],
  ['B10','B','Conducir con vidrios polarizados, entintados u oscurecidos sin portar el permiso respectivo.'],
  ['B11','B','Conducir con propaganda, publicidad o adhesivos en los vidrios que obstaculicen la visibilidad.'],
  ['B12','B','No respetar las normas para el tránsito de cortejos fúnebres.'],
  ['B13','B','No respetar formaciones de tropas, desfiles, procesiones, entierros, filas o manifestaciones autorizadas.'],
  ['B14','B','Remolcar otro vehículo violando lo dispuesto en el Código.'],
  ['B15','B','Conducir vehículo de servicio público sin el aviso de tarifas oficiales legible (o deteriorado/adulterado).'],
  ['B16','B','Llevar animales u objetos que incomoden a los pasajeros en un vehículo de servicio público.'],
  ['B17','B','Abandonar un vehículo de servicio público con pasajeros.'],
  ['B18','B','Conducir transporte público individual de pasajeros sin cumplir el Código.'],
  ['B19','B','Cargue o descargue en sitios y horas prohibidas.'],
  ['B20','B','Transportar alimentos corruptibles en vehículos que no cumplan las condiciones fijadas.'],
  ['B21','B','Lavar vehículos en vía pública, ríos, canales o quebradas.'],
  ['B22','B','Llevar niños menores de diez (10) años en el asiento delantero.'],
  ['B23','B','Usar equipos de sonido a volúmenes excesivos, o pantallas/proyectores adelante en movimiento.'],

  // ---- C: conductor de automotor (graves, 15 SMLDV) ----
  ['C01','C','Presentar licencia de conducción adulterada o ajena.', true],
  ['C02','C','Estacionar un vehículo en sitios prohibidos.'],
  ['C03','C','Bloquear una calzada o intersección con un vehículo (salvo por accidente).'],
  ['C04','C','Estacionar sin precauciones o sin colocar las señales de peligro reglamentarias.'],
  ['C05','C','No reducir la velocidad en cruces escolares, de hospitales o terminales.'],
  ['C06','C','No usar el cinturón de seguridad por parte de los ocupantes del vehículo.'],
  ['C07','C','No señalizar con direccionales (o con la mano) la maniobra de giro o cambio de carril.'],
  ['C08','C','Transitar sin los dispositivos luminosos requeridos o sin los elementos del Código.'],
  ['C09','C','No respetar las señales en cruce férreo, o conducir por la vía férrea o sus zonas de protección.'],
  ['C10','C','Conducir con una o varias puertas abiertas.'],
  ['C11','C','No portar el equipo de prevención y seguridad (botiquín, extintor, etc.).'],
  ['C12','C','Proveer combustible con el motor encendido.'],
  ['C13','C','Conducir sin las adaptaciones pertinentes cuando el conductor tiene limitación física.'],
  ['C14','C','Transitar por sitios restringidos o en horas prohibidas (pico y placa).', true],
  ['C15','C','Exceder la capacidad de pasajeros autorizada en la licencia de tránsito (sobrecupo).'],
  ['C16','C','Conducir vehículo escolar sin el permiso o los distintivos reglamentarios.', true],
  ['C17','C','Circular con combinaciones de dos o más unidades remolcadas sin autorización.'],
  ['C18','C','Taxímetro dañado, con sellos rotos, calibración vencida/adulterada o ausente.'],
  ['C19','C','Dejar o recoger pasajeros en sitios distintos de los demarcados.'],
  ['C20','C','Transportar materiales de construcción o a granel sin las medidas de protección.', true],
  ['C21','C','No asegurar la carga para evitar que caigan cosas en la vía.', true],
  ['C22','C','Transportar carga de dimensiones superiores a las autorizadas sin requisitos.', true],
  ['C23','C','Dar enseñanza práctica para conducir en vía pública sin estar autorizado.'],
  ['C24','C','Conducir motocicleta sin observar las normas del Código.'],
  ['C25','C','Transitar por el carril izquierdo a velocidad que entorpezca el tránsito (habiendo más de un carril).'],
  ['C26','C','Transitar en vehículos de 3,5 t o más por el carril izquierdo habiendo más de un carril.'],
  ['C27','C','Conducir con carga o pasajeros que obstruyan la visibilidad o el control del vehículo.', true],
  ['C28','C','Usar dispositivos propios de vehículos de emergencia sin serlo.'],
  ['C29','C','Conducir a velocidad superior a la máxima permitida (exceso de velocidad).'],
  ['C30','C','No atender una señal de ceda el paso.'],
  ['C31','C','No acatar las señales o requerimientos de los agentes de tránsito.'],
  ['C32','C','No respetar el paso de peatones ni darles la prelación en las franjas establecidas.'],
  ['C33','C','Poner el vehículo en marcha sin las precauciones para evitar choques.'],
  ['C34','C','Reparar el vehículo en vías, parque o acera sin atender el procedimiento del Código.'],
  ['C35','C','No realizar la revisión técnico-mecánica vigente, o no estar en condiciones técnico-mecánicas/emisiones adecuadas (incluye llantas lisas).', true],
  ['C36','C','Transportar carga en contenedores sin los dispositivos especiales de sujeción.', true],
  ['C37','C','Transportar pasajeros en el platón de una camioneta o en plataforma de carga.'],
  ['C38','C','Usar el celular o sistemas de comunicación al conducir sin accesorios de manos libres.'],
  ['C39','C','Vulnerar las reglas de estacionamiento del artículo 77 del Código.'],
  ['C40','C','Estacionar (con movilidad normal) en espacios demarcados para personas con movilidad reducida.'],

  // ---- D: muy graves (30 SMLDV) ----
  ['D01','D','Guiar un vehículo sin haber obtenido la licencia de conducción.', true],
  ['D02','D','Conducir sin portar los seguros ordenados por la ley (SOAT).', true],
  ['D03','D','Transitar en sentido contrario al de la vía, calzada o carril.', true],
  ['D04','D','No detenerse ante luz roja/amarilla, señal de PARE o semáforo intermitente en rojo.', true],
  ['D05','D','Conducir sobre aceras, plazas, vías peatonales, separadores, bermas o zonas verdes.', true],
  ['D06','D','Adelantar en berma, túnel, puente, curva, paso a nivel, cruce no regulado o cima de cuesta.', true],
  ['D07','D','Conducir realizando maniobras altamente peligrosas e irresponsables.', true],
  ['D08','D','Conducir sin luces o con dispositivos luminosos dañados cuando el Código los exige.', true],
  ['D09','D','No permitir el paso de los vehículos de emergencia.'],
  ['D10','D','Conducir transporte escolar con exceso de velocidad.'],
  ['D11','D','Permitir servicio público de pasajeros sin las salidas de emergencia exigidas.'],
  ['D12','D','Destinar el vehículo a un servicio distinto al de su licencia de tránsito (sin autorización).', true],
  ['D13','D','Transportar carga con peso superior al autorizado.', true],
  ['D14','D','Movilizarse con combustibles no regulados (gas propano u otros peligrosos).', true],
  ['D15','D','Cambiar el recorrido/trazado de ruta de transporte público autorizado.', true],
  ['D16','D','Arrojar residuos sólidos al espacio público desde un vehículo.'],
  ['D17','D','Infringir normas de emisión de contaminantes o de generación de ruido.'],

  // ---- E: gravísimas (servicio público) ----
  ['E01','E','Proveer combustible a servicio público con pasajeros a bordo.'],
  ['E02','E','Negarse a prestar el servicio público sin causa justificada (con alteración del orden).'],
  ['E04','E','Transportar a la vez personas y sustancias peligrosas (explosivos, tóxicos, etc.).', true],

  // ---- F: peatones (1 SMLDV) ----
  ['F01','F','Invadir la zona de vehículos o transitar en ella en patines, patinetas o similares.'],
  ['F02','F','Llevar sin precauciones elementos que obstaculicen el tránsito.'],
  ['F03','F','Cruzar por sitios no permitidos o transitar sobre el guardavías del ferrocarril.'],
  ['F04','F','Colocarse delante o detrás de un vehículo con el motor encendido.'],
  ['F05','F','Remolcarse de vehículos en movimiento.'],
  ['F06','F','Actuar de manera que ponga en peligro su integridad física.'],
  ['F07','F','Cruzar la vía entre el tráfico donde existen pasos peatonales.'],
  ['F09','F','Subirse o bajarse de los vehículos en movimiento.'],
].map(([codigo, tipo, desc, inmov]) => ({ codigo, tipo, desc, inmov: !!inmov }));

window.Codigos = { CODIGOS, TIPOS };
