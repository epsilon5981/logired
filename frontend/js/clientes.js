// =====================================================================
// PÁGINA DE CLIENTES · administrador y despacho
// =====================================================================
const usuario = Sesion.exigir('clientes.html');
const puedeEscribir = Sesion.puedeEscribir('clientes');
let ciudad = '';

if (usuario) {
  pintarEncabezado('clientes.html');
  document.getElementById('aviso').innerHTML = avisoModo();
  document.getElementById('subtitulo').textContent = 'Empresas que contratan los envíos de LogiRed';
  document.getElementById('herramientas').innerHTML = `
    <input id="ciudad" type="search" placeholder="Filtrar por ciudad" aria-label="Filtrar por ciudad">
    ${puedeEscribir ? '<button class="boton" id="nuevo">+ Nuevo cliente</button>' : ''}`;
  document.getElementById('ciudad').addEventListener('change', (e) => { ciudad = e.target.value.trim(); cargar(); });
  if (puedeEscribir) document.getElementById('nuevo').addEventListener('click', () => formulario());
  cargar();
}

// Compara sin tildes ni mayúsculas (igual que MySQL con ?ciudad=)
const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

async function cargar() {
  try {
    let clientes = await Api.listar('clientes', ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : '');
    if (ciudad) clientes = clientes.filter((c) => normalizar(c.ciudad) === normalizar(ciudad));
    pintarTabla(clientes);
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}

function pintarTabla(clientes) {
  const tabla = document.getElementById('tabla');
  if (clientes.length === 0) {
    tabla.innerHTML = '<tbody><tr><td class="vacio">No hay clientes con este filtro.</td></tr></tbody>';
    return;
  }
  tabla.innerHTML = `
    <thead><tr><th>Cliente</th><th>NIT</th><th>Ciudad</th><th>Teléfono</th><th>Estado</th><th></th></tr></thead>
    <tbody>${clientes.map((c) => `
      <tr>
        <td data-etiqueta="Cliente"><strong>${escapar(c.nombre)}</strong><span class="sub">${escapar(c.email)}</span></td>
        <td data-etiqueta="NIT">${escapar(c.nit)}</td>
        <td data-etiqueta="Ciudad">${escapar(c.ciudad)}<span class="sub">${escapar(c.direccion)}</span></td>
        <td data-etiqueta="Teléfono">${escapar(c.telefono)}</td>
        <td data-etiqueta="Estado"><span class="estado estado-${c.activo ? 'activo' : 'inactivo'}">${c.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td class="celda-acciones"><div class="acciones">
          ${puedeEscribir ? `
            <button class="boton boton-secundario boton-peque" data-editar="${c.id}">Editar</button>
            <button class="boton boton-peligro boton-peque" data-eliminar="${c.id}">Eliminar</button>` : ''}
        </div></td>
      </tr>`).join('')}</tbody>`;
  const buscar = (id) => clientes.find((c) => c.id === Number(id));
  tabla.querySelectorAll('[data-editar]').forEach((b) => b.onclick = () => formulario(buscar(b.dataset.editar)));
  tabla.querySelectorAll('[data-eliminar]').forEach((b) => b.onclick = () => eliminar(buscar(b.dataset.eliminar)));
}

function formulario(cliente) {
  abrirFormulario({
    titulo: cliente ? `Editar ${cliente.nombre}` : 'Nuevo cliente',
    campos: [
      { nombre: 'nombre', etiqueta: 'Nombre o razón social', ancho: true },
      { nombre: 'nit', etiqueta: 'NIT', ayuda: '900123456-7' },
      { nombre: 'telefono', etiqueta: 'Teléfono', ayuda: '6023456789' },
      { nombre: 'email', etiqueta: 'Correo', tipo: 'email', ancho: true },
      { nombre: 'ciudad', etiqueta: 'Ciudad' },
      { nombre: 'direccion', etiqueta: 'Dirección' },
      { nombre: 'activo', etiqueta: 'Cliente activo', tipo: 'checkbox', ancho: true },
    ],
    valores: cliente || {},
    guardar: async (datos) => {
      if (cliente) await Api.actualizar('clientes', cliente.id, datos);
      else await Api.crear('clientes', datos);
      mostrarMensaje(cliente ? 'Cliente actualizado' : 'Cliente creado');
      cargar();
    },
  });
}

async function eliminar(c) {
  if (!(await confirmar(`¿Eliminar el cliente ${c.nombre}?`))) return;
  try {
    await Api.eliminar('clientes', c.id);
    mostrarMensaje('Cliente eliminado');
    cargar();
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}
