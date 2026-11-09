// =====================================================================
// PÁGINA DE ENVÍOS · inicio de despacho y de flota
// Lista los envíos con su cliente (objeto compuesto por ms-envios) y,
// según el rol, permite crear, editar (cambiar estado) y eliminar.
// =====================================================================
const ESTADOS = { registrado: 'Registrado', en_transito: 'En tránsito', entregado: 'Entregado', devuelto: 'Devuelto' };
const usuario = Sesion.exigir('envios.html');
const puedeEscribir = false;   // semana 2: Sesion.puedeEscribir('envios') muestra crear, editar y eliminar
let filtro = usuario?.rol === 'flota' ? 'por_despachar' : '';

if (usuario) {
  pintarEncabezado('envios.html');
  document.getElementById('aviso').innerHTML = avisoModo();
  if (usuario.rol === 'flota') {
    document.getElementById('titulo').textContent = 'Envíos por despachar';
    document.getElementById('subtitulo').textContent = 'Envíos registrados y en tránsito con su cliente y destino';
  } else {
    document.getElementById('subtitulo').textContent = 'Envíos de LogiRed con su cliente y destino';
  }
  pintarHerramientas();
  cargar();
}

function pintarHerramientas() {
  const h = document.getElementById('herramientas');
  h.innerHTML = `
    <select id="filtro" aria-label="Filtrar por estado">
      <option value="">Todos los estados</option>
      <option value="por_despachar">Por despachar</option>
      ${Object.entries(ESTADOS).map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}
    </select>
    ${puedeEscribir ? '<button class="boton" id="nuevo">+ Nuevo envío</button>' : ''}`;
  const sel = document.getElementById('filtro');
  sel.value = filtro;
  sel.addEventListener('change', () => { filtro = sel.value; cargar(); });
  if (puedeEscribir) document.getElementById('nuevo').addEventListener('click', () => formulario());
}

async function cargar() {
  try {
    const query = filtro && filtro !== 'por_despachar' ? `?estado=${filtro}` : '';
    let envios = await Api.listar('envios', query);
    if (filtro === 'por_despachar') envios = envios.filter((e) => e.estado === 'registrado' || e.estado === 'en_transito');
    else if (filtro) envios = envios.filter((e) => e.estado === filtro);
    pintarTabla(envios);
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}

function textoCliente(e) {
  return e.cliente
    ? `${escapar(e.cliente.nombre)}<span class="sub">${escapar(e.cliente.ciudad)}</span>`
    : `<span class="sub">Cliente ${e.cliente_id} (no disponible)</span>`;
}

function pintarTabla(envios) {
  const tabla = document.getElementById('tabla');
  if (envios.length === 0) {
    tabla.innerHTML = '<tbody><tr><td class="vacio">No hay envíos con este filtro.</td></tr></tbody>';
    return;
  }
  tabla.innerHTML = `
    <thead><tr><th>Guía</th><th>Cliente</th><th>Destino</th><th>Peso</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
    <tbody>${envios.map((e) => `
      <tr>
        <td data-etiqueta="Guía"><strong>${escapar(e.numero_guia)}</strong></td>
        <td data-etiqueta="Cliente">${textoCliente(e)}</td>
        <td data-etiqueta="Destino">${escapar(e.ciudad_destino)}<span class="sub">${escapar(e.direccion_destino)}</span></td>
        <td data-etiqueta="Peso">${e.peso_kg} kg</td>
        <td data-etiqueta="Estado"><span class="estado estado-${e.estado}">${ESTADOS[e.estado] || e.estado}</span></td>
        <td data-etiqueta="Registro">${escapar(e.fecha_registro)}</td>
        <td class="celda-acciones"><div class="acciones">
          <button class="boton boton-secundario boton-peque" data-ver="${e.id}">Ver</button>
          ${puedeEscribir ? `
            <button class="boton boton-secundario boton-peque" data-editar="${e.id}">Editar</button>
            <button class="boton boton-peligro boton-peque" data-eliminar="${e.id}">Eliminar</button>` : ''}
        </div></td>
      </tr>`).join('')}</tbody>`;
  const buscar = (id) => envios.find((e) => e.id === Number(id));
  tabla.querySelectorAll('[data-ver]').forEach((b) => b.onclick = () => detalle(buscar(b.dataset.ver)));
  tabla.querySelectorAll('[data-editar]').forEach((b) => b.onclick = () => formulario(buscar(b.dataset.editar)));
  tabla.querySelectorAll('[data-eliminar]').forEach((b) => b.onclick = () => eliminar(buscar(b.dataset.eliminar)));
}

function detalle(e) {
  abrirDetalle(`Envío ${e.numero_guia}`, [
    ['Cliente', e.cliente ? `${escapar(e.cliente.nombre)} (${escapar(e.cliente.ciudad)})` : `Id ${e.cliente_id}`],
    ['Peso', `${e.peso_kg} kg`],
    ['Ciudad destino', escapar(e.ciudad_destino)],
    ['Dirección', escapar(e.direccion_destino)],
    ['Estado', `<span class="estado estado-${e.estado}">${ESTADOS[e.estado]}</span>`],
    ['Registrado el', escapar(e.fecha_registro)],
  ]);
}

async function formulario(envio) {
  let clientes;
  try {
    clientes = await Api.listar('clientes');
  } catch (error) {
    return mostrarMensaje(textoError(error), 'error');
  }
  const campos = [
    { nombre: 'numero_guia', etiqueta: 'Número de guía', ayuda: 'LR-2026-000123' },
    { nombre: 'cliente_id', etiqueta: 'Cliente', tipo: 'select-numero', vacio: 'Seleccione…',
      opciones: clientes.map((c) => ({ valor: c.id, texto: `${c.nombre} · ${c.ciudad}` })) },
    { nombre: 'peso_kg', etiqueta: 'Peso (kg)', tipo: 'number', paso: '0.01' },
    { nombre: 'ciudad_destino', etiqueta: 'Ciudad de destino' },
    { nombre: 'direccion_destino', etiqueta: 'Dirección de destino', ancho: true },
  ];
  if (envio) {
    campos.push({ nombre: 'estado', etiqueta: 'Estado', tipo: 'select', ancho: true,
      opciones: Object.entries(ESTADOS).map(([v, t]) => ({ valor: v, texto: t })) });
  }
  abrirFormulario({
    titulo: envio ? `Editar envío ${envio.numero_guia}` : 'Nuevo envío',
    campos,
    valores: envio || {},
    guardar: async (datos) => {
      if (envio) await Api.actualizar('envios', envio.id, datos);
      else await Api.crear('envios', datos);
      mostrarMensaje(envio ? 'Envío actualizado' : 'Envío registrado');
      cargar();
    },
  });
}

async function eliminar(e) {
  if (!(await confirmar(`¿Eliminar el envío ${e.numero_guia}?`))) return;
  try {
    await Api.eliminar('envios', e.id);
    mostrarMensaje('Envío eliminado');
    cargar();
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}
