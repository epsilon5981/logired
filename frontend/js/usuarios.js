// =====================================================================
// PÁGINA DE USUARIOS · solo administrador (datos de ms-usuarios)
// =====================================================================
const ROL_TEXTO = { administrador: 'Administrador', despacho: 'Despacho', flota: 'Flota' };
const usuario = Sesion.exigir('usuarios.html');

if (usuario) {
  pintarEncabezado('usuarios.html');
  document.getElementById('aviso').innerHTML = avisoModo();
  document.getElementById('subtitulo').textContent = 'Cuentas de acceso a la aplicación y su rol';
  document.getElementById('herramientas').innerHTML = '<button class="boton" id="nuevo">+ Nuevo usuario</button>';
  document.getElementById('nuevo').addEventListener('click', () => formulario());
  cargar();
}

async function cargar() {
  try {
    pintarTabla(await Api.listar('usuarios'));
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}

function pintarTabla(usuarios) {
  const tabla = document.getElementById('tabla');
  tabla.innerHTML = `
    <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
    <tbody>${usuarios.map((u) => `
      <tr>
        <td data-etiqueta="Nombre"><strong>${escapar(u.nombre)}</strong></td>
        <td data-etiqueta="Correo">${escapar(u.email)}</td>
        <td data-etiqueta="Rol">${ROL_TEXTO[u.rol] || escapar(u.rol)}</td>
        <td data-etiqueta="Estado"><span class="estado estado-${u.activo ? 'activo' : 'inactivo'}">${u.activo ? 'Activo' : 'Inactivo'}</span></td>
        <td class="celda-acciones"><div class="acciones">
          <button class="boton boton-secundario boton-peque" data-editar="${u.id}">Editar</button>
          <button class="boton boton-peligro boton-peque" data-eliminar="${u.id}">Eliminar</button>
        </div></td>
      </tr>`).join('')}</tbody>`;
  const buscar = (id) => usuarios.find((u) => u.id === Number(id));
  tabla.querySelectorAll('[data-editar]').forEach((b) => b.onclick = () => formulario(buscar(b.dataset.editar)));
  tabla.querySelectorAll('[data-eliminar]').forEach((b) => b.onclick = () => eliminar(buscar(b.dataset.eliminar)));
}

function formulario(u) {
  const campos = [
    { nombre: 'nombre', etiqueta: 'Nombre', ancho: true },
    { nombre: 'email', etiqueta: 'Correo', tipo: 'email', ancho: true },
    { nombre: 'rol', etiqueta: 'Rol', tipo: 'select', opciones: Object.entries(ROL_TEXTO).map(([v, t]) => ({ valor: v, texto: t })) },
  ];
  if (!u) campos.push({ nombre: 'password', etiqueta: 'Contraseña', tipo: 'password' });
  campos.push({ nombre: 'activo', etiqueta: 'Usuario activo', tipo: 'checkbox', ancho: true });
  abrirFormulario({
    titulo: u ? `Editar ${u.nombre}` : 'Nuevo usuario',
    campos,
    valores: u || {},
    guardar: async (datos) => {
      if (u) await Api.actualizar('usuarios', u.id, datos);
      else await Api.crear('usuarios', datos);
      mostrarMensaje(u ? 'Usuario actualizado' : 'Usuario creado');
      cargar();
    },
  });
}

async function eliminar(u) {
  if (!(await confirmar(`¿Eliminar el usuario ${u.nombre}?`))) return;
  try {
    await Api.eliminar('usuarios', u.id);
    mostrarMensaje('Usuario eliminado');
    cargar();
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}
